// app/admin/productos/components/producto-form-types.ts

/* ── Tipos exportados ──────────────────────────────────────── */
export interface VarianteForm {
  id?:                   number;
  nombre:                string;
  sku:                   string;
  codigo_barras:         string;
  precio_original:       string;
  precio_final:          string;
  costo:                 string;
  stock:                 string;
  es_default:            boolean;
  vender_sin_existencia: boolean;
  // Dimensiones (producto_dimensiones)
  largo:                 string;
  ancho:                 string;
  alto:                  string;
  peso:                  string;
  medida_unidad:         string;
  peso_unidad:           string;
  es_fisico:             boolean;
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
  id?:              number;
  titulo:           string;
  slug:             string;
  estado:           "activo" | "inactivo" | "borrador";
  marca_id:         string;
  descripcion:      string;
  meta_titulo:      string;
  meta_descripcion: string;
  categorias:       number[];
  variantes:        VarianteForm[];
  imagenes:         ImagenForm[];
  metacampos:       MetacampoForm[];
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

export function emptyVariante(): VarianteForm {
  return {
    nombre:                "",
    sku:                   "",
    codigo_barras:         "",
    precio_original:       "",
    precio_final:          "",
    costo:                 "",
    stock:                 "",
    es_default:            false,
    vender_sin_existencia: false,
    largo:                 "",
    ancho:                 "",
    alto:                  "",
    peso:                  "",
    medida_unidad:         "cm",
    peso_unidad:           "kg",
    es_fisico:             true,
  };
}

/* ── CSS classes ───────────────────────────────────────────── */
export const inputCls =
  "w-full rounded-lg px-3 py-2 text-sm transition-colors " +
  "bg-white border border-slate-200 " +
  "text-slate-800 placeholder:text-slate-300 " +
  "focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

export const inputSmallCls =
  "w-full rounded-md px-2.5 py-1.5 text-xs transition-colors " +
  "bg-white border border-slate-200 " +
  "text-slate-800 placeholder:text-slate-300 " +
  "focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

export const textareaCls =
  "w-full rounded-lg px-3 py-2 text-sm transition-colors resize-none " +
  "bg-white border border-slate-200 " +
  "text-slate-800 placeholder:text-slate-300 " +
  "focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";