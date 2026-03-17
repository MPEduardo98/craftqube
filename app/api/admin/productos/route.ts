// app/api/admin/productos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool }                       from "@/app/global/lib/db/pool";
import type { RowDataPacket }         from "mysql2";

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