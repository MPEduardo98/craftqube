// features/admin/categorias/types.ts
// Tipos compartidos del módulo de categorías admin

export interface CategoriaRow {
  id:               number;
  nombre:           string;
  slug:             string;
  descripcion:      string | null;
  imagen:           string | null;
  parent_id:        number | null;
  parent_nombre:    string | null;
  total_productos:  number;
}
