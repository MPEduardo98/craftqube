// app/admin/productos/[id]/editar/page.tsx
import { notFound }     from "next/navigation";
import { pool }         from "@/shared/lib/db/pool";
import type { RowDataPacket } from "mysql2";
import { ProductoForm } from "@/features/admin/productos/components/ProductoForm";
import { getStorePricing } from "@/shared/lib/currency/store-currency";
import type {
  ProductoFormData,
  VarianteForm,
  ImagenForm,
  MetacampoForm,
} from "@/features/admin/productos/components/ProductoForm";

interface ProductoRow extends RowDataPacket {
  id:               number;
  titulo:           string;
  slug:             string;
  estado:           "activo" | "inactivo" | "borrador";
  marca_id:         number | null;
  descripcion:      string | null;
  meta_titulo:      string | null;
  meta_descripcion: string | null;
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

interface EnvioRow extends RowDataPacket {
  es_fisico:     number;
  largo:         number | null;
  ancho:         number | null;
  alto:          number | null;
  peso:          number | null;
  medida_unidad: string | null;
  peso_unidad:   string | null;
}

interface AtributoRow         extends RowDataPacket { variante_id: number; atributo: string; valor: string; }
interface VarMetacampoRow     extends RowDataPacket { variante_id: number; llave: string; valor: string; }
interface VarImagenRow        extends RowDataPacket { variante_id: number; url: string; }
interface ImagenRow   extends RowDataPacket { url: string; alt: string | null; orden: number; }
interface MetacampoRow extends RowDataPacket { llave: string; valor: string; }
interface CategoriaRow extends RowDataPacket { id: number; nombre: string; slug: string; }
interface MarcaRow     extends RowDataPacket { id: number; nombre: string; }

async function fetchProducto(id: number): Promise<ProductoFormData | null> {
  const [[producto]] = await pool.execute<ProductoRow[]>(
    `SELECT id, titulo, slug, estado, marca_id, descripcion, meta_titulo, meta_descripcion
     FROM productos
     WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  if (!producto) return null;

  const [variantes]  = await pool.execute<VarianteRow[]>(
    `SELECT v.id, v.sku, v.codigo_barras, v.precio_original, v.precio_final,
            v.costo, v.stock, v.es_default, v.vender_sin_existencia
     FROM producto_variantes v
     WHERE v.producto_id = ? ORDER BY v.es_default DESC, v.id ASC`,
    [id],
  );
  const [[envioRow]] = await pool.execute<EnvioRow[]>(
    `SELECT es_fisico, largo, ancho, alto, peso, medida_unidad, peso_unidad
     FROM producto_envio WHERE producto_id = ?`,
    [id],
  );
  const [varAtributos] = await pool.execute<AtributoRow[]>(
    `SELECT vv.variante_id, a.nombre AS atributo, av.valor
     FROM variante_valores vv
     INNER JOIN atributos_valores av ON av.id = vv.atributo_valor_id
     INNER JOIN atributos a          ON a.id  = av.atributo_id
     WHERE vv.variante_id IN (SELECT id FROM producto_variantes WHERE producto_id = ?)
     ORDER BY a.id ASC, av.id ASC`,
    [id],
  );
  const [varMetacampos] = await pool.execute<VarMetacampoRow[]>(
    `SELECT variante_id, llave, valor FROM producto_metacampos
     WHERE producto_id = ? AND variante_id IS NOT NULL ORDER BY id ASC`,
    [id],
  );
  const [varImagenes] = await pool.execute<VarImagenRow[]>(
    `SELECT variante_id, url FROM producto_imagenes
     WHERE producto_id = ? AND variante_id IS NOT NULL ORDER BY orden ASC, id ASC`,
    [id],
  );
  const [imagenes]   = await pool.execute<ImagenRow[]>(
    `SELECT url, alt, orden FROM producto_imagenes
     WHERE producto_id = ? AND variante_id IS NULL ORDER BY orden ASC`,
    [id],
  );
  const [metacampos] = await pool.execute<MetacampoRow[]>(
    `SELECT llave, valor FROM producto_metacampos
     WHERE producto_id = ? AND variante_id IS NULL ORDER BY id ASC`,
    [id],
  );
  const [categorias] = await pool.execute<CategoriaRow[]>(
    `SELECT c.id FROM categorias c
     INNER JOIN producto_categorias pc ON pc.categoria_id = c.id
     WHERE pc.producto_id = ?`,
    [id],
  );

  return {
    id:               producto.id,
    titulo:           producto.titulo,
    slug:             producto.slug,
    estado:           producto.estado,
    marca_id:         producto.marca_id ? String(producto.marca_id) : "",
    descripcion:      producto.descripcion      ?? "",
    meta_titulo:      producto.meta_titulo       ?? "",
    meta_descripcion: producto.meta_descripcion  ?? "",
    categorias:       (categorias as CategoriaRow[]).map((c) => c.id),
    variantes: (variantes as VarianteRow[]).map((v): VarianteForm => {
      const atributos = (varAtributos as AtributoRow[])
        .filter((a) => a.variante_id === v.id)
        .map((a) => ({ nombre: a.atributo, valor: a.valor }));
      const metacampos = (varMetacampos as VarMetacampoRow[])
        .filter((m) => m.variante_id === v.id)
        .map((m) => ({ llave: m.llave, valor: m.valor }));
      return {
        id:                    v.id,
        // Etiqueta legible derivada de los atributos (no se persiste)
        nombre:                atributos.map((a) => a.valor).join(" / "),
        sku:                   v.sku,
        codigo_barras:         v.codigo_barras         ?? "",
        precio_original:       String(v.precio_original),
        precio_final:          String(v.precio_final),
        costo:                 String(v.costo),
        stock:                 String(v.stock),
        es_default:            Boolean(v.es_default),
        vender_sin_existencia: Boolean(v.vender_sin_existencia),
        imagen:                (varImagenes as VarImagenRow[]).find((im) => im.variante_id === v.id)?.url ?? "",
        atributos,
        metacampos,
      };
    }),
    imagenes:   (imagenes as ImagenRow[]).map((img): ImagenForm => ({ url: img.url, alt: img.alt ?? "", orden: img.orden })),
    metacampos: (metacampos as MetacampoRow[]).map((m): MetacampoForm => ({ llave: m.llave, valor: m.valor })),
    envio: {
      es_fisico:     envioRow ? Boolean(envioRow.es_fisico) : true,
      largo:         envioRow?.largo != null ? String(envioRow.largo) : "",
      ancho:         envioRow?.ancho != null ? String(envioRow.ancho) : "",
      alto:          envioRow?.alto  != null ? String(envioRow.alto)  : "",
      peso:          envioRow?.peso  != null ? String(envioRow.peso)  : "",
      medida_unidad: envioRow?.medida_unidad ?? "cm",
      peso_unidad:   envioRow?.peso_unidad   ?? "kg",
    },
  };
}

async function fetchCatalogData() {
  const [categorias, marcas] = await Promise.all([
    pool.execute<CategoriaRow[]>("SELECT id, nombre, slug FROM categorias ORDER BY nombre ASC"),
    pool.execute<MarcaRow[]>("SELECT id, nombre FROM marcas ORDER BY nombre ASC"),
  ]);
  return {
    categorias: categorias[0] as { id: number; nombre: string; slug: string }[],
    marcas:     marcas[0]     as { id: number; nombre: string }[],
  };
}

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const productoId = Number(id);
  if (!productoId) return { title: "Editar producto" };
  const [[producto]] = await pool.execute<ProductoRow[]>(
    "SELECT titulo FROM productos WHERE id = ? AND deleted_at IS NULL",
    [productoId],
  );
  return { title: producto ? `Editar: ${producto.titulo}` : "Editar producto" };
}

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params;
  const productoId = Number(id);
  if (!productoId || isNaN(productoId)) notFound();

  const [producto, { categorias, marcas }, pricing] = await Promise.all([
    fetchProducto(productoId),
    fetchCatalogData(),
    getStorePricing(),
  ]);

  if (!producto) notFound();

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <ProductoForm mode="editar" initialData={producto} categorias={categorias} marcas={marcas} pricing={pricing} />
    </div>
  );
}