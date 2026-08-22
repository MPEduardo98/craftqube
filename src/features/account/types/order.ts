// features/account/types/order.ts
// ─────────────────────────────────────────────────────────────
// Proyección del pedido tal como la ve el CLIENTE. Es un
// subconjunto del detalle de admin: sin notas internas ni
// comentarios de historial.
// ─────────────────────────────────────────────────────────────
import type { PedidoEstado } from "@/features/orders/types/order";

export interface PedidoItemCliente {
  id:              number;
  variante_id:     number | null;
  titulo:          string;
  sku:             string;
  imagen_url:      string | null;
  precio_unitario: number;
  precio_original: number;
  cantidad:        number;
  descuento_linea: number;
  total_linea:     number;
  producto_id:     number | null;
  producto_slug:   string | null;
}

export interface PedidoHistorialCliente {
  id:              number;
  estado_anterior: string | null;
  estado_nuevo:    string;
  created_at:      string;
}

export interface PedidoDetalleCliente {
  id:                number;
  numero:            string;
  estado:            PedidoEstado;
  // Envío (snapshot)
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
  // Contacto
  email:             string;
  telefono:          string | null;
  // Montos
  subtotal:          number;
  descuento:         number;
  costo_envio:       number;
  impuestos:         number;
  total:             number;
  moneda:            string;
  cupon_codigo:      string | null;
  cupon_descuento:   number | null;
  // Pago
  metodo_pago:       string | null;
  referencia_pago:   string | null;
  pagado_en:         string | null;
  // Envío / rastreo
  paqueteria:        string | null;
  numero_guia:       string | null;
  url_rastreo:       string | null;
  enviado_en:        string | null;
  entregado_en:      string | null;
  // Metadatos
  notas_cliente:     string | null;
  created_at:        string;
  updated_at:        string;
  // Relaciones
  items:             PedidoItemCliente[];
  historial:         PedidoHistorialCliente[];
}
