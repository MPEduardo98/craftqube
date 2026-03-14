// app/global/lib/db/getCategoriaBySlug.ts
// ─────────────────────────────────────────────────────────────
// Fetcher de categoría individual con unstable_cache (ISR 5 min).
// Usado por: app/(main)/categoria/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────
import { unstable_cache } from "next/cache";
import { pool }           from "./pool";
import type { RowDataPacket } from "mysql2";

export interface CategoriaDetalle {
  id:              number;
  nombre:          string;
  slug:            string;
  descripcion:     string | null;
  imagen:          string | null;
  total_productos: number;
}

async function fetchCategoriaBySlug(slug: string): Promise<CategoriaDetalle | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT
      c.id,
      c.nombre,
      c.slug,
      c.descripcion,
      c.imagen,
      COUNT(DISTINCT CASE
        WHEN p.estado = 'activo' AND p.deleted_at IS NULL
        THEN p.id
      END) AS total_productos
    FROM   categorias c
    LEFT   JOIN producto_categorias pc ON pc.categoria_id = c.id
    LEFT   JOIN productos p            ON p.id = pc.producto_id
    WHERE  c.slug = ?
    GROUP  BY c.id, c.nombre, c.slug, c.descripcion, c.imagen
    LIMIT  1
  `, [slug]);

  return (rows[0] as CategoriaDetalle) ?? null;
}

export function getCategoriaBySlug(slug: string): Promise<CategoriaDetalle | null> {
  return unstable_cache(
    () => fetchCategoriaBySlug(slug),
    [`categoria-detalle-${slug}`],
    { revalidate: 300, tags: ["categorias", `categoria-${slug}`] }
  )();
}