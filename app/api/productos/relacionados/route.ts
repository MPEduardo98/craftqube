// app/api/productos/relacionados/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoriaSlug    = searchParams.get("categoria") ?? "";
  const excluirSlug      = searchParams.get("excluir")   ?? "";
  const limit            = Math.min(parseInt(searchParams.get("limit") ?? "6", 10), 12);

  if (!categoriaSlug) {
    return NextResponse.json({ success: false, error: "Parámetro 'categoria' requerido" }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port:     Number(process.env.DB_PORT) || 3306,
      ssl:      { rejectUnauthorized: false },
    });

    const [rows] = await connection.execute(`
      SELECT
        p.id,
        p.titulo,
        p.descripcion_corta,
        p.slug,
        p.estado,
        MIN(c.nombre)                     AS categoria,
        MIN(c.slug)                       AS categoria_slug,
        m.nombre                          AS marca,
        v.sku,
        v.precio_final                    AS precio,
        v.precio_original,
        v.stock,
        v.es_default,
        SUBSTRING_INDEX(MIN(img.url), '/', -1) AS imagen_nombre,
        MIN(img.alt)                      AS imagen_alt
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
      WHERE p.estado    = 'activo'
        AND p.deleted_at IS NULL
        AND p.slug      != ?
        AND EXISTS (
          SELECT 1
          FROM producto_categorias pc2
          INNER JOIN categorias c2 ON c2.id = pc2.categoria_id
          WHERE pc2.producto_id = p.id
            AND c2.slug = ?
        )
      GROUP BY
        p.id, p.titulo, p.descripcion_corta, p.slug, p.estado,
        m.nombre, v.sku, v.precio_final, v.precio_original, v.stock, v.es_default
      ORDER BY RAND()
      LIMIT ?
    `, [excluirSlug, categoriaSlug, limit]);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("[/api/productos/relacionados] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Error al conectar con la base de datos" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}