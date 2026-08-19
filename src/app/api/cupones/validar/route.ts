// app/api/cupones/validar/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/cupones/validar
//
// Comprueba un código contra un carrito y devuelve lo que
// descontaría. Es sólo una consulta: no reserva nada ni gasta el
// cupón, eso ocurre al crear el pedido.
//
// El cliente manda QUÉ variantes y CUÁNTAS; el subtotal, el envío
// y el descuento los resuelve el servidor con `calcularTotales`,
// la misma función que después cobra. Antes esta ruta aceptaba el
// subtotal desde el navegador y recalculaba el descuento por su
// cuenta, así que podía diferir de lo que el checkout cobraba.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse }     from "next/server";
import { calcularTotales, ErrorCalculo } from "@/features/orders/lib/calcularTotales";
import { getSessionUser }                from "@/features/auth/lib/getSessionUser";
import { consumirLimite, ipDeRequest }   from "@/shared/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Un formulario de cupón invita a probar códigos a lo bruto.
  const limite = consumirLimite(`cupon:${ipDeRequest(req)}`, 20, 60_000);
  if (!limite.permitido) {
    return NextResponse.json(
      { success: false, error: "Demasiados intentos. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(limite.esperaSegundos) } }
    );
  }

  try {
    const body   = await req.json();
    const codigo = String(body.codigo ?? "").trim();
    const estado = String(body.estado ?? "").trim();
    const items  = Array.isArray(body.items) ? body.items : [];

    if (!codigo) {
      return NextResponse.json(
        { success: false, error: "Se requiere un código." },
        { status: 400 }
      );
    }
    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Se requiere el contenido del carrito." },
        { status: 400 }
      );
    }

    const usuario = await getSessionUser();

    const totales = await calcularTotales({
      items,
      estado,
      cupon_codigo:    codigo,
      usuario_id:      usuario?.id ? Number(usuario.id) : null,
      email:           usuario?.email ?? null,
      cupon_tolerante: true,
    });

    // Cupón rechazado: el carrito está bien, sólo el código no sirve.
    if (totales.cupon_error) {
      return NextResponse.json({ success: true, valido: false, error: totales.cupon_error });
    }

    return NextResponse.json({
      success: true,
      valido:  true,
      cupon: {
        codigo: totales.cupon_codigo,
        tipo:   totales.cupon_tipo,
      },
      descuento:   totales.descuento,
      costo_envio: totales.costo_envio,
      total:       totales.total,
      moneda:      totales.moneda,
      mensaje: totales.cupon_tipo === "envio_gratis"
        ? "¡Envío gratis aplicado!"
        : "Descuento aplicado",
    });

  } catch (error) {
    // Un carrito inválido sí es un 400: no hay nada contra qué validar.
    if (error instanceof ErrorCalculo) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error("[POST /api/cupones/validar]", error);
    return NextResponse.json(
      { success: false, error: "Error al validar el cupón" },
      { status: 500 }
    );
  }
}
