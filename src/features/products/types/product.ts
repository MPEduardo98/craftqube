// app/global/types/product.ts

export interface Producto {
  id: number;
  titulo: string;
  descripcion: string | null;
  slug: string;
  categoria: string | null;
  categoria_slug: string | null;
  marca: string | null;
  /**
   * Id de la VARIANTE por defecto — lo que hay que meter en el carrito.
   * No confundir con `id`, que es el del producto: el checkout cotiza
   * contra `producto_variantes`, así que mandarle un producto_id hace
   * que el pedido falle con "ya no está disponible".
   * null si el producto no tiene ninguna variante marcada por defecto.
   */
  variante_id: number | null;
  sku: string | null;
  precio: number | null;
  precio_original: number | null;
  stock: number | null;
  /** URL completa del CDN, ej: "https://cdn.craftqube.mx/productos/12/abc.png". Resolver siempre con resolveImageUrl(). */
  imagen_nombre: string | null;
  imagen_alt: string | null;
}