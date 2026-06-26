// app/global/types/order.ts
// ─────────────────────────────────────────────────────────────
// Tipos de pedidos, pagos, reembolsos y envío
// ─────────────────────────────────────────────────────────────

export type PedidoEstado =
  | "pendiente_pago"
  | "pago_recibido"
  | "en_proceso"
  | "listo_envio"
  | "enviado"
  | "entregado"
  | "cancelado"
  | "reembolsado"
  | "disputa";

export type MetodoPago = "tarjeta" | "transferencia" | "oxxo";

export type PagoEstado =
  | "iniciado"
  | "procesando"
  | "completado"
  | "fallido"
  | "cancelado"
  | "reembolsado"
  | "disputado";

// ─── Atributo snapshot en ítems ──────────────────────────────

export interface AtributoSnapshot {
  atributo: string;
  valor:    string;
}

// ─── Ítem de pedido ──────────────────────────────────────────

export interface PedidoItem {
  id:                   number;
  pedido_id:            number;
  variante_id:          number | null;
  titulo:               string;
  sku:                  string;
  imagen_url:           string | null;
  atributos_json:       AtributoSnapshot[] | null;
  precio_unitario:      number;
  precio_original:      number;
  cantidad:             number;
  descuento_linea:      number;
  total_linea:          number;
  cantidad_reembolsada: number;
}

// ─── Historial de estado ─────────────────────────────────────

export interface PedidoHistorial {
  id:               number;
  pedido_id:        number;
  estado_anterior:  string | null;
  estado_nuevo:     string;
  comentario:       string | null;
  notificar:        boolean;
  created_at:       string;
}

// ─── Pago ────────────────────────────────────────────────────

export interface Pago {
  id:                 number;
  pedido_id:          number;
  gateway:            string;
  gateway_pago_id:    string | null;
  tipo:               "cargo" | "pre_autorizacion" | "captura" | "reembolso" | "contracargo";
  estado:             PagoEstado;
  monto:              number;
  moneda:             string;
  metodo:             string | null;
  ultimos_4:          string | null;
  created_at:         string;
}

// ─── Pedido completo ─────────────────────────────────────────

export interface Pedido {
  id:               number;
  numero:           string;
  usuario_id:       number | null;
  estado:           PedidoEstado;
  // Dirección de envío (snapshot)
  envio_nombre:     string;
  envio_empresa:    string | null;
  envio_telefono:   string | null;
  envio_calle:      string;
  envio_numero_ext: string;
  envio_numero_int: string | null;
  envio_colonia:    string;
  envio_ciudad:     string;
  envio_municipio:  string | null;
  envio_estado:     string;
  envio_cp:         string;
  envio_pais:       string;
  envio_referencias:string | null;
  // Contacto
  email:            string;
  telefono:         string | null;
  // Montos
  subtotal:         number;
  descuento:        number;
  costo_envio:      number;
  impuestos:        number;
  total:            number;
  moneda:           string;
  // Cupón
  cupon_codigo:     string | null;
  cupon_descuento:  number | null;
  // Pago
  metodo_pago:      string | null;
  referencia_pago:  string | null;
  pagado_en:        string | null;
  // Envío
  paqueteria:       string | null;
  numero_guia:      string | null;
  url_rastreo:      string | null;
  enviado_en:       string | null;
  entregado_en:     string | null;
  // Metadatos
  notas_cliente:    string | null;
  fuente:           string;
  created_at:       string;
  updated_at:       string;
  // Relaciones cargadas on-demand
  items?:           PedidoItem[];
  historial?:       PedidoHistorial[];
  pagos?:           Pago[];
}

// ─── Payload para crear pedido ───────────────────────────────

export interface CrearPedidoPayload {
  usuario_id?:  number;
  email:        string;
  telefono?:    string;
  direccion_envio: {
    nombre:       string;
    apellido:     string;
    empresa?:     string;
    telefono?:    string;
    calle:        string;
    numero_ext:   string;
    numero_int?:  string;
    colonia:      string;
    ciudad:       string;
    municipio?:   string;
    estado:       string;
    codigo_postal:string;
    pais:         string;
    referencias?: string;
  };
  items: {
    variante_id:     number;
    cantidad:        number;
    precio_unitario: number;
    precio_original: number;
  }[];
  metodo_pago:    MetodoPago;
  cupon_codigo?:  string;
  costo_envio:    number;
  notas_cliente?: string;
  carrito_id?:    number;
  ip_origen?:     string;
}