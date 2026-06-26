// app/global/types/commerce.ts
// ─────────────────────────────────────────────────────────────
// Cupones, carrito persistente, zonas de envío, reseñas
// ─────────────────────────────────────────────────────────────

// ─── CUPONES ─────────────────────────────────────────────────

export type CuponTipo = "porcentaje" | "monto_fijo" | "envio_gratis" | "2x1";
export type CuponAplica = "todos" | "categoria" | "producto" | "primera_compra";

export interface Cupon {
  id:                   number;
  codigo:               string;
  descripcion:          string | null;
  tipo:                 CuponTipo;
  valor:                number;
  minimo_compra:        number | null;
  maximo_descuento:     number | null;
  uso_maximo_total:     number | null;
  uso_maximo_usuario:   number;
  usos_actuales:        number;
  aplica_a:             CuponAplica;
  aplica_ids:           number[] | null;
  activo:               boolean;
  valido_desde:         string | null;
  valido_hasta:         string | null;
}

export interface CuponValidacion {
  valido:      boolean;
  cupon?:      Cupon;
  descuento?:  number;
  mensaje?:    string;
}

// ─── CARRITO PERSISTENTE ─────────────────────────────────────

export type CarritoEstado = "activo" | "abandonado" | "convertido" | "expirado";

export interface CarritoServidor {
  id:           number;
  usuario_id:   number | null;
  sesion_token: string | null;
  estado:       CarritoEstado;
  coupon_id:    number | null;
  expires_at:   string;
  created_at:   string;
}

export interface CarritoItemServidor {
  id:               number;
  carrito_id:       number;
  variante_id:      number;
  cantidad:         number;
  precio_unitario:  number;
  notas:            string | null;
  // Joined from producto_variantes + productos
  titulo?:          string;
  sku?:             string;
  imagen_url?:      string;
}

// ─── ZONAS Y TARIFAS DE ENVÍO ────────────────────────────────

export interface ZonaEnvio {
  id:          number;
  nombre:      string;
  descripcion: string | null;
  activa:      boolean;
}

export type TarifaTipo = "monto_fijo" | "por_peso" | "por_monto_compra" | "gratis";

export interface TarifaEnvio {
  id:                   number;
  zona_id:              number;
  nombre:               string;
  paqueteria:           string | null;
  tipo_calculo:         TarifaTipo;
  precio_base:          number;
  precio_por_kg:        number | null;
  peso_maximo_kg:       number | null;
  monto_envio_gratis:   number | null;
  dias_estimados_min:   number | null;
  dias_estimados_max:   number | null;
  activa:               boolean;
}

export interface OpcionEnvio extends TarifaEnvio {
  precio_calculado: number;
  envio_gratis:     boolean;
}

// ─── RESEÑAS ─────────────────────────────────────────────────

export type ReseñaEstado = "pendiente" | "aprobada" | "rechazada";

export interface Reseña {
  id:                 number;
  producto_id:        number;
  usuario_id:         number | null;
  nombre:             string;
  calificacion:       number;
  titulo:             string | null;
  cuerpo:             string | null;
  estado:             ReseñaEstado;
  util_si:            number;
  util_no:            number;
  respuesta_tienda:   string | null;
  created_at:         string;
}

// ─── COTIZACIONES ────────────────────────────────────────────

export type CotizacionEstado =
  | "nueva"
  | "en_revision"
  | "enviada"
  | "aceptada"
  | "rechazada"
  | "expirada";

export interface CotizacionItem {
  variante_id:      number;
  titulo:           string;
  sku:              string;
  cantidad:         number;
  precio_referencia?: number;
}

export interface Cotizacion {
  id:               number;
  numero:           string;
  usuario_id:       number | null;
  nombre:           string;
  empresa:          string | null;
  email:            string;
  telefono:         string | null;
  mensaje:          string | null;
  estado:           CotizacionEstado;
  items_json:       CotizacionItem[];
  respuesta:        string | null;
  total_estimado:   number | null;
  valida_hasta:     string | null;
  created_at:       string;
}

// ─── MÉTODOS DE PAGO TOKENIZADOS ─────────────────────────────

export interface MetodoPagoGuardado {
  id:                 number;
  usuario_id:         number;
  gateway:            string;
  token_externo:      string;
  tipo:               string;
  marca:              string | null;
  ultimos_4:          string | null;
  expiracion:         string | null;
  titular:            string | null;
  es_predeterminado:  boolean;
  activo:             boolean;
}

// ─── NOTIFICACIONES ──────────────────────────────────────────

export interface Notificacion {
  id:         number;
  usuario_id: number;
  tipo:       string;
  titulo:     string;
  mensaje:    string;
  url:        string | null;
  leida:      boolean;
  created_at: string;
}