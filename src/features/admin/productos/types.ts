// app/admin/productos/types.ts
// Tipos compartidos del módulo de productos admin

export interface ProductoRow {
  id:         number;
  titulo:     string;
  slug:       string;
  estado:     string;
  precio:     number | null;
  stock:      number;
  imagen_url: string | null;
  categorias:    string | null;
  categoria_id:  number | null;
  marca:      string | null;
}