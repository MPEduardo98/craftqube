// features/admin/productos/lib/crearProducto.ts
// ─────────────────────────────────────────────────────────────
// Lógica de inserción de un producto completo (+ variantes,
// categorías, imágenes, metacampos, envío). Compartida por:
//   - POST /api/admin/productos      (alta manual, 1 producto)
//   - POST /api/admin/productos/importar (alta masiva vía JSON)
//
// No abre ni cierra transacción: el llamador controla
// beginTransaction/commit/rollback sobre la conexión recibida.
// ─────────────────────────────────────────────────────────────
import type { PoolConnection, ResultSetHeader } from "mysql2/promise";
import {
  syncProductoEnvio,
  syncVarianteAtributos,
  syncVarianteMetacampos,
  syncVarianteImagen,
  type AtributoInput,
  type MetacampoInput,
  type EnvioInput,
} from "./variante-sync";

export interface VarianteCreateInput {
  sku?:                   string | null;
  codigo_barras?:         string | null;
  precio_original?:       string | number | null;
  precio_final?:          string | number | null;
  costo?:                 string | number | null;
  stock?:                 string | number | null;
  es_default?:            boolean;
  vender_sin_existencia?: boolean;
  imagen?:                string | null;
  nombre?:                string | null;
  atributos?:             AtributoInput[];
  metacampos?:            MetacampoInput[];
}

export interface ImagenCreateInput {
  url:    string;
  alt?:   string | null;
  orden?: number;
}

export interface CrearProductoInput {
  titulo:            string;
  slug:               string;
  estado?:            "activo" | "inactivo" | "borrador";
  marca_id?:          number | null;
  descripcion?:       string | null;
  meta_titulo?:       string | null;
  meta_descripcion?:  string | null;
  categorias?:        number[];
  variantes?:         VarianteCreateInput[];
  imagenes?:          ImagenCreateInput[];
  metacampos?:        MetacampoInput[];
  envio?:             EnvioInput | null;
}

/** Inserta el producto y todo su árbol de relaciones. Devuelve el id creado. */
export async function crearProducto(conn: PoolConnection, data: CrearProductoInput): Promise<number> {
  const {
    titulo, slug, estado, marca_id, descripcion,
    meta_titulo, meta_descripcion,
    categorias = [], variantes = [], imagenes = [], metacampos = [], envio = null,
  } = data;

  // 1. Producto
  const [prodRes] = await conn.execute<ResultSetHeader>(
    `INSERT INTO productos (titulo, slug, estado, marca_id, descripcion, meta_titulo, meta_descripcion)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [titulo, slug, estado ?? "borrador", marca_id ?? null, descripcion ?? null,
     meta_titulo ?? null, meta_descripcion ?? null]
  );
  const productoId = prodRes.insertId;

  // 2. Categorías
  for (const catId of categorias) {
    await conn.execute("INSERT INTO producto_categorias (producto_id, categoria_id) VALUES (?, ?)", [productoId, catId]);
  }

  // 3. Variantes (+ dimensiones, atributos y metacampos por variante)
  for (const [i, v] of variantes.entries()) {
    // sku es UNIQUE y NOT NULL en la BD: si no viene, se genera uno
    // determinístico a partir del id de producto (ya insertado, único)
    // para no colisionar con otras variantes sin SKU.
    const sku = v.sku?.trim() || `SKU-${productoId}-${i + 1}`;
    const [varRes] = await conn.execute<ResultSetHeader>(
      `INSERT INTO producto_variantes
         (producto_id, sku, codigo_barras, precio_original, precio_final, costo, stock, es_default, vender_sin_existencia)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productoId, sku, v.codigo_barras ?? null,
       Number(v.precio_original) || 0, Number(v.precio_final) || 0,
       Number(v.costo) || 0, Number(v.stock) || 0,
       v.es_default ? 1 : 0, v.vender_sin_existencia ? 1 : 0]
    );
    const varianteId = varRes.insertId;
    await syncVarianteAtributos(conn, varianteId, v.atributos ?? []);
    await syncVarianteMetacampos(conn, productoId, varianteId, v.metacampos ?? []);
    await syncVarianteImagen(conn, productoId, varianteId, v.imagen, v.nombre);
  }

  // 3b. Envío (a nivel producto)
  await syncProductoEnvio(conn, productoId, envio);

  // 4. Imágenes
  for (const img of imagenes) {
    if (img.url?.trim()) {
      await conn.execute(
        "INSERT INTO producto_imagenes (producto_id, url, alt, orden) VALUES (?, ?, ?, ?)",
        [productoId, img.url.trim(), img.alt ?? null, Number(img.orden) || 0]
      );
    }
  }

  // 5. Metacampos a nivel producto
  for (const m of metacampos) {
    if (m.llave?.trim() && m.valor?.trim()) {
      await conn.execute(
        "INSERT INTO producto_metacampos (producto_id, llave, valor) VALUES (?, ?, ?)",
        [productoId, m.llave.trim(), m.valor.trim()]
      );
    }
  }

  return productoId;
}
