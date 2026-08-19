// features/admin/pedidos/types.ts
// Tipos y catálogos compartidos del módulo de pedidos admin
import type { PedidoEstado } from "@/features/orders/types/order";

/** Fila de la tabla de pedidos (proyección ligera del listado). */
export interface PedidoRow {
  id:              number;
  numero:          string;
  estado:          PedidoEstado;
  cliente:         string;
  email:           string;
  telefono:        string | null;
  total:           number;
  moneda:          string;
  metodo_pago:     string | null;
  paqueteria:      string | null;
  numero_guia:     string | null;
  envio_ciudad:    string;
  envio_estado:    string;
  total_items:     number;
  usuario_id:      number | null;
  pagado_en:       string | null;
  created_at:      string;
}

/** Ítem del pedido tal como lo devuelve el detalle. */
export interface PedidoItemRow {
  id:              number;
  variante_id:     number | null;
  titulo:          string;
  sku:             string;
  imagen_url:      string | null;
  precio_unitario: number;
  cantidad:        number;
  descuento_linea: number;
  total_linea:     number;
  producto_slug:   string | null;
}

/** Entrada del historial de estados. */
export interface PedidoHistorialRow {
  id:              number;
  estado_anterior: string | null;
  estado_nuevo:    string;
  comentario:      string | null;
  notificar:       number | boolean;
  created_at:      string;
}

/** Detalle completo del pedido para el modal. */
export interface PedidoDetalle {
  id:                number;
  numero:            string;
  estado:            PedidoEstado;
  usuario_id:        number | null;
  envio_nombre:      string;
  envio_empresa:     string | null;
  envio_telefono:    string | null;
  envio_calle:       string;
  envio_numero_ext:  string;
  envio_numero_int:  string | null;
  envio_colonia:     string;
  envio_ciudad:      string;
  envio_municipio:   string | null;
  envio_estado:      string;
  envio_cp:          string;
  envio_pais:        string;
  envio_referencias: string | null;
  email:             string;
  telefono:          string | null;
  subtotal:          number;
  descuento:         number;
  costo_envio:       number;
  impuestos:         number;
  total:             number;
  moneda:            string;
  cupon_codigo:      string | null;
  cupon_descuento:   number | null;
  metodo_pago:       string | null;
  referencia_pago:   string | null;
  pagado_en:         string | null;
  paqueteria:        string | null;
  numero_guia:       string | null;
  url_rastreo:       string | null;
  enviado_en:        string | null;
  entregado_en:      string | null;
  notas_cliente:     string | null;
  notas_internas:    string | null;
  fuente:            string;
  created_at:        string;
  updated_at:        string;
  items:             PedidoItemRow[];
  historial:         PedidoHistorialRow[];
}

/** Métricas del encabezado. */
export interface PedidosStats {
  total:          number;
  pendientes:     number;
  en_curso:       number;
  entregados:     number;
  ingresos_mes:   number;
}

/* ── Catálogo de estados ─────────────────────────────────────── */

export interface EstadoMeta {
  label: string;
  color: string;
  bg:    string;
}

/** Mismos colores que la vista de cliente (features/account PedidosSection). */
export const ESTADOS: Record<PedidoEstado, EstadoMeta> = {
  pendiente_pago: { label: "Pendiente de pago", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  pago_recibido:  { label: "Pago recibido",     color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  en_proceso:     { label: "En proceso",        color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  listo_envio:    { label: "Listo para envío",  color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  enviado:        { label: "Enviado",           color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  entregado:      { label: "Entregado",         color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
  cancelado:      { label: "Cancelado",         color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
  reembolsado:    { label: "Reembolsado",       color: "#64748b", bg: "rgba(100,116,139,0.1)" },
  disputa:        { label: "En disputa",        color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};

export const ESTADO_ORDEN: PedidoEstado[] = [
  "pendiente_pago", "pago_recibido", "en_proceso", "listo_envio",
  "enviado", "entregado", "cancelado", "reembolsado", "disputa",
];

export function estadoMeta(estado: string): EstadoMeta {
  return ESTADOS[estado as PedidoEstado] ?? { label: estado, color: "#64748b", bg: "rgba(100,116,139,0.1)" };
}

export const METODOS_PAGO: Record<string, string> = {
  tarjeta:        "Tarjeta",
  transferencia:  "Transferencia (SPEI)",
  oxxo:           "OXXO",
};

export function metodoPagoLabel(metodo: string | null): string {
  if (!metodo) return "—";
  return METODOS_PAGO[metodo] ?? metodo;
}

/** Paqueterías soportadas para la captura de guía. */
export const PAQUETERIAS = [
  "DHL", "FedEx", "Estafeta", "UPS", "Redpack", "Paquetexpress", "99 Minutos", "Correos de México",
];
