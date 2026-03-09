import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
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
        c.nombre        AS categoria,
        c.slug          AS categoria_slug,
        m.nombre        AS marca,
        v.sku,
        v.precio_final  AS precio,
        v.precio_original,
        v.stock,
        v.es_default,
        img.url         AS imagen_url,
        img.alt         AS imagen_alt
      FROM productos p
      LEFT JOIN producto_categorias pc  ON pc.producto_id  = p.id
      LEFT JOIN categorias c            ON c.id            = pc.categoria_id
      LEFT JOIN marcas m                ON m.id            = p.marca_id
      LEFT JOIN producto_variantes v    ON v.producto_id   = p.id AND v.es_default = 1
      LEFT JOIN producto_imagenes img   ON img.producto_id = p.id
                                        AND img.variante_id IS NULL
                                        AND img.orden = (
                                          SELECT MIN(orden)
                                          FROM producto_imagenes
                                          WHERE producto_id = p.id AND variante_id IS NULL
                                        )
      WHERE p.estado = 'activo'
        AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("[/api/productos] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Error al conectar con la base de datos" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}