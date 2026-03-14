// app/global/lib/db/getAllSlugs.ts
// ─────────────────────────────────────────────────────────────
// Fetchers ligeros para sitemap.xml y generateStaticParams.
// Solo traen slugs + fecha — sin joins innecesarios.
// ─────────────────────────────────────────────────────────────
import { pool } from "./pool";
import type { RowDataPacket } from "mysql2";

export interface ProductoSlugRow {
  slug:       string;
  updated_at: string;
}

export interface CategoriaSlugRow {
  slug: string;
}

/** Todos los productos activos — para sitemap y generateStaticParams */
export async function getAllProductoSlugs(): Promise<ProductoSlugRow[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT slug, updated_at
    FROM   productos
    WHERE  estado = 'activo'
      AND  deleted_at IS NULL
    ORDER  BY id ASC
  `);
  return rows as ProductoSlugRow[];
}

/** Categorías que tienen al menos un producto activo */
export async function getAllCategoriaSlugs(): Promise<CategoriaSlugRow[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT DISTINCT c.slug
    FROM   categorias c
    INNER  JOIN producto_categorias pc ON pc.categoria_id = c.id
    INNER  JOIN productos p            ON p.id = pc.producto_id
    WHERE  p.estado    = 'activo'
      AND  p.deleted_at IS NULL
    ORDER  BY c.id ASC
  `);
  return rows as CategoriaSlugRow[];
}