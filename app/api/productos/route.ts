// app/api/productos/route.ts
// ─────────────────────────────────────────────────────────────
// Optimizado: pool singleton + caché HTTP 60s
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { pool }         from "@/app/global/lib/db/pool";

export async function GET() {
  try {
    const [rows] = await pool.execute<any[]>(`
      SELECT
        p.id,
        p.titulo,
        p.descripcion_corta,
        p.slug,
        p.estado,
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
                                          SELECT MIN(id)
                                          FROM producto_imagenes
                                          WHERE producto_id = p.id AND variante_id IS NULL
                                        )
      WHERE p.estado = 'activo'
        AND p.deleted_at IS NULL
      GROUP BY
        p.id, p.titulo, p.descripcion_corta, p.slug, p.estado,
        m.nombre, v.sku, v.precio_final, v.precio_original, v.stock,
        v.es_default, p.created_at
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json(
      { success: true, data: rows },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("[/api/productos] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Error al conectar con la base de datos" },
      { status: 500 }
    );
  }
}