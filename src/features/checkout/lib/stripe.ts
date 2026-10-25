// features/checkout/lib/stripe.ts
// ─────────────────────────────────────────────────────────────
// Stripe.js se pide una sola vez por visita. El marco del checkout
// lo llama al montarse, así que para cuando el comprador llega al
// paso de pago el script ya está descargado y los campos de tarjeta
// se montan sin espera.
// ─────────────────────────────────────────────────────────────
import { loadStripe, type Stripe } from "@stripe/stripe-js";

let promesa: Promise<Stripe | null> | null = null;

export function obtenerStripe(): Promise<Stripe | null> {
  if (!promesa) promesa = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return promesa;
}
