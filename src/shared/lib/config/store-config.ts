// shared/lib/config/store-config.ts
// ─────────────────────────────────────────────────────────────
// Lectura/escritura de la configuración global de la tienda
// (tabla `configuracion`, clave/valor). Memoizado con un TTL
// corto para no consultar la BD en cada render de listados.
//
// Aquí vive todo lo que cambia de una tienda a otra: identidad
// (nombre, logo, contacto), tema del panel y moneda. El código
// no debe traer ninguno de estos valores escrito a mano — si un
// componente necesita el nombre o el color de la tienda, lo pide
// por aquí.
// ─────────────────────────────────────────────────────────────
import { pool }                from "@/shared/lib/db/pool";
import type { RowDataPacket }  from "mysql2";

export type Moneda = "MXN" | "USD";

export interface StoreConfig {
  // ── Identidad ──────────────────────────────────────────────
  /** Nombre comercial: títulos del panel, emails, metadatos */
  nombre:      string;
  /** Descripción corta, para metadatos */
  descripcion: string;
  /** Logo del panel. Vacío = se muestra el nombre en texto */
  logoUrl:     string;
  faviconUrl:  string;
  email:       string;
  telefono:    string;

  // ── Tema del panel ─────────────────────────────────────────
  /** Color del sidebar y elementos principales */
  colorPrimario: string;
  /** Color de acentos, enlaces y estados activos */
  colorAcento:   string;

  // ── Moneda ─────────────────────────────────────────────────
  /** Moneda en la que el admin captura los precios */
  monedaCaptura: Moneda;
  /** Moneda en la que la tienda opera, cobra y muestra por defecto */
  monedaTienda:  Moneda;
}

/**
 * Valores por defecto: se usan cuando la clave no existe en la BD
 * y cuando la consulta falla. Deliberadamente genéricos — una
 * tienda recién creada arranca sin marca, no con la de otra.
 */
const DEFAULTS: StoreConfig = {
  nombre:        "Mi Tienda",
  descripcion:   "",
  logoUrl:       "",
  faviconUrl:    "",
  email:         "",
  telefono:      "",
  colorPrimario: "#1238a0",
  colorAcento:   "#2563EB",
  monedaCaptura: "MXN",
  monedaTienda:  "MXN",
};

/**
 * Mapa clave en BD → campo del objeto. Es la única fuente de
 * verdad de esa correspondencia: lectura y escritura lo usan,
 * así que agregar un ajuste nuevo es añadir una línea aquí.
 */
const CLAVES = {
  tienda_nombre:       "nombre",
  tienda_descripcion:  "descripcion",
  tienda_logo_url:     "logoUrl",
  tienda_favicon_url:  "faviconUrl",
  tienda_email:        "email",
  tienda_telefono:     "telefono",
  tema_color_primario: "colorPrimario",
  tema_color_acento:   "colorAcento",
  moneda_captura:      "monedaCaptura",
  moneda_tienda:       "monedaTienda",
} as const satisfies Record<string, keyof StoreConfig>;

const CAMPO_A_CLAVE = Object.fromEntries(
  Object.entries(CLAVES).map(([clave, campo]) => [campo, clave])
) as Record<keyof StoreConfig, string>;

const TTL_MS = 30_000;

let cache: { value: StoreConfig; at: number } | null = null;

const asMoneda = (v: string | null | undefined, fallback: Moneda): Moneda =>
  v === "MXN" || v === "USD" ? v : fallback;

/** Sólo #RGB o #RRGGBB: el valor se inyecta como variable CSS. */
const asColor = (v: string | null | undefined, fallback: string): string =>
  typeof v === "string" && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim())
    ? v.trim()
    : fallback;

const asTexto = (v: string | null | undefined, fallback: string): string =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : fallback;

export async function getStoreConfig(): Promise<StoreConfig> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  try {
    const claves = Object.keys(CLAVES);
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT clave, valor FROM configuracion WHERE clave IN (?)",
      [claves]
    );
    const map = new Map(rows.map((r) => [r.clave as string, r.valor as string]));

    const value: StoreConfig = {
      nombre:        asTexto(map.get("tienda_nombre"),       DEFAULTS.nombre),
      descripcion:   asTexto(map.get("tienda_descripcion"),  DEFAULTS.descripcion),
      logoUrl:       asTexto(map.get("tienda_logo_url"),     DEFAULTS.logoUrl),
      faviconUrl:    asTexto(map.get("tienda_favicon_url"),  DEFAULTS.faviconUrl),
      email:         asTexto(map.get("tienda_email"),        DEFAULTS.email),
      telefono:      asTexto(map.get("tienda_telefono"),     DEFAULTS.telefono),
      colorPrimario: asColor(map.get("tema_color_primario"), DEFAULTS.colorPrimario),
      colorAcento:   asColor(map.get("tema_color_acento"),   DEFAULTS.colorAcento),
      monedaCaptura: asMoneda(map.get("moneda_captura"),     DEFAULTS.monedaCaptura),
      monedaTienda:  asMoneda(map.get("moneda_tienda"),      DEFAULTS.monedaTienda),
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

  for (const [campo, valor] of Object.entries(partial) as [keyof StoreConfig, string | undefined][]) {
    if (valor === undefined) continue;
    const clave = CAMPO_A_CLAVE[campo];
    if (!clave) continue;               // campo desconocido: se ignora
    entries.push([clave, String(valor)]);
  }
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

/** Fuerza la relectura en la próxima llamada. Para tests y tras escrituras externas. */
export function invalidateStoreConfig(): void {
  cache = null;
}

/**
 * Identidad lista para las vistas previas del admin (SEO, emails).
 *
 * El dominio no se guarda en `configuracion`: lo define el deploy
 * vía NEXT_PUBLIC_SITE_URL, que es donde la tienda realmente vive.
 * Se devuelve sin protocolo ni barra final, como lo muestra Google.
 */
export async function getStoreIdentity(): Promise<{ nombre: string; dominio: string }> {
  const { nombre } = await getStoreConfig();
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  let dominio = "";
  try {
    if (raw) dominio = new URL(raw).host;
  } catch {
    dominio = raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  }
  return { nombre, dominio };
}
