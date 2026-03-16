// app/global/lib/resolveImageUrl.ts

/**
 * Resuelve la URL de una imagen de producto.
 * - URL completa (R2 / http) → se devuelve tal cual
 * - Solo nombre de archivo → construye ruta local /productos/[id]/[nombre]
 */
export function resolveImageUrl(
  url:        string | null | undefined,
  productoId: number | undefined,
): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!productoId) return null;
  return `/productos/${productoId}/${url}`;
}