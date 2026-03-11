// app/api/orders/send-confirmation/route.ts
import { NextResponse }                from "next/server";
import { sendOrderConfirmationEmail }  from "@/app/global/lib/email/send";
import type { OrderConfirmationProps } from "@/app/global/lib/email/templates/OrderConfirmationEmail";

export async function POST(req: Request) {
  try {
    const body: OrderConfirmationProps & { email: string } = await req.json();

    const { email, orderNumber, nombre, total, items, envio, metodo, spei, oxxo } = body;

    if (!email || !orderNumber || !nombre || !total || !items?.length || !envio || !metodo) {
      return NextResponse.json(
        { error: "Faltan campos requeridos para enviar el email de confirmación." },
        { status: 400 }
      );
    }

    const result = await sendOrderConfirmationEmail(email, {
      orderNumber,
      nombre,
      email,
      total,
      items,
      envio,
      metodo,
      spei,
      oxxo,
    });

    if (!result.success) {
      console.error("[send-confirmation] Email failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno";
    console.error("[send-confirmation]", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}