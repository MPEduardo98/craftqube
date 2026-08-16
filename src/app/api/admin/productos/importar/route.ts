// app/api/admin/productos/importar/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/admin/productos/importar
// Alta masiva de productos desde un JSON: { "productos": [...] }
//
// Cada producto se crea en su propia transacción — si uno falla
// (slug/SKU duplicado, datos inválidos, etc.) no afecta a los demás.
// Marca y categorías se resuelven por nombre (get-or-create).
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                       from "@/shared/lib/db/pool";
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { crearProducto, type CrearProductoInput } from "@/features/admin/productos/lib/crearProducto";
import { slugify }                    from "@/features/admin/productos/components/producto-form-types";

const ESTADOS = new Set(["activo", "inactivo", "borrador"]);
const MAX_PRODUCTOS = 200;

interface ImportItem {
  titulo?:            string;
  slug?:               string;
  estado?:             string;
  marca?:              string;
  categorias?:         string[];
  descripcion?:        string;
  meta_titulo?:        string;
  meta_descripcion?:   string;
  envio?:              CrearProductoInput["envio"];
  imagenes?:           CrearProductoInput["imagenes"];
  metacampos?:         CrearProductoInput["metacampos"];
  variantes?:          CrearProductoInput["variantes"];
}

interface ResultadoImport {
  index:   number;
  titulo:  string;
  success: boolean;
  id?:     number;
  error?:  string;
}

async function resolveMarcaId(conn: PoolConnection, nombre: string | undefined | null): Promise<number | null> {
  const n = nombre?.trim();
  if (!n) return null;

  const [rows] = await conn.query<RowDataPacket[]>("SELECT id FROM marcas WHERE nombre = ? LIMIT 1", [n]);
  if (rows[0]) return rows[0].id;

  const [res] = await conn.execute<ResultSetHeader>(
    "INSERT INTO marcas (nombre, slug) VALUES (?, ?)", [n, slugify(n)]
  );
  return res.insertId;
}

async function resolveCategoriaIds(conn: PoolConnection, nombres: string[] | undefined | null): Promise<number[]> {
  const ids: number[] = [];
  for (const raw of nombres ?? []) {
    const n = raw?.trim();
    if (!n) continue;

    const [rows] = await conn.query<RowDataPacket[]>("SELECT id FROM categorias WHERE nombre = ? LIMIT 1", [n]);
    if (rows[0]) { ids.push(rows[0].id); continue; }

    const [res] = await conn.execute<ResultSetHeader>(
      "INSERT INTO categorias (nombre, slug) VALUES (?, ?)", [n, slugify(n)]
    );
    ids.push(res.insertId);
  }
  return ids;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "JSON inválido" }, { status: 400 });
  }

  const productos: ImportItem[] | null =
    Array.isArray((body as { productos?: unknown })?.productos)
      ? (body as { productos: ImportItem[] }).productos
      : Array.isArray(body)
        ? (body as ImportItem[])
        : null;

  if (!productos || productos.length === 0) {
    return NextResponse.json(
      { success: false, error: 'Formato inválido. Se espera { "productos": [ {...}, ... ] } con al menos un producto.' },
      { status: 400 }
    );
  }
  if (productos.length > MAX_PRODUCTOS) {
    return NextResponse.json(
      { success: false, error: `Máximo ${MAX_PRODUCTOS} productos por importación.` },
      { status: 400 }
    );
  }

  const resultados: ResultadoImport[] = [];

  for (let i = 0; i < productos.length; i++) {
    const item   = productos[i];
    const titulo = item?.titulo?.trim() ?? "";
    const etiqueta = titulo || `(producto ${i + 1})`;

    if (!titulo) {
      resultados.push({ index: i, titulo: etiqueta, success: false, error: "Falta el campo 'titulo'" });
      continue;
    }
    if (!Array.isArray(item.variantes) || item.variantes.length === 0) {
      resultados.push({ index: i, titulo: etiqueta, success: false, error: "Debe incluir al menos una variante en 'variantes'" });
      continue;
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const slug = item.slug?.trim() || slugify(titulo);

      // Duplicado por título o slug (no solo por la UNIQUE de slug/sku:
      // cubre el caso de un slug distinto pero mismo título).
      const [dupRows] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM productos WHERE deleted_at IS NULL AND (slug = ? OR titulo = ?) LIMIT 1",
        [slug, titulo]
      );
      if (dupRows[0]) {
        throw new Error(`Ya existe un producto con este título o slug (id ${dupRows[0].id})`);
      }

      const marca_id      = await resolveMarcaId(conn, item.marca);
      const categoriaIds  = await resolveCategoriaIds(conn, item.categorias);
      const estado: CrearProductoInput["estado"] =
        ESTADOS.has(item.estado ?? "") ? (item.estado as CrearProductoInput["estado"]) : "borrador";

      const productoId = await crearProducto(conn, {
        titulo, slug, estado, marca_id,
        descripcion:       item.descripcion ?? null,
        meta_titulo:       item.meta_titulo ?? null,
        meta_descripcion:  item.meta_descripcion ?? null,
        categorias:        categoriaIds,
        variantes:         item.variantes,
        imagenes:          item.imagenes ?? [],
        metacampos:        item.metacampos ?? [],
        envio:             item.envio ?? null,
      });

      await conn.commit();
      resultados.push({ index: i, titulo, success: true, id: productoId });
    } catch (err: unknown) {
      await conn.rollback();
      const isDuplicate = (err as NodeJS.ErrnoException & { code?: string }).code === "ER_DUP_ENTRY";
      const message = isDuplicate
        ? "El slug o SKU ya existe"
        : err instanceof Error ? err.message : "Error desconocido";
      console.error(`[POST /api/admin/productos/importar] item ${i}`, err);
      resultados.push({ index: i, titulo: etiqueta, success: false, error: message });
    } finally {
      conn.release();
    }
  }

  const creados  = resultados.filter(r => r.success).length;
  const fallidos = resultados.length - creados;

  return NextResponse.json({ success: true, data: { creados, fallidos, resultados } });
}
