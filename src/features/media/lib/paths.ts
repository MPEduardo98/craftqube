// features/media/lib/paths.ts
// Helpers de rutas/keys para el gestor de medios (R2).

/**
 * Normaliza un prefijo de carpeta recibido del cliente.
 * Evita rutas absolutas, "..", segmentos vacíos y barras duplicadas.
 * Devuelve "" (raíz) o algo como "categorias/banners/".
 */
export function normalizarPrefijo(raw: string | null | undefined): string {
  if (!raw) return "";
  const limpio = raw
    .replace(/\\/g, "/")
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s && s !== "." && s !== "..")
    .join("/");
  return limpio ? `${limpio}/` : "";
}

/** Valida el nombre de una carpeta (un solo segmento). */
export function nombreCarpetaValido(nombre: string): boolean {
  return /^[a-z0-9][a-z0-9._-]*$/i.test(nombre);
}

/** Valida un nombre de archivo: sin barras ni escapes de ruta. */
export function nombreArchivoValido(nombre: string): boolean {
  return /^[a-z0-9][a-z0-9._-]*$/i.test(nombre) && !nombre.includes("..");
}
