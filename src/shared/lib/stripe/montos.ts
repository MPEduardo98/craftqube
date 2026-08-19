// shared/lib/stripe/montos.ts
// ─────────────────────────────────────────────────────────────
// Mínimos de cobro que impone Stripe, por moneda.
//
// Vive aparte de `client.ts` a propósito: aquí no se importa el SDK
// de Stripe, así que el cálculo de totales puede usar estos límites
// sin arrastrar la librería del servidor de pagos.
//
// Un total por debajo del mínimo hacía reventar la creación del
// PaymentIntent con `amount_too_small` (500 crudo en /checkout/pagar).
// Comprobándolo antes, el comprador ve un mensaje que entiende y no
// se crea un pedido que jamás podría cobrarse.
// ─────────────────────────────────────────────────────────────

/** Importe mínimo que Stripe acepta cobrar, en unidades de la moneda. */
const MINIMOS: Record<string, number> = {
  MXN: 10,
  USD: 0.5,
};

/** Si apareciera una moneda no listada, el mínimo más alto conocido. */
const MINIMO_PREDETERMINADO = 10;

export function montoMinimoStripe(moneda: string): number {
  return MINIMOS[String(moneda ?? "").toUpperCase()] ?? MINIMO_PREDETERMINADO;
}
