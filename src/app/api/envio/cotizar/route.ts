// app/api/envio/cotizar/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/envio/cotizar
// Calcula el costo de envío (modelo de guías Paquetexpress + flete
// de sobredimensionados) a partir del estado y los ítems del carrito.
// El cálculo vive en cotizarEnvioServer para que la creación del
// pedido pueda recotizar con exactamente la misma lógica.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { cotizarEnvioServer }        from "@/features/checkout/lib/cotizarEnvioServer";

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const estado = String(body.estado ?? "").trim();
    const items: { variante_id: number; cantidad: number }[] =
      Array.isArray(body.items) ? body.items : [];

    if (!estado) {
      return NextResponse.json({ success: false, error: "Estado requerido" }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Sin ítems" }, { status: 400 });
    }

    const data = await cotizarEnvioServer(estado, items);
    if (!data) {
      return NextResponse.json({ success: false, error: "No se pudo cotizar el envío" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[POST /api/envio/cotizar]", err);
    return NextResponse.json({ success: false, error: "Error al cotizar envío" }, { status: 500 });
  }
}
