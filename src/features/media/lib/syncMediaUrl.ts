// features/media/lib/syncMediaUrl.ts
// ─────────────────────────────────────────────────────────────
// Cuando un objeto de R2 se renombra o se mueve de carpeta, su URL
// pública cambia. Las referencias ya guardadas en la BD apuntarían a
// un objeto inexistente, así que hay que reescribirlas.
//
// Las URLs pueden estar persistidas con hosts distintos (el CDN actual
// o un host legacy *.r2.dev), por eso se compara por el key del objeto
// y no por la URL completa.
// ─────────────────────────────────────────────────────────────
import { pool }       from "@/shared/lib/db/pool";
import { keyFromUrl } from "@/features/media/lib/cdn";

export interface MediaUrlSyncResult {
  productoImagenes: number;
  categorias:       number;
}

/**
 * Reapunta a `nuevaUrl` todas las filas que referenciaban `viejaUrl`.
 * Devuelve cuántas filas se actualizaron en cada tabla.
 */
export async function syncMediaUrlEnBD(
  viejaUrl: string,
  nuevaUrl: string
): Promise<MediaUrlSyncResult> {
  const viejoKey = keyFromUrl(viejaUrl);
  // Coincide con cualquier host que termine en el mismo key, y también con
  // el key guardado "pelado" (sin host).
  const likeKey  = `%${viejoKey}`;

  const [imgRes] = await pool.execute(
    "UPDATE producto_imagenes SET url = ? WHERE url = ? OR url LIKE ?",
    [nuevaUrl, viejoKey, likeKey]
  );

  const [catRes] = await pool.execute(
    "UPDATE categorias SET imagen = ? WHERE imagen = ? OR imagen LIKE ?",
    [nuevaUrl, viejoKey, likeKey]
  );

  return {
    productoImagenes: (imgRes as { affectedRows?: number }).affectedRows ?? 0,
    categorias:       (catRes as { affectedRows?: number }).affectedRows ?? 0,
  };
}

/** Cuenta cuántas referencias existen en la BD para una URL dada. */
export async function contarReferenciasMedia(url: string): Promise<number> {
  const key     = keyFromUrl(url);
  const likeKey = `%${key}`;

  const [rows] = await pool.execute(
    `SELECT
       (SELECT COUNT(*) FROM producto_imagenes WHERE url = ? OR url LIKE ?) +
       (SELECT COUNT(*) FROM categorias        WHERE imagen = ? OR imagen LIKE ?) AS total`,
    [key, likeKey, key, likeKey]
  );

  const total = (rows as { total?: number }[])[0]?.total;
  return Number(total ?? 0);
}
