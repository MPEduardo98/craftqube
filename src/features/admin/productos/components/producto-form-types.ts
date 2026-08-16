// app/admin/productos/components/producto-form-types.ts

/* ── Tipos exportados ──────────────────────────────────────── */
export interface AtributoVarianteForm {
  nombre: string;   // p. ej. "Color"
  valor:  string;   // p. ej. "Negro"
}

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
  // Imagen representativa de la variante (URL; "" = sin imagen propia)
  imagen:                string;
  // Atributos que distinguen la variante (variante_valores → selector en tienda)
  atributos:             AtributoVarianteForm[];
  // Especificaciones propias de la variante (producto_metacampos con variante_id)
  metacampos:            MetacampoForm[];
}

/** Envío a nivel producto (mismas dimensiones para todas las variantes) */
export interface EnvioForm {
  es_fisico:     boolean;
  largo:         string;
  ancho:         string;
  alto:          string;
  peso:          string;
  medida_unidad: string;
  peso_unidad:   string;
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
  envio:            EnvioForm;
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
    imagen:                "",
    atributos:             [],
    metacampos:            [],
  };
}

export function emptyEnvio(): EnvioForm {
  return {
    es_fisico:     true,
    largo:         "",
    ancho:         "",
    alto:          "",
    peso:          "",
    medida_unidad: "cm",
    peso_unidad:   "kg",
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