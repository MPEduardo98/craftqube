// app/global/lib/db/getProductoBySlug.ts
// ─────────────────────────────────────────────────────────────
// Optimizado:
// • Usa el pool singleton (sin TCP overhead por request)
// • Queries secundarias en paralelo con Promise.all
// ─────────────────────────────────────────────────────────────
import { pool }    from "./pool";
import type { ProductoDetalle } from "@/app/global/types/product-detail";

export async function getProductoBySlug(slug: string): Promise<ProductoDetalle | null> {
  try {
    // ── 1. Query principal ────────────────────────────────
    const [productoRows] = await pool.execute<any[]>(`
      SELECT
        p.id, p.titulo, p.descripcion_corta, p.descripcion_larga,
        p.slug, p.estado, p.meta_titulo, p.meta_descripcion,
        p.created_at, p.updated_at,
        m.id       AS marca_id,
        m.nombre   AS marca,
        m.slug     AS marca_slug,
        m.logo_url AS marca_logo
      FROM productos p
      LEFT JOIN marcas m ON m.id = p.marca_id
      WHERE p.slug = ? AND p.estado = 'activo' AND p.deleted_at IS NULL
      LIMIT 1
    `, [slug]);

    if (!productoRows.length) return null;

    const producto = productoRows[0];

    // ── 2. Queries secundarias EN PARALELO ────────────────
    const [
      [categorias],
      [imagenes],
      [variantes],
      [varianteAtributos],
      [metacampos],
      [etiquetas],
    ] = await Promise.all([
      pool.execute<any[]>(`
        SELECT c.id, c.nombre, c.slug
        FROM categorias c
        INNER JOIN producto_categorias pc ON pc.categoria_id = c.id
        WHERE pc.producto_id = ?
      `, [producto.id]),

      pool.execute<any[]>(`
        SELECT id, url, alt, orden, variante_id
        FROM producto_imagenes
        WHERE producto_id = ?
        ORDER BY orden ASC, id ASC
      `, [producto.id]),

      pool.execute<any[]>(`
        SELECT
          v.id, v.sku, v.codigo_barras, v.precio_original, v.precio_final,
          v.stock, v.es_default, v.vender_sin_existencia,
          d.largo, d.ancho, d.alto, d.peso, d.medida_unidad, d.peso_unidad
        FROM producto_variantes v
        LEFT JOIN producto_dimensiones d ON d.variante_id = v.id
        WHERE v.producto_id = ?
        ORDER BY v.es_default DESC, v.id ASC
      `, [producto.id]),

      pool.execute<any[]>(`
        SELECT
          vv.variante_id,
          a.id   AS atributo_id,
          a.nombre AS atributo,
          av.id  AS valor_id,
          av.valor
        FROM variante_valores vv
        INNER JOIN atributos_valores av ON av.id = vv.atributo_valor_id
        INNER JOIN atributos a          ON a.id  = av.atributo_id
        WHERE vv.variante_id IN (
          SELECT id FROM producto_variantes WHERE producto_id = ?
        )
        ORDER BY a.id ASC, av.id ASC
      `, [producto.id]),

      pool.execute<any[]>(`
        SELECT id, variante_id, llave, valor
        FROM producto_metacampos
        WHERE producto_id = ?
        ORDER BY id ASC
      `, [producto.id]),

      pool.execute<any[]>(`
        SELECT e.id, e.nombre, e.slug, e.tipo
        FROM etiquetas e
        INNER JOIN producto_etiquetas pe ON pe.etiqueta_id = e.id
        WHERE pe.producto_id = ?
      `, [producto.id]),
    ]);

    // ── 3. Mapeo atributos por variante ───────────────────
    const atributosPorVariante: Record<number, { atributo_id: number; atributo: string; valor_id: number; valor: string }[]> = {};
    for (const row of varianteAtributos) {
      if (!atributosPorVariante[row.variante_id]) atributosPorVariante[row.variante_id] = [];
      atributosPorVariante[row.variante_id].push({
        atributo_id: row.atributo_id,
        atributo:    row.atributo,
        valor_id:    row.valor_id,
        valor:       row.valor,
      });
    }

    const variantesCompletas = variantes.map((v: any) => ({
      ...v,
      atributos:  atributosPorVariante[v.id] || [],
      metacampos: metacampos.filter((m: any) => m.variante_id === v.id),
    }));

    return {
      ...producto,
      categorias,
      imagenes,
      variantes:  variantesCompletas,
      metacampos: metacampos.filter((m: any) => m.variante_id === null),
      etiquetas,
    } as ProductoDetalle;

  } catch (error) {
    console.error(`[getProductoBySlug] Error for slug "${slug}":`, error);
    return null;
  }
}