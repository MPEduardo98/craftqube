// shared/lib/stripe/client.ts
// ─────────────────────────────────────────────────────────────
// Instancia única de Stripe para todo el servidor.
// Antes cada ruta hacía su propio `new Stripe(...)` con la
// apiVersion copiada a mano: cuatro sitios que podían divergir.
// ─────────────────────────────────────────────────────────────
import Stripe from "stripe";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[stripe] Falta la variable de entorno ${name}. ` +
      `El checkout no puede operar sin ella.`
    );
  }
  return value;
}

/** Lanza en el primer uso (no al importar) si falta la clave. */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
      // Sin apiVersion explícita: el SDK usa la versión con la que
      // fueron generados sus tipos, así no se desincronizan.
      appInfo: { name: "CraftQube", url: "https://craftqube.com" },
    });
  }
  return _stripe;
}

/** Secreto de firma del webhook. Lanza si no está configurado. */
export function getWebhookSecret(): string {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

/**
 * Stripe trabaja en la unidad mínima (centavos). MXN y USD son
 * ambas de 2 decimales, así que ×100 + redondeo es correcto para
 * las dos monedas que maneja la tienda.
 */
export function aUnidadMinima(monto: number): number {
  return Math.round(monto * 100);
}

/** Inversa de `aUnidadMinima`, para comparar contra totales de BD. */
export function desdeUnidadMinima(monto: number): number {
  return Math.round(monto) / 100;
}

/**
 * Límite operativo de OXXO: Stripe rechaza vouchers por encima de
 * 10,000 MXN. Se valida antes de crear el PaymentIntent para dar un
 * error legible en vez de un fallo crudo de la API.
 */
export const OXXO_MONTO_MAXIMO_MXN = 10_000;

/** Días de vigencia del voucher OXXO. La UI promete 72 h = 3 días. */
export const OXXO_DIAS_VIGENCIA = 3;
