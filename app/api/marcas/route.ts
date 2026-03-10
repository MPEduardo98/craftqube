// app/api/marcas/route.ts
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
        m.id,
        m.nombre,
        m.slug,
        COUNT(DISTINCT CASE WHEN p.estado = 'activo' AND p.deleted_at IS NULL THEN p.id END) AS total_productos
      FROM marcas m
      LEFT JOIN productos p ON p.marca_id = m.id
      GROUP BY m.id, m.nombre, m.slug
      HAVING total_productos > 0
      ORDER BY total_productos DESC
    `);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("[/api/marcas] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Error al conectar" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}