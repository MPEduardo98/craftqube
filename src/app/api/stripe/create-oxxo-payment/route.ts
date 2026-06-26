// app/api/stripe/create-oxxo-payment/route.ts
import { NextResponse } from "next/server";
import Stripe           from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  try {
    const { amount, email, nombre } = await req.json();

    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email requerido para OXXO" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:               Math.round(Number(amount) * 100), // centavos
      currency:             "mxn",
      payment_method_types: ["oxxo"],
      payment_method_data: {
        type: "oxxo",
        billing_details: {
          name:  nombre ?? "Cliente",
          email,
        },
      },
      confirm:              true,
      // Stripe necesita return_url aunque OXXO no redirige
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/checkout`,
    });

    // next_action contiene el voucher cuando payment_method_types incluye oxxo
    const oxxoDetails = paymentIntent.next_action?.oxxo_display_details;

    if (!oxxoDetails) {
      throw new Error("No se pudo generar el voucher OXXO.");
    }

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      numero:          oxxoDetails.number,          // referencia para pagar en tienda
      expira:          oxxoDetails.expires_after,   // unix timestamp
      hostedVoucherUrl: oxxoDetails.hosted_voucher_url, // PDF/página del voucher
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno del servidor";
    console.error("[Stripe] create-oxxo-payment:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}