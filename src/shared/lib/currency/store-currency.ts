// shared/lib/currency/store-currency.ts
// ─────────────────────────────────────────────────────────────
// Conversión de la moneda de CAPTURA (lo que el admin escribe)
// a la moneda de la TIENDA (lo que se cobra y muestra).
//
// Se aplica en el punto donde el precio sale de la BD hacia el
// frontend, de modo que carrito, pedidos y Stripe sigan
// operando en la moneda de la tienda (MXN) sin cambios.
// ─────────────────────────────────────────────────────────────
import { getStoreConfig } from "@/shared/lib/config/store-config";

/** Último recurso si todas las fuentes fallan */
const FALLBACK_USD_MXN = 17.5;

/**
 * Tipo de cambio FIX de Banxico (serie SF43718): MXN por 1 USD.
 * Es el tipo de cambio oficial; se publica una vez por día hábil.
 * Requiere BANXICO_TOKEN. Devuelve null si no hay token o falla.
 */
async function fetchBanxicoFix(): Promise<number | null> {
  const token = process.env.BANXICO_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      "https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno",
      { headers: { "Bmx-Token": token }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const dato = data?.bmx?.series?.[0]?.datos?.[0]?.dato;
    const rate = Number(dato);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

/** Respaldo: tipo de cambio de mercado (open.er-api.com). */
async function fetchErApiRate(): Promise<number | null> {
  try {
    const res  = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.result !== "success" || !data.rates?.MXN) return null;
    const rate = Number(data.rates.MXN);
    return Number.isFinite(rate) && rate > 0 ? rate : null;
  } catch {
    return null;
  }
}

/**
 * Tipo de cambio: cuántos MXN equivale 1 USD. Cacheado 1h por Next.
 * Prioridad: Banxico FIX (oficial) → open.er-api.com (mercado) → fallback fijo.
 */
export async function getUsdToMxnRate(): Promise<number> {
  return (await fetchBanxicoFix()) ?? (await fetchErApiRate()) ?? FALLBACK_USD_MXN;
}

export interface StorePricing {
  monedaCaptura: "MXN" | "USD";
  monedaTienda:  "MXN" | "USD";
  /** Factor multiplicador captura → tienda */
  factor:        number;
}

/**
 * Resuelve el factor de conversión captura → tienda.
 * Sólo soporta USD→MXN (el caso del negocio); cualquier otra
 * combinación con monedas distintas usa el inverso/rate según aplique.
 */
export async function getStorePricing(): Promise<StorePricing> {
  const { monedaCaptura, monedaTienda } = await getStoreConfig();

  if (monedaCaptura === monedaTienda) {
    return { monedaCaptura, monedaTienda, factor: 1 };
  }

  const usdMxn = await getUsdToMxnRate();
  // captura USD → tienda MXN
  if (monedaCaptura === "USD" && monedaTienda === "MXN") {
    return { monedaCaptura, monedaTienda, factor: usdMxn };
  }
  // captura MXN → tienda USD (inverso)
  if (monedaCaptura === "MXN" && monedaTienda === "USD") {
    return { monedaCaptura, monedaTienda, factor: 1 / usdMxn };
  }

  return { monedaCaptura, monedaTienda, factor: 1 };
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Convierte un monto de la moneda de captura a la de la tienda. */
export function toStoreCurrency(amount: number | null | undefined, pricing: StorePricing): number | null {
  if (amount === null || amount === undefined) return null;
  return round2(Number(amount) * pricing.factor);
}
