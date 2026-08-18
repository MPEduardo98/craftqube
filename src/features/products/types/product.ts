// app/global/types/product.ts

export interface Producto {
  id: number;
  titulo: string;
  descripcion: string | null;
  slug: string;
  categoria: string | null;
  categoria_slug: string | null;
  marca: string | null;
  sku: string | null;
  precio: number | null;
  precio_original: number | null;
  stock: number | null;
  /** URL completa del CDN, ej: "https://cdn.craftqube.mx/productos/12/abc.png". Resolver siempre con resolveImageUrl(). */
  imagen_nombre: string | null;
  imagen_alt: string | null;
}