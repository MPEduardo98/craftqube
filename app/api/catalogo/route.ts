// app/api/catalogo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool }                       from "@/app/global/lib/db/pool";
import type { RowDataPacket }         from "mysql2";

const ORDER_MAP: Record<string, string> = {
  reciente:    "p.created_at DESC",
  precio_asc:  "precio ASC",
  precio_desc: "precio DESC",
  az:          "p.titulo ASC",
  za:          "p.titulo DESC",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q         = searchParams.get("q")     ?? "";
  const cat       = searchParams.get("cat")   ?? "";
  const marca     = searchParams.get("marca") ?? "";
  const soloStock = searchParams.get("stock") === "1";
  const sort      = searchParams.get("sort")  ?? "reciente";
  const page      = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit     = Math.min(48, Math.max(12, Number(searchParams.get("limit") ?? 24)));
  const offset    = (page - 1) * limit;
  const orderClause = ORDER_MAP[sort] ?? "p.created_at DESC";

  const params: (string | number)[] = [];
  const wheres: string[] = ["p.estado = 'activo'", "p.deleted_at IS NULL"];

  if (q) {
    wheres.push("(p.titulo LIKE ? OR v.sku LIKE ? OR m.nombre LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (cat) {
    wheres.push(`EXISTS (
      SELECT 1 FROM producto_categorias pc2
      INNER JOIN categorias c2 ON c2.id = pc2.categoria_id
      WHERE pc2.producto_id = p.id AND c2.slug = ?
    )`);
    params.push(cat);
  }
  if (marca) {
    wheres.push("m.nombre = ?");
    params.push(marca);
  }
  if (soloStock) {
    wheres.push("(v.stock > 0 OR v.vender_sin_existencia = 1)");
  }

  const whereSQL = wheres.length ? `WHERE ${wheres.join(" AND ")}` : "";

  const baseSQL = `
    FROM productos p
    LEFT JOIN producto_categorias pc ON pc.producto_id = p.id
    LEFT JOIN categorias c           ON c.id = pc.categoria_id
    LEFT JOIN marcas m               ON m.id = p.marca_id
    LEFT JOIN producto_variantes v   ON v.producto_id = p.id AND v.es_default = 1
    LEFT JOIN producto_imagenes img  ON img.producto_id = p.id
                                     AND img.variante_id IS NULL
                                     AND img.id = (
                                       SELECT MIN(id) FROM producto_imagenes
                                       WHERE producto_id = p.id AND variante_id IS NULL
                                     )
    ${whereSQL}
  `;

  try {
    const [[countRows], [rows]] = await Promise.all([
      pool.execute<RowDataPacket[]>(
        `SELECT COUNT(DISTINCT p.id) AS total ${baseSQL}`,
        params
      ),
      pool.execute<RowDataPacket[]>(
        `SELECT
          p.id,
          p.titulo,
          p.descripcion,
          p.slug,
          MIN(c.nombre)                          AS categoria,
          MIN(c.slug)                            AS categoria_slug,
          m.nombre                               AS marca,
          v.sku,
          v.precio_final                         AS precio,
          v.precio_original,
          v.stock,
          v.es_default,
          SUBSTRING_INDEX(MIN(img.url), '/', -1) AS imagen_nombre,
          MIN(img.alt)                           AS imagen_alt
        ${baseSQL}
        GROUP BY
          p.id, p.titulo, p.descripcion, p.slug,
          m.nombre, v.sku, v.precio_final, v.precio_original,
          v.stock, v.es_default, p.created_at
        ORDER BY ${orderClause}
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
    ]);

    const total = (countRows[0]?.total as number) ?? 0;
    const pages = Math.ceil(total / limit);

    return NextResponse.json(
      { success: true, data: rows, meta: { total, page, limit, pages } },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("[/api/catalogo] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Error al conectar con la base de datos" },
      { status: 500 }
    );
  }
}