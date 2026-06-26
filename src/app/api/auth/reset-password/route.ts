// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql                         from "mysql2/promise";
import type { RowDataPacket }        from "mysql2";
import bcrypt                        from "bcryptjs";

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

export async function POST(req: NextRequest) {
  let conn: mysql.Connection | undefined;

  try {
    const body     = await req.json().catch(() => ({}));
    const token    = body?.token?.trim()    ?? "";
    const password = body?.password?.trim() ?? "";

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener mínimo 6 caracteres" },
        { status: 422 }
      );
    }

    conn = await mysql.createConnection(dbConfig());

    // ── Buscar token reset válido ────────────────────────
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, usuario_id, usado, expira_en
       FROM tokens_verificacion
       WHERE token = ? AND tipo = 'reset_password'
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Enlace inválido o no encontrado" },
        { status: 404 }
      );
    }

    const t = rows[0];

    if (t.usado) {
      return NextResponse.json(
        { success: false, error: "Este enlace ya fue utilizado" },
        { status: 400 }
      );
    }

    if (new Date(t.expira_en) < new Date()) {
      return NextResponse.json(
        { success: false, error: "El enlace ha expirado" },
        { status: 400 }
      );
    }

    // ── Hashear nueva contraseña ─────────────────────────
    const passwordHash = await bcrypt.hash(password, 12);

    // ── Transacción: actualizar password + marcar token ──
    await conn.beginTransaction();

    try {
      await conn.execute(
        `UPDATE usuarios
         SET password_hash = ?, updated_at = NOW()
         WHERE id = ?`,
        [passwordHash, t.usuario_id]
      );

      await conn.execute(
        `UPDATE tokens_verificacion
         SET usado = 1
         WHERE id = ?`,
        [t.id]
      );

      // Revocar todas las sesiones activas por seguridad
      await conn.execute(
        `UPDATE sesiones SET activa = 0 WHERE usuario_id = ?`,
        [t.usuario_id]
      );

      await conn.commit();

      return NextResponse.json({
        success: true,
        message: "Contraseña actualizada correctamente",
      });

    } catch (txErr) {
      await conn.rollback().catch(() => {});
      throw txErr;
    }

  } catch (error) {
    console.error("[POST /api/auth/reset-password]", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await conn?.end().catch(() => {});
  }
}