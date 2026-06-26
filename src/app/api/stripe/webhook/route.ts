// app/api/stripe/webhook/route.ts
// ─────────────────────────────────────────────────────────────
// Maneja eventos de Stripe:
//   · payment_intent.succeeded     → marca pedido como pago_recibido
//   · payment_intent.payment_failed → registra fallo en historial
// Requiere: STRIPE_WEBHOOK_SECRET en .env
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import Stripe                        from "stripe";
import mysql                         from "mysql2/promise";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const dynamic = "force-dynamic";

function dbConfig(): mysql.ConnectionOptions {
  return {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     Number(process.env.DB_PORT) || 3306,
    ssl:      { rejectUnauthorized: false },
  };
}

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";
  const secret    = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[Stripe Webhook] Firma inválida:", err);
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

/* ── Helpers ────────────────────────────────────────────── */

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  let conn: mysql.Connection | undefined;
  try {
    conn = await mysql.createConnection(dbConfig());

    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT id, estado FROM pedidos WHERE referencia_pago = ? LIMIT 1`,
      [pi.id]
    );

    if (!rows.length) {
      console.warn(`[Webhook] Pedido no encontrado para PI: ${pi.id}`);
      return;
    }

    const pedido = rows[0];
    if (pedido.estado === "pago_recibido") return; // idempotencia

    await conn.execute(
      `UPDATE pedidos SET estado = 'pago_recibido', pagado_en = NOW() WHERE id = ?`,
      [pedido.id]
    );

    await conn.execute(
      `INSERT INTO pedido_historial (pedido_id, estado_anterior, estado_nuevo, comentario, notificar)
       VALUES (?, ?, 'pago_recibido', ?, 1)`,
      [pedido.id, pedido.estado, `Pago confirmado por Stripe · PI: ${pi.id}`]
    );

    console.info(`[Webhook] Pedido #${pedido.id} → pago_recibido`);
  } catch (err) {
    console.error("[Webhook] handlePaymentSucceeded error:", err);
  } finally {
    await conn?.end();
  }
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  let conn: mysql.Connection | undefined;
  try {
    conn = await mysql.createConnection(dbConfig());

    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT id FROM pedidos WHERE referencia_pago = ? LIMIT 1`,
      [pi.id]
    );

    if (!rows.length) return;

    await conn.execute(
      `INSERT INTO pedido_historial (pedido_id, estado_anterior, estado_nuevo, comentario, notificar)
       VALUES (?, 'pendiente_pago', 'pendiente_pago', ?, 0)`,
      [rows[0].id, `Pago fallido · ${pi.last_payment_error?.message ?? "Sin detalle"}`]
    );

    console.warn(`[Webhook] Pago fallido pedido #${rows[0].id}`);
  } catch (err) {
    console.error("[Webhook] handlePaymentFailed error:", err);
  } finally {
    await conn?.end();
  }
}