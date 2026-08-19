// app/api/stripe/webhook/route.ts
// ─────────────────────────────────────────────────────────────
// Punto de verdad del estado de pago. Stripe avisa aquí y sólo
// aquí un pedido pasa a `pago_recibido`.
//
// Eventos manejados:
//   payment_intent.succeeded       → pago_recibido
//   payment_intent.processing      → nota (SPEI/OXXO en tránsito)
//   payment_intent.payment_failed  → nota de fallo
//   payment_intent.canceled        → cancelado + devolver stock
//   charge.refunded                → reembolsado
//   charge.dispute.created         → disputa
//
// Requiere STRIPE_WEBHOOK_SECRET. Si falta, la ruta responde 500
// a propósito: es preferible que Stripe reintente y que el error
// sea visible a que los pagos se pierdan en silencio.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import Stripe                        from "stripe";
import { pool }                      from "@/shared/lib/db/pool";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { getStripe, getWebhookSecret, aUnidadMinima } from "@/shared/lib/stripe/client";

export const dynamic = "force-dynamic";
/** Necesita el cuerpo crudo para validar la firma; nada de caché. */
export const runtime = "nodejs";

interface PedidoPago {
  id:     number;
  numero: string;
  estado: string;
  total:  number;
  moneda: string;
  /** PaymentIntent activo del pedido. */
  referencia_pago: string | null;
}

/** Estados que ya no deben degradarse por un evento posterior. */
const ESTADOS_TERMINALES = new Set([
  "enviado", "entregado", "cancelado", "reembolsado", "disputa",
]);

