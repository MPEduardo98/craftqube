// app/api/categorias/route.ts
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
        c.id,
        c.nombre,
        c.slug,
        c.descripcion,
        c.imagen,
        c.parent_id,
        COUNT(DISTINCT CASE WHEN p.estado = 'activo' AND p.deleted_at IS NULL THEN p.id END) AS total_productos
      FROM categorias c
      LEFT JOIN producto_categorias pc ON pc.categoria_id = c.id
      LEFT JOIN productos p            ON p.id = pc.producto_id
      WHERE c.parent_id IS NULL
      GROUP BY c.id, c.nombre, c.slug, c.descripcion, c.imagen, c.parent_id
      ORDER BY c.id ASC
    `);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("[/api/categorias] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Error al conectar con la base de datos" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}