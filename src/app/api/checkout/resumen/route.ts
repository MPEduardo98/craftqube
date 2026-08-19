// app/api/checkout/resumen/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/checkout/resumen
//
// Devuelve el desglose de importes SIN crear nada. Sirve para que
// la pantalla muestre exactamente las mismas cifras que después se
// cobrarán: usa `calcularTotales`, la misma función que emplea la
// creación del pedido.
//
// Con esto, "lo que el cliente ve" y "lo que Stripe cobra" no pueden
// divergir: ambos salen del mismo cálculo de servidor.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { calcularTotales, ErrorCalculo } from "@/features/orders/lib/calcularTotales";
import { getSessionUser }                from "@/features/auth/lib/getSessionUser";
import { consumirLimite, ipDeRequest }   from "@/shared/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const limite = consumirLimite(`resumen:${ipDeRequest(req)}`, 60, 60_000);
  if (!limite.permitido) {
    return NextResponse.json(
      { success: false, error: "Demasiadas peticiones." },
      { status: 429, headers: { "Retry-After": String(limite.esperaSegundos) } }
    );
  }

  try {
    const body   = await req.json();
    const estado = String(body.estado ?? "").trim();
    const items  = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Sin ítems" }, { status: 400 });
    }

    const usuario = await getSessionUser();

    // Modo tolerante: si el cupón dejó de ser válido, el comprador
    // debe seguir viendo su total (sin descuento) y el motivo, en vez
    // de quedarse con la pantalla en blanco.
    const totales = await calcularTotales({
      items,
      estado,
      cupon_codigo:    body.cupon_codigo ?? null,
      usuario_id:      usuario?.id ? Number(usuario.id) : null,
      email:           usuario?.email ?? (typeof body.email === "string" ? body.email : null),
      cupon_tolerante: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        subtotal:     totales.subtotal,
        descuento:    totales.descuento,
        costo_envio:  totales.costo_envio,
        impuestos:    totales.impuestos,
        total:        totales.total,
        moneda:       totales.moneda,
        cupon_codigo: totales.cupon_codigo,
        cupon_tipo:   totales.cupon_tipo,
        cupon_error:  totales.cupon_error,
        lineas:       totales.lineas.map((l) => ({
          variante_id:     l.variante_id,
          cantidad:        l.cantidad,
          precio_unitario: l.precio_unitario,
          total_linea:     l.total_linea,
          titulo:          l.titulo,
        })),
      },
    });
  } catch (err) {
    if (err instanceof ErrorCalculo) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    console.error("[POST /api/checkout/resumen]", err);
    return NextResponse.json({ success: false, error: "Error al calcular el resumen" }, { status: 500 });
  }
}
