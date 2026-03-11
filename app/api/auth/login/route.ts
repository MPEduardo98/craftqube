// app/api/auth/login/route.ts
import { NextRequest, NextResponse }            from "next/server";
import bcrypt                                    from "bcryptjs";
import mysql                                     from "mysql2/promise";
import type { RowDataPacket }                    from "mysql2";
import { signAccessToken, signRefreshToken }     from "@/app/global/lib/auth/jwt";
import { setAuthCookies }                        from "@/app/global/lib/auth/cookies";
import type { LoginPayload, UsuarioPublico }     from "@/app/global/types/auth";

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

export async function POST(req: NextRequest) {
  let conn: mysql.Connection | undefined;

  try {
    const body: LoginPayload = await req.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Correo y contraseña son requeridos" },
        { status: 400 }
      );
    }

    conn = await mysql.createConnection(dbConfig());

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, email, password_hash, nombre, apellido, telefono,
              rol, estado, email_verificado, avatar_url, ultimo_login, created_at
       FROM usuarios
       WHERE email = ? AND deleted_at IS NULL LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const u = rows[0];

    if (u.estado === "suspendido") {
      return NextResponse.json(
        { success: false, error: "Tu cuenta ha sido suspendida. Contacta soporte." },
        { status: 403 }
      );
    }

    if (!u.password_hash) {
      return NextResponse.json(
        { success: false, error: "Esta cuenta usa inicio de sesión social. Usa Google u otro proveedor." },
        { status: 400 }
      );
    }

    const passwordOk = await bcrypt.compare(password, u.password_hash);
    if (!passwordOk) {
      return NextResponse.json(
        { success: false, error: "Correo o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // ── JWT tokens ─────────────────────────────────────────
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({ sub: String(u.id), email: u.email, rol: u.rol }),
      signRefreshToken(u.id),
    ]);

    // ── Persistir sesión ───────────────────────────────────
    const refreshExpira = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await conn.execute(
      `INSERT INTO sesiones
         (usuario_id, refresh_token, ip, user_agent, activa, expira_en)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [
        u.id,
        refreshToken,
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        req.headers.get("user-agent") ?? null,
        refreshExpira.toISOString().slice(0, 19).replace("T", " "),
      ]
    );

    // ── Actualizar ultimo_login ────────────────────────────
    await conn.execute(
      "UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?",
      [u.id]
    );

    await setAuthCookies(accessToken, refreshToken);

    const usuario: UsuarioPublico = {
      id:               u.id,
      email:            u.email,
      nombre:           u.nombre,
      apellido:         u.apellido,
      telefono:         u.telefono,
      rol:              u.rol,
      estado:           u.estado,
      email_verificado: Boolean(u.email_verificado),
      avatar_url:       u.avatar_url,
      ultimo_login:     u.ultimo_login,
      created_at:       u.created_at,
    };

    return NextResponse.json({ success: true, usuario });

  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  } finally {
    await conn?.end();
  }
}