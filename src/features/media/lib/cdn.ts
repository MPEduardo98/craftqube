// app/global/lib/cdn.ts
//
// Fuente ÚNICA de verdad para el dominio público del CDN (Cloudflare R2).
// Cambiar de dominio en el futuro = cambiar SOLO la variable NEXT_PUBLIC_CDN_URL.
//
// NEXT_PUBLIC_ es obligatorio: este módulo se usa también en el cliente
// (resolveImageUrl corre en componentes "use client").

/** Base pública del CDN, sin slash final. Ej: https://cdn.craftqube.mx */
export const CDN_BASE_URL = (
  process.env.NEXT_PUBLIC_CDN_URL ?? process.env.R2_PUBLIC_URL ?? ""
).replace(/\/$/, "");

/**
 * Hosts antiguos de R2 cuyas URLs quedaron persistidas en la BD
 * (ej: https://pub-2f03....r2.dev/...). Se reescriben al CDN actual al renderizar,
 * así no hace falta migrar miles de filas.
 */
const LEGACY_R2_HOST_RE = /^https?:\/\/[^/]*\.r2\.dev/i;

/**
 * Normaliza cualquier referencia de imagen al CDN actual.
 * - URL completa de un host R2 legacy (r2.dev) → reescribe el host al CDN actual.
 * - Cualquier otra URL completa (http/https) → se devuelve tal cual.
 * - key/path (ej: "productos/foo.jpg") → construye la URL contra el CDN.
 *
 * Devuelve null si no hay valor.
 */
export function toCdnUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  // URL absoluta
  if (/^https?:\/\//i.test(value)) {
    if (CDN_BASE_URL && LEGACY_R2_HOST_RE.test(value)) {
      return value.replace(LEGACY_R2_HOST_RE, CDN_BASE_URL);
    }
    return value;
  }

  // key / path relativo → contra el CDN
  const key = value.replace(/^\/+/, "");
  return CDN_BASE_URL ? `${CDN_BASE_URL}/${key}` : `/${key}`;
}

/** Construye la URL pública de un objeto de R2 a partir de su key. */
export function cdnUrl(key: string): string {
  return `${CDN_BASE_URL}/${key.replace(/^\/+/, "")}`;
}

/**
 * Extrae el key de R2 desde una URL pública, sin importar el host
 * (sirve tanto para URLs nuevas del CDN como para las legacy de r2.dev).
 */
export function keyFromUrl(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\/+/, "");
  } catch {
    // No es URL absoluta: ya es (o se asume) un key.
    return url.replace(/^\/+/, "");
  }
}
