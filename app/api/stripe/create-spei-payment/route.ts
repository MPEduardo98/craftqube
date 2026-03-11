// app/api/stripe/create-spei-payment/route.ts
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
      return NextResponse.json({ error: "Email requerido para SPEI" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:               Math.round(Number(amount) * 100), // centavos
      currency:             "mxn",
      payment_method_types: ["customer_balance"],
      payment_method_data: {
        type: "customer_balance",
      },
      payment_method_options: {
        customer_balance: {
          funding_type:         "bank_transfer",
          bank_transfer: {
            type: "mx_bank_transfer",
          },
        },
      },
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/checkout`,
      // Metadata para identificar el pedido en el webhook
      metadata: {
        email,
        nombre: nombre ?? "Cliente",
      },
    });

    const bankTransfer = paymentIntent.next_action?.display_bank_transfer_instructions;

    if (!bankTransfer) {
      throw new Error("No se pudo generar la información de transferencia SPEI.");
    }

    // Extraer CLABE del objeto de Stripe
    const clabeInstructions = bankTransfer.financial_addresses?.find(
      (a) => a.type === "aba" || a.type === "sort_code" || a.spei
    );

    const clabe = clabeInstructions?.spei?.clabe ?? null;
    const banco = clabeInstructions?.spei?.bank_name ?? "Banco asignado por Stripe";

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      clabe,
      banco,
      monto:           Number(amount),
      referencia:      bankTransfer.reference ?? null,
      hostedInstructionsUrl: bankTransfer.hosted_instructions_url ?? null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error interno del servidor";
    console.error("[Stripe] create-spei-payment:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}