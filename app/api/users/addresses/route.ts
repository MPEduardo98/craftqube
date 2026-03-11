// app/api/users/addresses/route.ts
// ─────────────────────────────────────────────────────────────
// GET  /api/users/addresses  — Listar direcciones del usuario
// POST /api/users/addresses  — Guardar nueva dirección
// Requiere sesión activa (JWT cookie)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import mysql                          from "mysql2/promise";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
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

/* ── GET — listar direcciones ─────────────────────────────── */
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  let conn: mysql.Connection | undefined;
  try {
    conn = await mysql.createConnection(dbConfig());

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT id, alias, nombre, apellido, empresa, telefono,
              calle, numero_ext, numero_int, colonia, ciudad,
              municipio, estado, codigo_postal, pais,
              referencias, es_predeterminada, tipo, created_at
       FROM direcciones
       WHERE usuario_id = ?
       ORDER BY es_predeterminada DESC, created_at DESC
       LIMIT 10`,
      [Number(session.sub)]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("[GET /api/users/addresses]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  } finally {
    await conn?.end();
  }
}

/* ── POST — guardar nueva dirección ──────────────────────── */
export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  let conn: mysql.Connection | undefined;
  try {
    const body = await req.json();

    const {
      alias        = null,
      nombre,
      apellido,
      empresa      = null,
      telefono     = null,
      calle,
      numero_ext,
      numero_int   = null,
      colonia,
      ciudad,
      municipio    = null,
      estado,
      codigo_postal,
      pais         = "MX",
      referencias  = null,
      es_predeterminada = false,
      tipo         = "envio",
    } = body;

    if (!nombre || !apellido || !calle || !numero_ext || !colonia || !ciudad || !estado || !codigo_postal) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    conn = await mysql.createConnection(dbConfig());
    await conn.beginTransaction();

    // Si será predeterminada, quitar el flag a las demás
    if (es_predeterminada) {
      await conn.execute(
        `UPDATE direcciones SET es_predeterminada = 0
         WHERE usuario_id = ? AND tipo IN ('envio', 'ambos')`,
        [Number(session.sub)]
      );
    }

    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO direcciones
         (usuario_id, alias, nombre, apellido, empresa, telefono,
          calle, numero_ext, numero_int, colonia, ciudad,
          municipio, estado, codigo_postal, pais,
          referencias, es_predeterminada, tipo)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        Number(session.sub), alias, nombre, apellido, empresa, telefono,
        calle, numero_ext, numero_int, colonia, ciudad,
        municipio, estado, codigo_postal, pais,
        referencias, es_predeterminada ? 1 : 0, tipo,
      ]
    );

    await conn.commit();

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT * FROM direcciones WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    return NextResponse.json({ success: true, data: rows[0] ?? null }, { status: 201 });
  } catch (error) {
    await conn?.rollback().catch(() => {});
    console.error("[POST /api/users/addresses]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  } finally {
    await conn?.end();
  }
}