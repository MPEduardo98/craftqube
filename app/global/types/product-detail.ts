// app/global/types/product-detail.ts

export interface VarianteAtributo {
  atributo_id: number;
  atributo:    string;
  valor_id:    number;
  valor:       string;
}

export interface Metacampo {
  id:          number;
  variante_id: number | null;
  llave:       string;
  valor:       string;
}

export interface ProductoImagen {
  id:          number;
  url:         string;
  alt:         string | null;
  orden:       number;
  variante_id: number | null;
}

export interface ProductoVariante {
  id:                    number;
  sku:                   string;
  codigo_barras:         string | null;
  precio_original:       number;
  precio_final:          number;
  stock:                 number;
  es_default:            number;
  vender_sin_existencia: number;
  largo:                 number | null;
  ancho:                 number | null;
  alto:                  number | null;
  peso:                  number | null;
  medida_unidad:         string | null;
  peso_unidad:           string | null;
  atributos:             VarianteAtributo[];
  metacampos:            Metacampo[];
}

export interface ProductoCategoria {
  id:     number;
  nombre: string;
  slug:   string;
}

export interface ProductoEtiqueta {
  id:     number;
  nombre: string;
  slug:   string;
  tipo:   string;
}

export interface ProductoDetalle {
  id:                number;
  titulo:            string;
  descripcion_corta: string | null;
  descripcion_larga: string | null;
  slug:              string;
  estado:            string;
  meta_titulo:       string | null;
  meta_descripcion:  string | null;
  created_at:        string;
  updated_at:        string;
  marca_id:          number | null;
  marca:             string | null;
  marca_slug:        string | null;
  marca_logo:        string | null;
  categorias:        ProductoCategoria[];
  imagenes:          ProductoImagen[];
  variantes:         ProductoVariante[];
  metacampos:        Metacampo[];
  etiquetas:         ProductoEtiqueta[];
}