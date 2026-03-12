// app/api/auth/register/route.ts
import { NextRequest, NextResponse }           from "next/server";
import bcrypt                                   from "bcryptjs";
import { randomBytes }                          from "crypto";
import mysql                                    from "mysql2/promise";
import type { RowDataPacket }                   from "mysql2";
import { signAccessToken, signRefreshToken }    from "@/app/global/lib/auth/jwt";
import { setAuthCookies }                       from "@/app/global/lib/auth/cookies";
import type { RegisterPayload, UsuarioPublico } from "@/app/global/types/auth";
import { sendWelcomeEmail }                     from "@/app/global/lib/email/send";

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
    // ── Parse body ─────────────────────────────────────────
    let body: RegisterPayload;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Cuerpo de solicitud inválido" },
        { status: 400 }
      );
    }

    const { nombre, apellido, email, password, telefono } = body;

    // ── Validación básica ──────────────────────────────────
    if (!nombre?.trim() || !apellido?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Todos los campos obligatorios son requeridos" },
        { status: 400 }
      );
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Correo electrónico no válido" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // ── Conexión DB ────────────────────────────────────────
    try {
      conn = await mysql.createConnection(dbConfig());
    } catch (dbErr) {
      console.error("[register] DB connection failed:", dbErr);
      return NextResponse.json(
        { success: false, error: "No se pudo conectar con la base de datos" },
        { status: 503 }
      );
    }

    // ── Iniciar transacción ────────────────────────────────
    await conn.beginTransaction();

    try {
      // ── Email único ──────────────────────────────────────
      const [existing] = await conn.execute<RowDataPacket[]>(
        "SELECT id FROM usuarios WHERE email = ? AND deleted_at IS NULL LIMIT 1",
        [email.toLowerCase().trim()]
      );
      if ((existing as RowDataPacket[]).length > 0) {
        await conn.rollback();
        return NextResponse.json(
          { success: false, error: "Este correo ya está registrado" },
          { status: 409 }
        );
      }

      // ── Hash password ────────────────────────────────────
      const passwordHash = await bcrypt.hash(password, 12);

      // ── Insertar usuario ─────────────────────────────────
      const [result] = await conn.execute<mysql.ResultSetHeader>(
        `INSERT INTO usuarios
           (email, password_hash, nombre, apellido, telefono, rol, estado, email_verificado)
         VALUES (?, ?, ?, ?, ?, 'cliente', 'pendiente_verificacion', 0)`,
        [
          email.toLowerCase().trim(),
          passwordHash,
          nombre.trim(),
          apellido.trim(),
          telefono?.trim() || null,
        ]
      );
      const usuarioId = result.insertId;

      // ── Token de verificación ────────────────────────────
      const verifyToken = randomBytes(48).toString("hex");
      const expira      = new Date(Date.now() + 1000 * 60 * 60 * 24);

      await conn.execute(
        `INSERT INTO tokens_verificacion
           (usuario_id, token, tipo, expira_en, ip_origen)
         VALUES (?, ?, 'verificar_email', ?, ?)`,
        [
          usuarioId,
          verifyToken,
          expira.toISOString().slice(0, 19).replace("T", " "),
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        ]
      );

      // ── JWT tokens ───────────────────────────────────────
      const [accessToken, refreshToken] = await Promise.all([
        signAccessToken({ sub: String(usuarioId), email: email.toLowerCase().trim(), rol: "cliente" }),
        signRefreshToken(usuarioId),
      ]);

      // ── Persistir sesión ─────────────────────────────────
      const refreshExpira = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      await conn.execute(
        `INSERT INTO sesiones
           (usuario_id, refresh_token, ip, user_agent, activa, expira_en)
         VALUES (?, ?, ?, ?, 1, ?)`,
        [
          usuarioId,
          refreshToken,
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
          req.headers.get("user-agent") ?? null,
          refreshExpira.toISOString().slice(0, 19).replace("T", " "),
        ]
      );

      // ── Commit ───────────────────────────────────────────
      await conn.commit();

      // ── httpOnly cookies ─────────────────────────────────
      await setAuthCookies(accessToken, refreshToken);

      const usuario: UsuarioPublico = {
        id:               usuarioId,
        email:            email.toLowerCase().trim(),
        nombre:           nombre.trim(),
        apellido:         apellido.trim(),
        telefono:         telefono?.trim() || null,
        rol:              "cliente",
        estado:           "pendiente_verificacion",
        email_verificado: false,
        avatar_url:       null,
        rfc:              null,
        razon_social:     null,
        ultimo_login:     null,
        created_at:       new Date().toISOString(),
      };

      // ── Enviar email de bienvenida ───────────────────────
      sendWelcomeEmail(
        email.toLowerCase().trim(),
        nombre.trim(),
        verifyToken
      ).catch((err) => {
        console.error("[register] Email send failed (non-blocking):", err);
      });

      return NextResponse.json({ success: true, usuario }, { status: 201 });

    } catch (txErr) {
      await conn.rollback().catch(() => {});
      throw txErr;
    }

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[POST /api/auth/register] Error:", msg);

    if (msg.includes("ER_DUP_ENTRY") || msg.includes("Duplicate entry")) {
      return NextResponse.json(
        { success: false, error: "Este correo ya está registrado" },
        { status: 409 }
      );
    }
    if (msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND") || msg.includes("connect")) {
      return NextResponse.json(
        { success: false, error: "Error de conexión con la base de datos" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await conn?.end().catch(() => {});
  }
}