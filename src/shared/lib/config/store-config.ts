// shared/lib/config/store-config.ts
// ─────────────────────────────────────────────────────────────
// Lectura/escritura de la configuración global de la tienda
// (tabla `configuracion`, clave/valor). Memoizado con un TTL
// corto para no consultar la BD en cada render de listados.
// ─────────────────────────────────────────────────────────────
import { pool }                from "@/shared/lib/db/pool";
import type { RowDataPacket }  from "mysql2";

export type Moneda = "MXN" | "USD";

export interface StoreConfig {
  /** Moneda en la que el admin captura los precios */
  monedaCaptura: Moneda;
  /** Moneda en la que la tienda opera, cobra y muestra por defecto */
  monedaTienda:  Moneda;
}

const DEFAULTS: StoreConfig = { monedaCaptura: "USD", monedaTienda: "MXN" };
const TTL_MS = 30_000;

let cache: { value: StoreConfig; at: number } | null = null;

const asMoneda = (v: string | null | undefined, fallback: Moneda): Moneda =>
  v === "MXN" || v === "USD" ? v : fallback;

export async function getStoreConfig(): Promise<StoreConfig> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT clave, valor FROM configuracion WHERE clave IN ('moneda_captura','moneda_tienda')"
    );
    const map = new Map(rows.map((r) => [r.clave as string, r.valor as string]));
    const value: StoreConfig = {
      monedaCaptura: asMoneda(map.get("moneda_captura"), DEFAULTS.monedaCaptura),
      monedaTienda:  asMoneda(map.get("moneda_tienda"),  DEFAULTS.monedaTienda),
    };
    cache = { value, at: Date.now() };
    return value;
  } catch (err) {
    console.error("[getStoreConfig]", err);
    return DEFAULTS;
  }
}

export async function setStoreConfig(partial: Partial<StoreConfig>): Promise<void> {
  const entries: [string, string][] = [];
  if (partial.monedaCaptura) entries.push(["moneda_captura", partial.monedaCaptura]);
  if (partial.monedaTienda)  entries.push(["moneda_tienda",  partial.monedaTienda]);
  if (entries.length === 0) return;

  for (const [clave, valor] of entries) {
    await pool.execute(
      `INSERT INTO configuracion (clave, valor) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
      [clave, valor]
    );
  }
  cache = null; // invalidar
}
