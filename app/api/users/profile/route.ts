// app/api/users/profile/route.ts
// ─────────────────────────────────────────────────────────────
// PATCH /api/users/profile — Actualizar teléfono y datos del perfil
// Requiere sesión activa (JWT cookie)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import mysql                          from "mysql2/promise";
import type { RowDataPacket }         from "mysql2";
import { getSessionUser }             from "@/app/global/lib/auth/getSessionUser";

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

interface PatchBody {
  telefono?: string | null;
  nombre?:   string;
  apellido?: string;
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  let conn: mysql.Connection | undefined;
  try {
    const body: PatchBody = await req.json();

    // Tipado explícito compatible con mysql2 ExecuteValues
    const sets: string[]                   = [];
    const vals: (string | number | null)[] = [];

    if (body.telefono !== undefined) {
      sets.push("telefono = ?");
      vals.push(body.telefono?.trim() || null);
    }
    if (body.nombre !== undefined && body.nombre.trim()) {
      sets.push("nombre = ?");
      vals.push(body.nombre.trim());
    }
    if (body.apellido !== undefined && body.apellido.trim()) {
      sets.push("apellido = ?");
      vals.push(body.apellido.trim());
    }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: "Nada que actualizar" }, { status: 400 });
    }

    vals.push(Number(session.sub));

    conn = await mysql.createConnection(dbConfig());

    await conn.execute(
      `UPDATE usuarios SET ${sets.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
      vals
    );

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, email, nombre, apellido, telefono, rol, estado,
              email_verificado, avatar_url, ultimo_login, created_at
       FROM usuarios WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
      [Number(session.sub)]
    );

    return NextResponse.json({ success: true, usuario: rows[0] ?? null });
  } catch (error) {
    console.error("[PATCH /api/users/profile]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  } finally {
    await conn?.end();
  }
}