// app/api/stripe/create-payment-intent/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export async function POST(req: Request) {
  try {
    const { amount, currency = "mxn", metadata } = await req.json();

    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   Math.round(Number(amount) * 100), // centavos
      currency,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: metadata ?? {},
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("[Stripe] create-payment-intent:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}