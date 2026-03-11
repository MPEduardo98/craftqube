// app/api/auth/verificar-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql                         from "mysql2/promise";
import type { RowDataPacket }        from "mysql2";

function dbConfig(): mysql.ConnectionOptions {
  return {
    host:           process.env.DB_HOST,
    user:           process.env.DB_USER,
    password:       process.env.DB_PASSWORD,
    database:       process.env.DB_NAME,
    port:           Number(process.env.DB_PORT) || 3306,
    connectTimeout: 10_000,
    ...(process.env.DB_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

export async function GET(req: NextRequest) {
  let conn: mysql.Connection | undefined;

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token")?.trim() ?? "";
    const tipo  = searchParams.get("tipo")?.trim()  ?? "";

    if (!token || !tipo) {
      return NextResponse.json({ valid: false, error: "Parámetros incompletos" }, { status: 400 });
    }

    conn = await mysql.createConnection(dbConfig());

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, usado, expira_en
       FROM tokens_verificacion
       WHERE token = ? AND tipo = ?
       LIMIT 1`,
      [token, tipo]
    );

    if (rows.length === 0) {
      return NextResponse.json({ valid: false, error: "Token inválido" });
    }

    const t = rows[0];

    if (t.usado) {
      return NextResponse.json({ valid: false, error: "Token ya utilizado" });
    }

    if (new Date(t.expira_en) < new Date()) {
      return NextResponse.json({ valid: false, error: "Token expirado" });
    }

    return NextResponse.json({ valid: true });

  } catch (error) {
    console.error("[GET /api/auth/verificar-token]", error);
    return NextResponse.json({ valid: false, error: "Error interno" }, { status: 500 });
  } finally {
    await conn?.end().catch(() => {});
  }
}