// app/api/pedidos/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/pedidos  — Crear pedido desde el checkout
// GET  /api/pedidos  — Listar pedidos del usuario autenticado
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import mysql                          from "mysql2/promise";
import type { RowDataPacket }         from "mysql2";
import { createPedido }               from "@/app/global/lib/db/createPedido";
import { getSessionUser }             from "@/app/global/lib/auth/getSessionUser";
import type { CrearPedidoPayload }    from "@/app/global/types/order";

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

/* ── POST ─────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body: CrearPedidoPayload = await req.json();

    if (!body.email || !body.direccion_envio || !body.items?.length || !body.metodo_pago) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos para crear el pedido" },
        { status: 400 }
      );
    }

    // Intentar asociar usuario autenticado si viene sin usuario_id
    if (!body.usuario_id) {
      const session = await getSessionUser();
      if (session?.sub) {
        body.usuario_id = Number(session.sub);
      }
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined;

    const pedido = await createPedido({ ...body, ip_origen: ip });

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: "No se pudo crear el pedido." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: pedido }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/pedidos]", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

/* ── GET — historial de pedidos del usuario autenticado ───── */
export async function GET(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit = Math.min(20, Number(searchParams.get("limit") ?? 10));
  const offset = (page - 1) * limit;

  let conn: mysql.Connection | undefined;
  try {
    conn = await mysql.createConnection(dbConfig());

    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT
         p.id, p.numero, p.estado, p.total, p.moneda,
         p.metodo_pago, p.created_at,
         COUNT(pi.id) AS total_items
       FROM pedidos p
       LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
       WHERE p.usuario_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [Number(session.sub), limit, offset]
    );

    const [[{ total }]] = await conn.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM pedidos WHERE usuario_id = ?`,
      [Number(session.sub)]
    ) as [RowDataPacket[], unknown];

    return NextResponse.json({
      success: true,
      data: rows,
      meta: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) },
    });
  } catch (error) {
    console.error("[GET /api/pedidos]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  } finally {
    await conn?.end();
  }
}