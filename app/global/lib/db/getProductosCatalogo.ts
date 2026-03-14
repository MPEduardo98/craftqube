// app/global/lib/db/getProductosCatalogo.ts
// ─────────────────────────────────────────────────────────────
// Versión server-side de /api/catalogo para SSR.
// Usado por: catalogo/page.tsx y categoria/[slug]/page.tsx
// El API route sigue existiendo para las llamadas client-side.
// ─────────────────────────────────────────────────────────────
import { pool } from "./pool";
import type { RowDataPacket } from "mysql2";
import type { Producto }      from "@/app/global/types/product";

export interface CatalogoFiltros {
  q?:         string;
  cat?:       string;
  marca?:     string;
  soloStock?: boolean;
  sort?:      string;
  page?:      number;
  limit?:     number;
}

export interface CatalogoResult {
  productos: Producto[];
  total:     number;
  pages:     number;
}

const ORDER_MAP: Record<string, string> = {
  reciente:    "p.created_at DESC",
  precio_asc:  "precio ASC",
  precio_desc: "precio DESC",
  az:          "p.titulo ASC",
  za:          "p.titulo DESC",
};

export async function getProductosCatalogo({
  q         = "",
  cat       = "",
  marca     = "",
  soloStock = false,
  sort      = "reciente",
  page      = 1,
  limit     = 24,
}: CatalogoFiltros = {}): Promise<CatalogoResult> {
  const safePage  = Math.max(1, page);
  const safeLimit = Math.min(48, Math.max(12, limit));
  const offset    = (safePage - 1) * safeLimit;
  const order     = ORDER_MAP[sort] ?? "p.created_at DESC";

  const params: (string | number)[] = [];
  const wheres: string[] = ["p.estado = 'activo'", "p.deleted_at IS NULL"];

  if (q) {
    wheres.push("(p.titulo LIKE ? OR v.sku LIKE ? OR m.nombre LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (cat) {
    wheres.push(`EXISTS (
      SELECT 1 FROM producto_categorias pc2
      INNER  JOIN categorias c2 ON c2.id = pc2.categoria_id
      WHERE  pc2.producto_id = p.id AND c2.slug = ?
    )`);
    params.push(cat);
  }
  if (marca) {
    wheres.push("m.nombre = ?");
    params.push(marca);
  }
  if (soloStock) {
    wheres.push("(v.stock > 0 OR v.vender_sin_existencia = 1)");
  }

  const whereSQL = `WHERE ${wheres.join(" AND ")}`;

  const baseQuery = `
    FROM   productos p
    LEFT   JOIN producto_categorias pc ON pc.producto_id  = p.id
    LEFT   JOIN categorias c           ON c.id            = pc.categoria_id
    LEFT   JOIN marcas m               ON m.id            = p.marca_id
    LEFT   JOIN producto_variantes v   ON v.producto_id   = p.id AND v.es_default = 1
    LEFT   JOIN producto_imagenes img  ON img.producto_id = p.id
                                       AND img.variante_id IS NULL
                                       AND img.id = (
                                         SELECT MIN(id) FROM producto_imagenes
                                         WHERE  producto_id = p.id AND variante_id IS NULL
                                       )
    ${whereSQL}
  `;

  const [countRows, dataRows] = await Promise.all([
    pool.execute<RowDataPacket[]>(
      `SELECT COUNT(DISTINCT p.id) AS total ${baseQuery}`,
      params
    ),
    pool.execute<RowDataPacket[]>(
      `SELECT
         p.id,
         p.titulo,
         p.descripcion_corta,
         p.slug,
         MIN(c.nombre)                          AS categoria,
         MIN(c.slug)                            AS categoria_slug,
         m.nombre                               AS marca,
         v.sku,
         v.precio_final                         AS precio,
         v.precio_original,
         v.stock,
         v.es_default,
         SUBSTRING_INDEX(MIN(img.url), '/', -1) AS imagen_nombre,
         MIN(img.alt)                           AS imagen_alt
       ${baseQuery}
       GROUP BY p.id, p.titulo, p.descripcion_corta, p.slug,
                m.nombre, v.sku, v.precio_final, v.precio_original,
                v.stock, v.es_default
       ORDER BY ${order}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    ),
  ]);

  const total = (countRows[0][0]?.total as number) ?? 0;

  return {
    productos: dataRows[0] as Producto[],
    total,
    pages:     Math.ceil(total / safeLimit),
  };
}