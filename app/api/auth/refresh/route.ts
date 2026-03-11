// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse }                      from "next/server";
import mysql                                               from "mysql2/promise";
import type { RowDataPacket }                              from "mysql2";
import { verifyRefreshToken, signAccessToken }             from "@/app/global/lib/auth/jwt";
import { getRefreshToken, setAuthCookies }                 from "@/app/global/lib/auth/cookies";

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

export async function POST(_req: NextRequest) {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return NextResponse.json({ success: false, error: "Sin refresh token" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload?.sub) {
    return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 });
  }

  let conn: mysql.Connection | undefined;
  try {
    conn = await mysql.createConnection(dbConfig());

    const [sesiones] = await conn.execute<RowDataPacket[]>(
      `SELECT id FROM sesiones
       WHERE refresh_token = ? AND activa = 1 AND expira_en > NOW() LIMIT 1`,
      [refreshToken]
    );
    if (!sesiones.length) {
      return NextResponse.json({ success: false, error: "Sesión expirada" }, { status: 401 });
    }

    const [rows] = await conn.execute<RowDataPacket[]>(
      "SELECT id, email, rol FROM usuarios WHERE id = ? AND deleted_at IS NULL LIMIT 1",
      [Number(payload.sub)]
    );
    if (!rows.length) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 });
    }

    const u = rows[0];
    const newAccessToken = await signAccessToken({
      sub:   String(u.id),
      email: u.email,
      rol:   u.rol,
    });

    await conn.execute(
      "UPDATE sesiones SET last_used_at = NOW() WHERE refresh_token = ?",
      [refreshToken]
    );

    await setAuthCookies(newAccessToken, refreshToken);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[POST /api/auth/refresh]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  } finally {
    await conn?.end();
  }
}