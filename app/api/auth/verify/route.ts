// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql                         from "mysql2/promise";
import type { RowDataPacket }        from "mysql2";

function dbConfig(): mysql.ConnectionOptions {
  return {
    host:            process.env.DB_HOST,
    user:            process.env.DB_USER,
    password:        process.env.DB_PASSWORD,
    database:        process.env.DB_NAME,
    port:            Number(process.env.DB_PORT) || 3306,
    connectTimeout:  10_000,
    ...(process.env.DB_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

export async function POST(req: NextRequest) {
  let conn: mysql.Connection | undefined;

  try {
    const { token } = await req.json();

    if (!token?.trim()) {
      return NextResponse.json(
        { success: false, error: "Token no proporcionado" },
        { status: 400 }
      );
    }

    conn = await mysql.createConnection(dbConfig());

    // ── Buscar token válido ──────────────────────────────
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, usuario_id, usado, expira_en
       FROM tokens_verificacion
       WHERE token = ? AND tipo = 'verificar_email'
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Token inválido o no encontrado" },
        { status: 404 }
      );
    }

    const tokenData = rows[0];

    // ── Validar que no esté usado ───────────────────────
    if (tokenData.usado) {
      return NextResponse.json(
        { success: false, error: "Este token ya fue utilizado" },
        { status: 400 }
      );
    }

    // ── Validar que no esté expirado ────────────────────
    const expira = new Date(tokenData.expira_en);
    if (expira < new Date()) {
      return NextResponse.json(
        { success: false, error: "Este token ha expirado" },
        { status: 400 }
      );
    }

    // ── Iniciar transacción ─────────────────────────────
    await conn.beginTransaction();

    try {
      // Marcar token como usado
      await conn.execute(
        `UPDATE tokens_verificacion
         SET usado = 1, usado_en = NOW()
         WHERE id = ?`,
        [tokenData.id]
      );

      // Verificar usuario
      await conn.execute(
        `UPDATE usuarios
         SET email_verificado = 1, estado = 'activo'
         WHERE id = ?`,
        [tokenData.usuario_id]
      );

      await conn.commit();

      return NextResponse.json({
        success: true,
        message: "Email verificado exitosamente"
      });

    } catch (txErr) {
      await conn.rollback().catch(() => {});
      throw txErr;
    }

  } catch (error) {
    console.error("[POST /api/auth/verify] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al verificar el email" },
      { status: 500 }
    );
  } finally {
    await conn?.end().catch(() => {});
  }
}