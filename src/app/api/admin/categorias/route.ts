// app/api/admin/categorias/route.ts
// ─────────────────────────────────────────────────────────────
// GET  /api/admin/categorias  → lista todas las categorías (panel admin)
// POST /api/admin/categorias  → crea una nueva categoría
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                      from "@/shared/lib/db/pool";
import { slugify }                   from "@/features/admin/productos/components/producto-form-types";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

/* Orden permitido (whitelist: nunca interpolar entrada del usuario en SQL). */
const SORT_SQL: Record<string, string> = {
  nombre_asc:    "c.nombre ASC",
  nombre_desc:   "c.nombre DESC",
  productos_asc: "total_productos ASC, c.nombre ASC",
  productos_desc:"total_productos DESC, c.nombre ASC",
  id_desc:       "c.id DESC",
  id_asc:        "c.id ASC",
};

export async function GET(req: NextRequest) {
  try {
    const sp     = req.nextUrl.searchParams;
    const q      = (sp.get("q") ?? "").trim();
    const tipo   = sp.get("tipo") ?? "";          // "" | "principal" | "sub"
    const sort   = SORT_SQL[sp.get("sort") ?? ""] ?? SORT_SQL.nombre_asc;
    const page   = Math.max(1, Number(sp.get("page")) || 1);
    const limit  = Math.min(100, Math.max(1, Number(sp.get("limit")) || 20));
    const offset = (page - 1) * limit;

    const where:  string[] = [];
    const params: (string | number)[] = [];

    if (q) {
      where.push("(c.nombre LIKE ? OR c.slug LIKE ? OR p.nombre LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (tipo === "principal") where.push("c.parent_id IS NULL");
    if (tipo === "sub")       where.push("c.parent_id IS NOT NULL");

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        c.id, c.nombre, c.slug, c.descripcion, c.imagen, c.parent_id,
        p.nombre AS parent_nombre,
        COUNT(DISTINCT pc.producto_id) AS total_productos
      FROM categorias c
      LEFT JOIN categorias p           ON p.id = c.parent_id
      LEFT JOIN producto_categorias pc ON pc.categoria_id = c.id
      ${whereSql}
      GROUP BY c.id, c.nombre, c.slug, c.descripcion, c.imagen, c.parent_id, p.nombre
      ORDER BY ${sort}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const [[{ total }]] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) AS total
      FROM categorias c
      LEFT JOIN categorias p ON p.id = c.parent_id
      ${whereSql}
    `, params);

    return NextResponse.json({
      success: true,
      data:    rows,
      meta:    { total: Number(total), page, limit, pages: Math.max(1, Math.ceil(Number(total) / limit)) },
    });
  } catch (err) {
    console.error("[GET /api/admin/categorias]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nombre = body.nombre?.trim();

    if (!nombre) {
      return NextResponse.json(
        { success: false, error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const slug        = body.slug?.trim() || slugify(nombre);
    const descripcion = body.descripcion?.trim() || null;
    const imagen      = body.imagen?.trim() || null;
    const parentId    = body.parent_id ? Number(body.parent_id) : null;

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO categorias (nombre, slug, descripcion, imagen, parent_id) VALUES (?, ?, ?, ?, ?)`,
      [nombre, slug, descripcion, imagen, parentId]
    );

    const id = result.insertId;

    return NextResponse.json({
      success: true,
      data: { id, nombre, slug, descripcion, imagen, parent_id: parentId },
    });
  } catch (err: unknown) {
    const isDuplicate =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ER_DUP_ENTRY";

    if (isDuplicate) {
      return NextResponse.json(
        { success: false, error: "Ya existe una categoría con ese nombre o slug" },
        { status: 409 }
      );
    }

    console.error("[POST /api/admin/categorias]", err);
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
