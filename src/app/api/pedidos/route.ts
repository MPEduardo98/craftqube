// app/api/pedidos/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/pedidos  — Crear pedido desde el checkout
// GET  /api/pedidos  — Listar pedidos del usuario autenticado
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                       from "@/shared/lib/db/pool";
import type { RowDataPacket }         from "mysql2";
import { createPedido }               from "@/features/orders/lib/createPedido";
import { ErrorCalculo }               from "@/features/orders/lib/calcularTotales";
import { getSessionUser }             from "@/features/auth/lib/getSessionUser";
import type { CrearPedidoPayload }    from "@/features/orders/types/order";

/* ── POST ─────────────────────────────────────────────────── */
// Nota: el checkout usa /api/checkout/pagar, que crea el pedido y el
// cobro en una sola operación. Esta ruta se mantiene para altas sin
// pago asociado y comparte el mismo cálculo de totales en servidor.
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
      const user = await getSessionUser();
      if (user?.id) {
        body.usuario_id = Number(user.id);
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
    // Sin stock, cupón inválido o producto retirado: el comprador
    // necesita leer el motivo, no un 500 genérico.
    if (error instanceof ErrorCalculo) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error("[POST /api/pedidos]", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

/* ── GET — historial de pedidos del usuario autenticado ───── */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }
  const userId = Number(user.id);

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit = Math.min(20, Number(searchParams.get("limit") ?? 10));
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
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
      [userId, limit, offset]
    );

    const [[{ total }]] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM pedidos WHERE usuario_id = ?`,
      [userId]
    ) as [RowDataPacket[], unknown];

    return NextResponse.json({
      success: true,
      data: rows,
      meta: { page, limit, total: Number(total), pages: Math.ceil(Number(total) / limit) },
    });
  } catch (error) {
    console.error("[GET /api/pedidos]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}