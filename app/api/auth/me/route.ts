// app/api/auth/me/route.ts
import { NextResponse }      from "next/server";
import mysql                  from "mysql2/promise";
import type { RowDataPacket } from "mysql2";
import { getSessionUser }     from "@/app/global/lib/auth/getSessionUser";

function dbConfig() {
  return {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     Number(process.env.DB_PORT) || 3306,
    ssl:      { rejectUnauthorized: false },
  };
}

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  let conn: mysql.Connection | undefined;
  try {
    conn = await mysql.createConnection(dbConfig());

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, email, nombre, apellido, telefono, rol, estado,
              email_verificado, avatar_url, ultimo_login, created_at
       FROM usuarios
       WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
      [Number(session.sub)]
    );

    if (!rows.length) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, usuario: rows[0] });

  } catch (error) {
    console.error("[GET /api/auth/me]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  } finally {
    await conn?.end();
  }
}