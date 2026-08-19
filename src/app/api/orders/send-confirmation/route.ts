// app/api/orders/send-confirmation/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/orders/send-confirmation
//
// Envía el correo de confirmación de un pedido EXISTENTE.
//
// El destinatario y el importe se leen de la BD, no del cuerpo de
// la petición: aceptándolos del cliente, cualquiera podía usar
// este endpoint para mandar correos con la identidad de la tienda
// a direcciones arbitrarias.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse }    from "next/server";
import { pool }                          from "@/shared/lib/db/pool";
import type { RowDataPacket }            from "mysql2";
import { sendOrderConfirmationEmail }    from "@/shared/lib/email/send";
import { consumirLimite, ipDeRequest }   from "@/shared/lib/rate-limit";
import type { CartItem }                 from "@/features/cart/types/cart";

export const dynamic = "force-dynamic";

interface EnvioPayload {
  calle:        string;
  numeroExt:    string;
  numeroInt?:   string;
  colonia:      string;
  ciudad:       string;
  municipio?:   string;
  estado:       string;
  codigoPostal: string;
  pais:         string;
}

interface RequestBody {
  /** Número real del pedido (CQ-2026-000042). */
  orderNumber: string;
  nombre:      string;
  items:       CartItem[];
  envio:       EnvioPayload;
  metodo:      "tarjeta" | "transferencia" | "oxxo";
  /** Datos de pago devueltos por Stripe; no se persisten en la BD. */
  spei?: {
    clabe:                 string | null;
    banco:                 string;
    referencia:            string | null;
    monto:                 number;
    hostedInstructionsUrl: string | null;
  };
  oxxo?: {
    numero:           string;
    expira:           number;
    hostedVoucherUrl: string | null;
  };
}

export async function POST(req: NextRequest) {
  const limite = consumirLimite(`email-pedido:${ipDeRequest(req)}`, 10, 60_000);
  if (!limite.permitido) {
    return NextResponse.json(
      { error: "Demasiadas peticiones." },
      { status: 429, headers: { "Retry-After": String(limite.esperaSegundos) } }
    );
  }

  try {
    const body: RequestBody = await req.json();
    const { orderNumber, nombre, items, envio, metodo, spei, oxxo } = body;

    if (!orderNumber || !nombre || !items?.length || !envio || !metodo) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // El pedido debe existir: de él salen el destinatario y el importe.
    const [[pedido]] = await pool.execute<RowDataPacket[]>(
      "SELECT email, total FROM pedidos WHERE numero = ? LIMIT 1",
      [String(orderNumber)]
    );

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const destinatario = String(pedido.email);

    const result = await sendOrderConfirmationEmail(destinatario, {
      orderNumber,
      nombre,
      email: destinatario,
      total: Number(pedido.total),
      items,
      envio,
      metodo,
      spei,
      oxxo,
    });

    if (!result.success) {
      console.error("[send-confirmation] Resend error:", result.error);
      return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-confirmation]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
