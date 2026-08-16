// app/api/admin/productos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool }                       from "@/shared/lib/db/pool";
import type { RowDataPacket } from "mysql2";
import { crearProducto } from "@/features/admin/productos/lib/crearProducto";

const ORDER_MAP: Record<string, string> = {
  updated_at_desc: "p.updated_at DESC",
  updated_at_asc:  "p.updated_at ASC",
  titulo_asc:      "p.titulo ASC",
  titulo_desc:     "p.titulo DESC",
  precio_asc:      "MIN(v.precio_final) ASC",
  precio_desc:     "MIN(v.precio_final) DESC",
  stock_asc:       "COALESCE(SUM(v.stock), 0) ASC",
  stock_desc:      "COALESCE(SUM(v.stock), 0) DESC",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q      = searchParams.get("q")      ?? "";
  const estado = searchParams.get("estado") ?? "";
  const sort   = searchParams.get("sort")   ?? "updated_at_desc";
  const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const offset = (page - 1) * limit;

  const orderClause = ORDER_MAP[sort] ?? ORDER_MAP.updated_at_desc;

  const params: (string | number)[] = [];
  const wheres: string[] = ["p.deleted_at IS NULL"];

  if (q.trim()) {
    wheres.push("(p.titulo LIKE ? OR m.nombre LIKE ? OR c.nombre LIKE ?)");
    params.push(`%${q.trim()}%`, `%${q.trim()}%`, `%${q.trim()}%`);
  }
  if (estado) {
    wheres.push("p.estado = ?");
    params.push(estado);
  }

  const whereSQL = `WHERE ${wheres.join(" AND ")}`;

  try {
    const [[{ total }]] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT p.id) AS total
       FROM productos p
       LEFT JOIN marcas m              ON m.id = p.marca_id
       LEFT JOIN producto_categorias pc ON pc.producto_id = p.id
       LEFT JOIN categorias c          ON c.id = pc.categoria_id
       ${whereSQL}`,
      params
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         p.id, p.titulo, p.slug, p.estado,
         MIN(v.precio_final) AS precio,
         COALESCE(SUM(v.stock), 0) AS stock,
         (SELECT pi.url FROM producto_imagenes pi WHERE pi.producto_id = p.id ORDER BY pi.orden ASC LIMIT 1) AS imagen_url,
         GROUP_CONCAT(DISTINCT c.nombre ORDER BY c.nombre SEPARATOR ', ') AS categorias,
         m.nombre AS marca
       FROM productos p
       LEFT JOIN producto_variantes v      ON v.producto_id = p.id
       LEFT JOIN marcas m                  ON m.id = p.marca_id
       LEFT JOIN producto_categorias pc    ON pc.producto_id = p.id
       LEFT JOIN categorias c              ON c.id = pc.categoria_id
       ${whereSQL}
       GROUP BY p.id, p.titulo, p.slug, p.estado, m.nombre, p.updated_at
       ORDER BY ${orderClause}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const pages = Math.ceil(Number(total) / limit);
    return NextResponse.json({ success: true, data: rows, meta: { total: Number(total), page, limit, pages } });
  } catch (err) {
    console.error("[GET /api/admin/productos]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

/* ── POST ───────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const {
      titulo, slug, estado, marca_id, descripcion,
      meta_titulo, meta_descripcion,
      categorias = [], variantes = [], imagenes = [], metacampos = [], envio = null,
    } = body;

    if (!titulo?.trim() || !slug?.trim()) {
      conn.release();
      return NextResponse.json({ success: false, error: "Título y slug son requeridos" }, { status: 400 });
    }

    await conn.beginTransaction();

    const productoId = await crearProducto(conn, {
      titulo, slug, estado, marca_id: marca_id ? Number(marca_id) : null, descripcion, meta_titulo, meta_descripcion,
      categorias, variantes, imagenes, metacampos, envio,
    });

    await conn.commit();
    return NextResponse.json({ success: true, data: { id: productoId } });
  } catch (err: unknown) {
    await conn.rollback();
    console.error("[POST /api/admin/productos]", err);
    const isDuplicate = (err as NodeJS.ErrnoException & { code?: string }).code === "ER_DUP_ENTRY";
    return NextResponse.json(
      { success: false, error: isDuplicate ? "El slug o SKU ya existe" : "Error al crear" },
      { status: isDuplicate ? 409 : 500 }
    );
  } finally {
    conn.release();
  }
}