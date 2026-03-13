// app/global/lib/db/getCategorias.ts
// ─────────────────────────────────────────────────────────────
// Fetcher de categorías con dos capas de caché:
//  1. unstable_cache de Next.js (Data Cache, revalidación ISR)
//  2. Pool singleton (sin TCP overhead por request)
//
// Usado por: app/layout.tsx (Server Component) → Header props
// TTL: 5 minutos. Las categorías cambian muy poco.
// ─────────────────────────────────────────────────────────────
import { unstable_cache } from "next/cache";
import { pool }           from "./pool";
import type { RowDataPacket } from "mysql2";

export interface CategoriaNav {
  id:               number;
  nombre:           string;
  slug:             string;
  descripcion:      string | null;
  imagen:           string | null;
  total_productos:  number;
}

async function fetchCategorias(): Promise<CategoriaNav[]> {
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
    FROM categorias c
    LEFT JOIN producto_categorias pc ON pc.categoria_id = c.id
    LEFT JOIN productos p            ON p.id = pc.producto_id
    WHERE c.parent_id IS NULL
    GROUP BY c.id, c.nombre, c.slug, c.descripcion, c.imagen
    ORDER BY c.id ASC
  `);

  return rows as CategoriaNav[];
}

// Next.js Data Cache — revalida cada 5 min.
// En producción se sirve desde memoria del proceso (ISR-style).
// En desarrollo se bypasea automáticamente con cada hot-reload.
export const getCategorias = unstable_cache(
  fetchCategorias,
  ["nav-categorias"],
  { revalidate: 300, tags: ["categorias"] }
);