// app/global/types/address.ts
// ─────────────────────────────────────────────────────────────
// Tipos de direcciones de envío y facturación
// ─────────────────────────────────────────────────────────────

export type DireccionTipo = "envio" | "facturacion" | "ambos";

export interface Direccion {
  id:                 number;
  usuario_id:         number | null;
  alias:              string | null;
  nombre:             string;
  apellido:           string;
  empresa:            string | null;
  telefono:           string | null;
  calle:              string;
  numero_ext:         string;
  numero_int:         string | null;
  colonia:            string;
  ciudad:             string;
  municipio:          string | null;
  estado:             string;
  codigo_postal:      string;
  pais:               string;
  referencias:        string | null;
  es_predeterminada:  boolean;
  tipo:               DireccionTipo;
  latitud:            number | null;
  longitud:           number | null;
  created_at:         string;
  updated_at:         string;
}

export type DireccionInput = Omit<
  Direccion,
  "id" | "usuario_id" | "latitud" | "longitud" | "created_at" | "updated_at"
>;

/** Versión simplificada para el formulario de checkout */
export interface DireccionEnvioForm {
  nombre:        string;
  apellido:      string;
  empresa?:      string;
  telefono?:     string;
  calle:         string;
  numero_ext:    string;
  numero_int?:   string;
  colonia:       string;
  ciudad:        string;
  municipio?:    string;
  estado:        string;
  codigo_postal: string;
  pais:          string;
  referencias?:  string;
  guardar?:      boolean; // guardar en cuenta del usuario
}