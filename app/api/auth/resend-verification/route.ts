// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomBytes }               from "crypto";
import mysql                         from "mysql2/promise";
import type { RowDataPacket }        from "mysql2";
import { sendVerificationEmail }     from "@/app/global/lib/email/send";

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
    const { email } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { success: false, error: "Email no proporcionado" },
        { status: 400 }
      );
    }

    conn = await mysql.createConnection(dbConfig());

    // ── Buscar usuario ───────────────────────────────────
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, nombre, email_verificado
       FROM usuarios
       WHERE email = ? AND deleted_at IS NULL
       LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const usuario = rows[0];

    // ── Ya verificado ────────────────────────────────────
    if (usuario.email_verificado) {
      return NextResponse.json(
        { success: false, error: "Este email ya está verificado" },
        { status: 400 }
      );
    }

    // ── Invalidar tokens anteriores ─────────────────────
    await conn.execute(
      `UPDATE tokens_verificacion
       SET usado = 1
       WHERE usuario_id = ? AND tipo = 'verificar_email' AND usado = 0`,
      [usuario.id]
    );

    // ── Crear nuevo token ────────────────────────────────
    const verifyToken = randomBytes(48).toString("hex");
    const expira      = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await conn.execute(
      `INSERT INTO tokens_verificacion
         (usuario_id, token, tipo, expira_en, ip_origen)
       VALUES (?, ?, 'verificar_email', ?, ?)`,
      [
        usuario.id,
        verifyToken,
        expira.toISOString().slice(0, 19).replace("T", " "),
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      ]
    );

    // ── Enviar email ─────────────────────────────────────
    const result = await sendVerificationEmail(
      email.toLowerCase().trim(),
      usuario.nombre,
      verifyToken
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Error al enviar el correo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Correo de verificación enviado"
    });

  } catch (error) {
    console.error("[POST /api/auth/resend-verification] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error al reenviar verificación" },
      { status: 500 }
    );
  } finally {
    await conn?.end().catch(() => {});
  }
}