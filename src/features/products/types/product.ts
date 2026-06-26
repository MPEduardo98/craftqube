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
  /** Solo el nombre de archivo, ej: "abc123.png". La ruta se construye como /uploads/productos/[id]/[imagen_nombre] */
  imagen_nombre: string | null;
  imagen_alt: string | null;
}