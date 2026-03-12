// app/api/users/change-email/route.ts
import { NextRequest, NextResponse }     from "next/server";
import { randomBytes }                   from "crypto";
import mysql                             from "mysql2/promise";
import type { RowDataPacket }            from "mysql2";
import { getSessionUser }                from "@/app/global/lib/auth/getSessionUser";
import { sendVerificationEmail }         from "@/app/global/lib/email/send";

function dbConfig(): mysql.ConnectionOptions {
  return {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     Number(process.env.DB_PORT) || 3306,
    ssl:      { rejectUnauthorized: false },
  };
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  let conn: mysql.Connection | undefined;
  try {
    const { email } = await req.json();
    const nuevoEmail = email?.toLowerCase().trim();

    if (!nuevoEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoEmail)) {
      return NextResponse.json({ success: false, error: "Email inválido" }, { status: 400 });
    }

    conn = await mysql.createConnection(dbConfig());

    // Verificar que no esté en uso por otro usuario
    const [existe] = await conn.execute<RowDataPacket[]>(
      `SELECT id FROM usuarios WHERE email = ? AND id != ? AND deleted_at IS NULL LIMIT 1`,
      [nuevoEmail, Number(session.sub)]
    );
    if (existe.length > 0) {
      return NextResponse.json({ success: false, error: "Este correo ya está en uso" }, { status: 409 });
    }

    // Actualizar email y marcar como no verificado
    await conn.execute(
      `UPDATE usuarios SET email = ?, email_verificado = 0 WHERE id = ? AND deleted_at IS NULL`,
      [nuevoEmail, Number(session.sub)]
    );

    // Invalidar tokens anteriores
    await conn.execute(
      `UPDATE tokens_verificacion SET usado = 1 WHERE usuario_id = ? AND tipo = 'verificar_email' AND usado = 0`,
      [Number(session.sub)]
    );

    // Crear nuevo token
    const token  = randomBytes(48).toString("hex");
    const expira = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await conn.execute(
      `INSERT INTO tokens_verificacion (usuario_id, token, tipo, expira_en) VALUES (?, ?, 'verificar_email', ?)`,
      [Number(session.sub), token, expira.toISOString().slice(0, 19).replace("T", " ")]
    );

    // Obtener nombre del usuario
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT nombre FROM usuarios WHERE id = ? LIMIT 1`,
      [Number(session.sub)]
    );
    const nombre = rows[0]?.nombre ?? "Usuario";

    // Enviar email (no bloqueante)
    sendVerificationEmail(nuevoEmail, nombre, token).catch((e) =>
      console.error("[change-email] send failed:", e)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/users/change-email]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  } finally {
    await conn?.end();
  }
}