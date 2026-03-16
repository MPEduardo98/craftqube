// app/api/productos/relacionados/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool }                       from "@/app/global/lib/db/pool";
import type { RowDataPacket }         from "mysql2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoriaSlug = searchParams.get("categoria") ?? "";
  const excluirSlug   = searchParams.get("excluir")   ?? "";
  const limit         = Math.min(12, Math.max(1, Number(searchParams.get("limit") ?? 4)));

  if (!categoriaSlug) {
    return NextResponse.json({ success: false, error: "categoria requerida" }, { status: 400 });
  }

  try {
    const [[countRows]] = await pool.execute<RowDataPacket[]>(`
      SELECT COUNT(DISTINCT p.id) AS total
      FROM productos p
      LEFT JOIN producto_categorias pc ON pc.producto_id = p.id
      LEFT JOIN categorias c           ON c.id = pc.categoria_id
      WHERE p.estado     = 'activo'
        AND p.deleted_at IS NULL
        AND p.slug      != ?
        AND c.slug      = ?
    `, [excluirSlug, categoriaSlug]);

    const total  = (countRows[0]?.total as number) ?? 0;
    const maxOff = Math.max(0, total - limit);
    const offset = maxOff > 0 ? Math.floor(Math.random() * maxOff) : 0;

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
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
      FROM productos p
      LEFT JOIN producto_categorias pc  ON pc.producto_id  = p.id
      LEFT JOIN categorias c            ON c.id            = pc.categoria_id
      LEFT JOIN marcas m                ON m.id            = p.marca_id
      LEFT JOIN producto_variantes v    ON v.producto_id   = p.id AND v.es_default = 1
      LEFT JOIN producto_imagenes img   ON img.producto_id = p.id
                                        AND img.variante_id IS NULL
                                        AND img.id = (
                                          SELECT MIN(id) FROM producto_imagenes
                                          WHERE producto_id = p.id AND variante_id IS NULL
                                        )
      WHERE p.estado    = 'activo'
        AND p.deleted_at IS NULL
        AND p.slug      != ?
        AND EXISTS (
          SELECT 1
          FROM producto_categorias pc2
          INNER JOIN categorias c2 ON c2.id = pc2.categoria_id
          WHERE pc2.producto_id = p.id AND c2.slug = ?
        )
      GROUP BY
        p.id, p.titulo, p.descripcion, p.slug,
        m.nombre, v.sku, v.precio_final, v.precio_original, v.stock, v.es_default
      ORDER BY p.id ASC
      LIMIT ? OFFSET ?
    `, [excluirSlug, categoriaSlug, limit, offset]);

    return NextResponse.json(
      { success: true, data: rows },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
    );
  } catch (error) {
    console.error("[/api/productos/relacionados] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Error al conectar con la base de datos" },
      { status: 500 }
    );
  }
}