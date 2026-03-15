// app/admin/productos/components/producto-form-types.ts
// ─────────────────────────────────────────────────────────────
// Tipos, helpers y constantes CSS compartidas del formulario.
// ─────────────────────────────────────────────────────────────

/* ── Tipos exportados ──────────────────────────────────────── */
export interface VarianteForm {
  id?:                   number;
  sku:                   string;
  codigo_barras:         string;
  precio_original:       string;
  precio_final:          string;
  costo:                 string;
  stock:                 string;
  es_default:            boolean;
  vender_sin_existencia: boolean;
}

export interface ImagenForm {
  url:   string;
  alt:   string;
  orden: number;
}

export interface MetacampoForm {
  llave: string;
  valor: string;
}

export interface ProductoFormData {
  id?:               number;
  titulo:            string;
  slug:              string;
  estado:            "activo" | "inactivo" | "borrador";
  marca_id:          string;
  descripcion_corta: string;
  descripcion_larga: string; // mantenido en tipo para compatibilidad con API, no se renderiza
  meta_titulo:       string;
  meta_descripcion:  string;
  categorias:        number[];
  variantes:         VarianteForm[];
  imagenes:          ImagenForm[];
  metacampos:        MetacampoForm[];
}

export interface Categoria { id: number; nombre: string; slug: string; }
export interface Marca     { id: number; nombre: string; }

/* ── Helpers ───────────────────────────────────────────────── */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function buildImageSrc(url: string, productoId?: number): string {
  if (!url) return "";

  // Normalizar separadores Windows → Unix
  const normalized = url.replace(/\\/g, "/");

  // URLs absolutas o ya relativas a la raíz
  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("/")
  ) {
    return normalized;
  }

  // Rutas que vienen con "public/" al inicio → quitar el prefijo
  if (normalized.startsWith("public/")) {
    return "/" + normalized.slice("public/".length);
  }

  // Patrón del proyecto: solo nombre de archivo → /productos/{id}/{nombre}
  if (productoId && !normalized.includes("/")) {
    return `/productos/${productoId}/${normalized}`;
  }

  // Ruta relativa con carpetas ya incluidas
  return `/${normalized}`;
}

export const emptyVariante = (): VarianteForm => ({
  sku: "", codigo_barras: "", precio_original: "0",
  precio_final: "0", costo: "0", stock: "0",
  es_default: false, vender_sin_existencia: false,
});

/* ── Constantes CSS ────────────────────────────────────────── */
export const inputCls =
  "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300";

export const textareaCls = `${inputCls} resize-none`;

export const inputSmallCls =
  "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300 tabular-nums";