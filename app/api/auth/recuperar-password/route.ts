// app/api/auth/recuperar-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes }               from "crypto";
import mysql                         from "mysql2/promise";
import type { RowDataPacket }        from "mysql2";
import { sendPasswordResetEmail }    from "@/app/global/lib/email/send";

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
    const body = await req.json().catch(() => ({}));
    const email: string = body?.email?.trim()?.toLowerCase() ?? "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email no proporcionado" },
        { status: 400 }
      );
    }

    conn = await mysql.createConnection(dbConfig());

    // ── Buscar usuario activo ────────────────────────────
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, nombre, email
       FROM usuarios
       WHERE email = ? AND deleted_at IS NULL
       LIMIT 1`,
      [email]
    );

    // Respuesta genérica (seguridad: no revelar si el email existe)
    if (rows.length === 0) {
      return NextResponse.json({ success: true });
    }

    const usuario = rows[0];

    // ── Rate-limit suave: 1 solicitud cada 2 min ────────
    const [recent] = await conn.execute<RowDataPacket[]>(
      `SELECT id FROM tokens_verificacion
       WHERE usuario_id = ?
         AND tipo       = 'reset_password'
         AND usado      = 0
         AND created_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE)
       LIMIT 1`,
      [usuario.id]
    );

    if ((recent as RowDataPacket[]).length > 0) {
      return NextResponse.json(
        { success: false, error: "Espera 2 minutos antes de solicitar otro enlace" },
        { status: 429 }
      );
    }

    // ── Invalidar tokens anteriores ─────────────────────
    await conn.execute(
      `UPDATE tokens_verificacion
       SET usado = 1
       WHERE usuario_id = ? AND tipo = 'reset_password' AND usado = 0`,
      [usuario.id]
    );

    // ── Crear nuevo token (expira en 30 min) ────────────
    const resetToken = randomBytes(48).toString("hex");
    const expira     = new Date(Date.now() + 1000 * 60 * 30);

    await conn.execute(
      `INSERT INTO tokens_verificacion
         (usuario_id, token, tipo, expira_en, ip_origen)
       VALUES (?, ?, 'reset_password', ?, ?)`,
      [
        usuario.id,
        resetToken,
        expira.toISOString().slice(0, 19).replace("T", " "),
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      ]
    );

    // ── Enviar email (non-blocking en errores de mail) ──
    const emailResult = await sendPasswordResetEmail(
      usuario.email,
      usuario.nombre,
      resetToken
    );

    if (!emailResult.success) {
      console.error("[recuperar-password] Email no enviado:", emailResult.error);
      return NextResponse.json(
        { success: false, error: "Error al enviar el correo. Intenta de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[POST /api/auth/recuperar-password]", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await conn?.end().catch(() => {});
  }
}