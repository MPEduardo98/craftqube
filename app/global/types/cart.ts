// app/global/types/cart.ts

export interface CartItem {
  /** Producto ID */
  productoId:    number;
  /** Variante ID */
  varianteId:    number;
  titulo:        string;
  slug:          string;
  sku:           string;
  precio:        number;
  cantidad:      number;
  /** Nombre de archivo de imagen */
  imagenNombre:  string | null;
  imagenAlt:     string | null;
  /** Atributos de variante para mostrar (ej: Color: Rojo) */
  atributos:     { atributo: string; valor: string }[];
}

export interface CartState {
  items:    CartItem[];
  isOpen:   boolean;
}