// app/api/pedidos/route.ts
// ─────────────────────────────────────────────────────────────
// POST  /api/pedidos  — Crear pedido desde el checkout
// GET   /api/pedidos  — Listar pedidos del usuario autenticado
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { createPedido }              from "@/app/global/lib/db/createPedido";
import type { CrearPedidoPayload }   from "@/app/global/types/order";

export async function POST(req: NextRequest) {
  try {
    const body: CrearPedidoPayload = await req.json();

    // Validación básica
    if (
      !body.email ||
      !body.direccion_envio ||
      !body.items?.length ||
      !body.metodo_pago
    ) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos para crear el pedido" },
        { status: 400 }
      );
    }

    // Capturar IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const pedido = await createPedido({ ...body, ip_origen: ip });

    if (!pedido) {
      return NextResponse.json(
        { success: false, error: "No se pudo crear el pedido. Intente de nuevo." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: pedido }, { status: 201 });

  } catch (error) {
    console.error("[POST /api/pedidos]", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET — historial de pedidos (requiere auth, implementar middleware de sesión)
export async function GET(req: NextRequest) {
  // TODO: Extraer usuario_id del JWT / cookie de sesión
  // const usuario = await getSessionUser(req);
  // if (!usuario) return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });

  return NextResponse.json(
    { success: false, error: "Autenticación pendiente de implementar" },
    { status: 501 }
  );
}