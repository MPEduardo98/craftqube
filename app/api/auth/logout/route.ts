// app/api/auth/logout/route.ts
import { NextRequest, NextResponse }                  from "next/server";
import mysql                                           from "mysql2/promise";
import { getRefreshToken, clearAuthCookies }           from "@/app/global/lib/auth/cookies";

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

  if (refreshToken) {
    let conn: mysql.Connection | undefined;
    try {
      conn = await mysql.createConnection(dbConfig());
      await conn.execute(
        "UPDATE sesiones SET activa = 0 WHERE refresh_token = ?",
        [refreshToken]
      );
    } catch (e) {
      console.error("[POST /api/auth/logout]", e);
    } finally {
      await conn?.end();
    }
  }

  await clearAuthCookies();
  return NextResponse.json({ success: true });
}