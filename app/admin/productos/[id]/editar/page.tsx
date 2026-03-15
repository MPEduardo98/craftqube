// app/(admin)/admin/productos/[id]/editar/page.tsx
// ─────────────────────────────────────────────────────────────
// Página: /admin/productos/[id]/editar
// Server Component: carga el producto completo con sus
// relaciones (variantes, imágenes, metacampos, categorías)
// y lo pasa al ProductoForm en modo "editar".
// ─────────────────────────────────────────────────────────────
import { notFound }       from "next/navigation";
import { pool }           from "@/app/global/lib/db/pool";
import type { RowDataPacket } from "mysql2";
import { ProductoForm }   from "../../components/ProductoForm";
import type {
  ProductoFormData,
  VarianteForm,
  ImagenForm,
  MetacampoForm,
} from "../../components/ProductoForm";

/* ── Tipos internos de BD ──────────────────────────────────── */
interface ProductoRow extends RowDataPacket {
  id:                number;
  titulo:            string;
  slug:              string;
  estado:            "activo" | "inactivo" | "borrador";
  marca_id:          number | null;
  descripcion_corta: string | null;
  descripcion_larga: string | null;
  meta_titulo:       string | null;
  meta_descripcion:  string | null;
}

interface VarianteRow extends RowDataPacket {
  id:                    number;
  sku:                   string;
  codigo_barras:         string | null;
  precio_original:       number;
  precio_final:          number;
  costo:                 number;
  stock:                 number;
  es_default:            number;
  vender_sin_existencia: number;
}

interface ImagenRow extends RowDataPacket {
  url:   string;
  alt:   string | null;
  orden: number;
}

interface MetacampoRow extends RowDataPacket {
  llave: string;
  valor: string;
}

interface CategoriaRow extends RowDataPacket {
  id:     number;
  nombre: string;
  slug:   string;
}

interface MarcaRow extends RowDataPacket {
  id:     number;
  nombre: string;
}

/* ── Fetch del producto completo ───────────────────────────── */
async function fetchProducto(id: number): Promise<ProductoFormData | null> {
  const [[producto]] = await pool.execute<ProductoRow[]>(
    `SELECT id, titulo, slug, estado, marca_id,
            descripcion_corta, descripcion_larga,
            meta_titulo, meta_descripcion
     FROM productos
     WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  if (!producto) return null;

  const [variantes]  = await pool.execute<VarianteRow[]>(
    `SELECT id, sku, codigo_barras, precio_original, precio_final,
            costo, stock, es_default, vender_sin_existencia
     FROM producto_variantes
     WHERE producto_id = ?
     ORDER BY es_default DESC, id ASC`,
    [id],
  );

  const [imagenes]   = await pool.execute<ImagenRow[]>(
    `SELECT url, alt, orden
     FROM producto_imagenes
     WHERE producto_id = ? AND variante_id IS NULL
     ORDER BY orden ASC`,
    [id],
  );

  const [metacampos] = await pool.execute<MetacampoRow[]>(
    `SELECT llave, valor
     FROM producto_metacampos
     WHERE producto_id = ? AND variante_id IS NULL
     ORDER BY id ASC`,
    [id],
  );

  const [categorias] = await pool.execute<CategoriaRow[]>(
    `SELECT c.id
     FROM categorias c
     INNER JOIN producto_categorias pc ON pc.categoria_id = c.id
     WHERE pc.producto_id = ?`,
    [id],
  );

  return {
    id:                producto.id,
    titulo:            producto.titulo,
    slug:              producto.slug,
    estado:            producto.estado,
    marca_id:          producto.marca_id ? String(producto.marca_id) : "",
    descripcion_corta: producto.descripcion_corta  ?? "",
    descripcion_larga: producto.descripcion_larga  ?? "",
    meta_titulo:       producto.meta_titulo         ?? "",
    meta_descripcion:  producto.meta_descripcion    ?? "",
    categorias:        (categorias as CategoriaRow[]).map((c) => c.id),
    variantes: (variantes as VarianteRow[]).map(
      (v): VarianteForm => ({
        id:                    v.id,
        sku:                   v.sku,
        codigo_barras:         v.codigo_barras         ?? "",
        precio_original:       String(v.precio_original),
        precio_final:          String(v.precio_final),
        costo:                 String(v.costo),
        stock:                 String(v.stock),
        es_default:            Boolean(v.es_default),
        vender_sin_existencia: Boolean(v.vender_sin_existencia),
      }),
    ),
    imagenes: (imagenes as ImagenRow[]).map(
      (img): ImagenForm => ({
        url:   img.url,
        alt:   img.alt ?? "",
        orden: img.orden,
      }),
    ),
    metacampos: (metacampos as MetacampoRow[]).map(
      (m): MetacampoForm => ({
        llave: m.llave,
        valor: m.valor,
      }),
    ),
  };
}

/* ── Fetch de catálogos (categorías + marcas) ──────────────── */
async function fetchCatalogData() {
  const [categorias, marcas] = await Promise.all([
    pool.execute<CategoriaRow[]>(
      "SELECT id, nombre, slug FROM categorias ORDER BY nombre ASC",
    ),
    pool.execute<MarcaRow[]>(
      "SELECT id, nombre FROM marcas ORDER BY nombre ASC",
    ),
  ]);
  return {
    categorias: categorias[0] as { id: number; nombre: string; slug: string }[],
    marcas:     marcas[0]     as { id: number; nombre: string }[],
  };
}

/* ── Props de la página ────────────────────────────────────── */
interface PageProps {
  params: Promise<{ id: string }>;
}

/* ── Metadata dinámica ─────────────────────────────────────── */
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const productoId = Number(id);
  if (!productoId) return { title: "Editar producto" };

  const [[producto]] = await pool.execute<ProductoRow[]>(
    "SELECT titulo FROM productos WHERE id = ? AND deleted_at IS NULL",
    [productoId],
  );

  return {
    title: producto ? `Editar: ${producto.titulo}` : "Editar producto",
  };
}

/* ── Página ────────────────────────────────────────────────── */
export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params;
  const productoId = Number(id);

  if (!productoId || isNaN(productoId)) notFound();

  const [producto, { categorias, marcas }] = await Promise.all([
    fetchProducto(productoId),
    fetchCatalogData(),
  ]);

  if (!producto) notFound();

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <ProductoForm
        mode="editar"
        initialData={producto}
        categorias={categorias}
        marcas={marcas}
      />
    </div>
  );
}