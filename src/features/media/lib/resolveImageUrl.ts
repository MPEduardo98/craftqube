// app/global/lib/resolveImageUrl.ts
import { toCdnUrl } from "@/features/media/lib/cdn";

/**
 * Resuelve la URL de una imagen de producto.
 * - URL completa (R2 / CDN / http) → se normaliza al CDN actual (reescribe hosts r2.dev legacy)
 * - Solo nombre de archivo → construye ruta local /productos/[id]/[nombre]
 */
export function resolveImageUrl(
  url:        string | null | undefined,
  productoId: number | undefined,
): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return toCdnUrl(url);
  if (!productoId) return null;
  return `/productos/${productoId}/${url}`;
}