export async function POST(req: NextRequest) {
  const cuerpo = await req.text();
  const firma  = req.headers.get("stripe-signature") ?? "";

  let evento: Stripe.Event;
  try {
    evento = getStripe().webhooks.constructEvent(cuerpo, firma, getWebhookSecret());
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    // Falta de secreto = error de configuración → 500 (Stripe reintenta).
    // Firma inválida = petición no confiable → 400 (no reintentar).
    if (mensaje.includes("STRIPE_WEBHOOK_SECRET")) {
      console.error("[Stripe Webhook] Configuración incompleta:", mensaje);
      return NextResponse.json({ error: "Webhook mal configurado" }, { status: 500 });
    }
    console.error("[Stripe Webhook] Firma inválida:", mensaje);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    switch (evento.type) {
      case "payment_intent.succeeded":
        await alPagarse(evento.data.object);
        break;
      case "payment_intent.processing":
        await alProcesarse(evento.data.object);
        break;
      case "payment_intent.payment_failed":
        await alFallar(evento.data.object);
        break;
      case "payment_intent.canceled":
        await alCancelarse(evento.data.object);
        break;
      case "charge.refunded":
        await alReembolsarse(evento.data.object);
        break;
      case "charge.dispute.created":
        await alDisputarse(evento.data.object);
        break;
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    // Devolver 500 es deliberado: Stripe reintenta con backoff durante
    // días. Responder 200 ante un fallo de BD perdía el pago para siempre.
    console.error(`[Stripe Webhook] Fallo procesando ${evento.type}:`, err);
    return NextResponse.json({ error: "Error procesando el evento" }, { status: 500 });
  }
}

/* ── Rehidratación del objeto del evento ─────────────────── */

/**
 * Los destinos de eventos pueden entregar la carga en estilo "resumen"
 * (thin): el objeto llega con poco más que su `id`, sin metadata ni
 * importes. Como ese ajuste no se puede cambiar una vez creado el
 * destino, el webhook no depende de él: si detecta un objeto
 * incompleto, lo recupera entero desde la API.
 *
 * Con carga completa (snapshot) no hay llamada extra.
 */
async function completarPaymentIntent(pi: Stripe.PaymentIntent): Promise<Stripe.PaymentIntent> {
  // `currency` y `amount` siempre vienen en el snapshot; su ausencia
  // es la señal fiable de que la carga llegó recortada.
  if (pi.currency && typeof pi.amount === "number") return pi;
  return getStripe().paymentIntents.retrieve(pi.id);
}

async function completarCargo(cargo: Stripe.Charge): Promise<Stripe.Charge> {
  if (cargo.currency && typeof cargo.amount === "number") return cargo;
  return getStripe().charges.retrieve(cargo.id);
}

/* ── Localización del pedido ─────────────────────────────── */

/**
 * Busca el pedido primero por `metadata.pedido_id` (enlace directo y
 * estable) y, si no viene, por `referencia_pago`.
 */
async function buscarPedido(pi: Stripe.PaymentIntent): Promise<PedidoPago | null> {
  const idMeta = Number(pi.metadata?.pedido_id);

  if (Number.isInteger(idMeta) && idMeta > 0) {
    const [[fila]] = await pool.execute<RowDataPacket[]>(
      "SELECT id, numero, estado, total, moneda, referencia_pago FROM pedidos WHERE id = ? LIMIT 1",
      [idMeta]
    );
    if (fila) return fila as PedidoPago;
  }

  const [[porRef]] = await pool.execute<RowDataPacket[]>(
    "SELECT id, numero, estado, total, moneda, referencia_pago FROM pedidos WHERE referencia_pago = ? LIMIT 1",
    [pi.id]
  );
  return (porRef as PedidoPago) ?? null;
}

/** Busca el pedido a partir de un Charge (usa su PaymentIntent). */
async function buscarPedidoPorCargo(cargo: Stripe.Charge): Promise<PedidoPago | null> {
  const piId = typeof cargo.payment_intent === "string"
    ? cargo.payment_intent
    : cargo.payment_intent?.id;

  const idMeta = Number(cargo.metadata?.pedido_id);
  if (Number.isInteger(idMeta) && idMeta > 0) {
    const [[fila]] = await pool.execute<RowDataPacket[]>(
      "SELECT id, numero, estado, total, moneda, referencia_pago FROM pedidos WHERE id = ? LIMIT 1",
      [idMeta]
    );
    if (fila) return fila as PedidoPago;
  }
  if (!piId) return null;

  const [[porRef]] = await pool.execute<RowDataPacket[]>(
    "SELECT id, numero, estado, total, moneda, referencia_pago FROM pedidos WHERE referencia_pago = ? LIMIT 1",
    [piId]
  );
  return (porRef as PedidoPago) ?? null;
}

/* ── Utilidades de escritura ─────────────────────────────── */

async function anotarHistorial(
  pedido: PedidoPago,
  estadoNuevo: string,
  comentario: string,
  notificar = 0
) {
  await pool.execute(
    `INSERT INTO pedido_historial (pedido_id, estado_anterior, estado_nuevo, comentario, notificar)
     VALUES (?, ?, ?, ?, ?)`,
    [pedido.id, pedido.estado, estadoNuevo, comentario, notificar]
  );
}

/**
 * Cambia el estado del pedido de forma idempotente: el UPDATE lleva
 * el estado esperado en el WHERE, así dos entregas del mismo evento
 * no duplican el historial.
 */
async function cambiarEstado(
  pedido: PedidoPago,
  estadoNuevo: string,
  comentario: string,
  opciones: { marcarPagado?: boolean; notificar?: number } = {}
): Promise<boolean> {
  const sets = ["estado = ?"];
  if (opciones.marcarPagado) {
    sets.push("pagado_en = COALESCE(pagado_en, NOW())");
  }

  const [res] = await pool.execute<ResultSetHeader>(
    `UPDATE pedidos SET ${sets.join(", ")} WHERE id = ? AND estado = ?`,
    [estadoNuevo, pedido.id, pedido.estado]
  );

  const cambiado = res.affectedRows > 0;
  if (cambiado) {
    await anotarHistorial(pedido, estadoNuevo, comentario, opciones.notificar ?? 1);
  }
  return cambiado;
}

/**
 * Devuelve al inventario lo que el pedido había apartado. Sólo aplica
 * a variantes que llevan control de existencias.
 */
async function devolverStock(pedidoId: number) {
  const [items] = await pool.execute<RowDataPacket[]>(
    "SELECT variante_id, cantidad FROM pedido_items WHERE pedido_id = ?",
    [pedidoId]
  );
  for (const item of items) {
    await pool.execute(
      `UPDATE producto_variantes
          SET stock = stock + ?
        WHERE id = ? AND vender_sin_existencia = 0`,
      [Number(item.cantidad), Number(item.variante_id)]
    );
  }
}

/**
 * Comprueba que lo cobrado coincide con lo que vale el pedido.
 * Es la red que atrapa cualquier intento de pagar de menos.
 */
function importeCoincide(pi: Stripe.PaymentIntent, pedido: PedidoPago): boolean {
  const esperado = aUnidadMinima(Number(pedido.total));
  const recibido = pi.amount_received || pi.amount;
  const monedaOk = pi.currency.toUpperCase() === String(pedido.moneda ?? "MXN").toUpperCase();
  return monedaOk && recibido >= esperado;
}

/* ── Manejadores de evento ───────────────────────────────── */

async function alPagarse(evento: Stripe.PaymentIntent) {
  const pi     = await completarPaymentIntent(evento);
  const pedido = await buscarPedido(pi);
  if (!pedido) {
    console.warn(`[Webhook] Pedido no encontrado para PI ${pi.id}`);
    return;
  }
  if (pedido.estado === "pago_recibido" || ESTADOS_TERMINALES.has(pedido.estado)) {
    return; // ya contabilizado
  }

  if (!importeCoincide(pi, pedido)) {
    // No se acredita: queda anotado para revisión manual en el admin.
    console.error(
      `[Webhook] Importe no coincide en pedido ${pedido.numero}: ` +
      `esperado ${aUnidadMinima(Number(pedido.total))} ${pedido.moneda}, ` +
      `recibido ${pi.amount_received} ${pi.currency.toUpperCase()}`
    );
    await anotarHistorial(
      pedido,
      pedido.estado,
      `⚠ Pago recibido por un importe distinto al del pedido (PI: ${pi.id}). Revisar manualmente.`,
      0
    );
    return;
  }

  const ok = await cambiarEstado(
    pedido,
    "pago_recibido",
    `Pago confirmado por Stripe · PI: ${pi.id}`,
    { marcarPagado: true, notificar: 1 }
  );
  if (ok) console.info(`[Webhook] Pedido ${pedido.numero} → pago_recibido`);
}

async function alProcesarse(evento: Stripe.PaymentIntent) {
  const pi     = await completarPaymentIntent(evento);
  const pedido = await buscarPedido(pi);
  if (!pedido || pedido.estado !== "pendiente_pago") return;

  // No cambia de estado: SPEI/OXXO siguen pendientes hasta que entra
  // el dinero. Sólo deja rastro de que el cliente ya inició el pago.
  await anotarHistorial(
    pedido,
    "pendiente_pago",
    `Pago en tránsito (${pi.payment_method_types.join(", ")}) · PI: ${pi.id}`,
    0
  );
}

async function alFallar(evento: Stripe.PaymentIntent) {
  const pi     = await completarPaymentIntent(evento);
  const pedido = await buscarPedido(pi);
  if (!pedido || ESTADOS_TERMINALES.has(pedido.estado)) return;

  await anotarHistorial(
    pedido,
    pedido.estado,
    `Pago fallido · ${pi.last_payment_error?.message ?? "Sin detalle"} · PI: ${pi.id}`,
    0
  );
  console.warn(`[Webhook] Pago fallido en pedido ${pedido.numero}`);
}

async function alCancelarse(evento: Stripe.PaymentIntent) {
  const pi     = await completarPaymentIntent(evento);
  const pedido = await buscarPedido(pi);
  if (!pedido || pedido.estado !== "pendiente_pago") return;

  // El PaymentIntent puede haber sido reemplazado (el comprador cambió
  // de método de pago sobre el mismo pedido). En ese caso su cancelación
  // no dice nada del pedido, que sigue esperando el pago nuevo.
  if (pedido.referencia_pago !== pi.id) {
    console.info(`[Webhook] PI ${pi.id} cancelado, pero ya no es el activo del pedido ${pedido.numero}`);
    return;
  }

  // Voucher OXXO vencido o CLABE expirada: el pedido se cancela y el
  // inventario que tenía apartado vuelve a estar disponible.
  const ok = await cambiarEstado(
    pedido,
    "cancelado",
    `Pago cancelado o expirado en Stripe · PI: ${pi.id}`,
    { notificar: 1 }
  );
  if (ok) {
    await devolverStock(pedido.id);
    console.info(`[Webhook] Pedido ${pedido.numero} cancelado · stock devuelto`);
  }
}

async function alReembolsarse(evento: Stripe.Charge) {
  const cargo  = await completarCargo(evento);
  const pedido = await buscarPedidoPorCargo(cargo);
  if (!pedido || pedido.estado === "reembolsado") return;

  const total    = cargo.amount;
  const devuelto = cargo.amount_refunded;
  const parcial  = devuelto < total;

  if (parcial) {
    await anotarHistorial(
      pedido,
      pedido.estado,
      `Reembolso parcial de ${(devuelto / 100).toFixed(2)} ${cargo.currency.toUpperCase()}`,
      1
    );
    return;
  }

  const ok = await cambiarEstado(pedido, "reembolsado", "Reembolso total procesado en Stripe");
  if (ok) await devolverStock(pedido.id);
}

async function alDisputarse(evento: Stripe.Dispute) {
  // `charge` y `reason` también faltan si la carga llegó recortada.
  const disputa = evento.charge && evento.reason
    ? evento
    : await getStripe().disputes.retrieve(evento.id);

  const cargoId = typeof disputa.charge === "string" ? disputa.charge : disputa.charge?.id;
  if (!cargoId) return;

  const cargo  = await getStripe().charges.retrieve(cargoId);
  const pedido = await buscarPedidoPorCargo(cargo);
  if (!pedido || pedido.estado === "disputa") return;

  await cambiarEstado(
    pedido,
    "disputa",
    `Disputa abierta en Stripe · motivo: ${disputa.reason}`
  );
  console.warn(`[Webhook] Disputa abierta en pedido ${pedido.numero}`);
}
