"use client";
// features/account/components/sections/PedidoDetalleSection.tsx
// ─────────────────────────────────────────────────────────────
// Detalle completo de un pedido para el comprador: seguimiento
// del estado, productos, resumen de montos, dirección de envío,
// datos de pago y línea de tiempo.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { resolveImageUrl } from "@/features/media/lib/resolveImageUrl";
import { formatMoneda } from "@/shared/lib/format";
import { estadoMeta, metodoPagoLabel } from "@/features/admin/pedidos/types";
import type { PedidoEstado } from "@/features/orders/types/order";
import type { PedidoDetalleCliente } from "@/features/account/types/order";

/* ── Formato ─────────────────────────────────────────────────── */
function fechaLarga(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fechaCorta(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Pasos que ve el comprador. Los estados terminales que no son
 * "entregado" (cancelado, reembolsado, disputa) no encajan en esta
 * barra: para ellos se muestra un aviso en lugar del progreso.
 */
const FLUJO: { estado: PedidoEstado; label: string; icon: string }[] = [
  { estado: "pendiente_pago", label: "Pago",       icon: "fa-solid fa-credit-card" },
  { estado: "pago_recibido",  label: "Confirmado", icon: "fa-solid fa-circle-check" },
  { estado: "en_proceso",     label: "Preparando", icon: "fa-solid fa-boxes-packing" },
  { estado: "enviado",        label: "Enviado",    icon: "fa-solid fa-truck-fast" },
  { estado: "entregado",      label: "Entregado",  icon: "fa-solid fa-house-circle-check" },
];

/** Índice del flujo alcanzado por el estado actual. */
function pasoActual(estado: PedidoEstado): number {
  switch (estado) {
    case "pendiente_pago": return 0;
    case "pago_recibido":  return 1;
    case "en_proceso":
    case "listo_envio":    return 2;
    case "enviado":        return 3;
    case "entregado":      return 4;
    default:               return -1; // cancelado / reembolsado / disputa
  }
}

const ESTADOS_ANULADOS: PedidoEstado[] = ["cancelado", "reembolsado", "disputa"];

/* ── Bloques de presentación ─────────────────────────────────── */
function Card({ title, icon, children, action }: {
  title: string; icon: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
    >
      <div
        className="flex items-center justify-between gap-3 px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--color-cq-border)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <i className={icon} style={{ fontSize: "0.72rem", color: "var(--color-cq-muted)" }} />
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "0.82rem",
            fontWeight: 700, color: "var(--color-cq-text)", margin: 0,
          }}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <p style={{
        fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--color-cq-muted-2)", margin: 0,
      }}>
        {label}
      </p>
      <div className="break-words" style={{
        fontFamily: "var(--font-body)", fontSize: "0.82rem",
        color: "var(--color-cq-text)", margin: 0,
      }}>
        {value || "—"}
      </div>
    </div>
  );
}

function MontoRow({ label, value, moneda, negativo, strong }: {
  label: string; value: number; moneda: string; negativo?: boolean; strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span style={{
        fontFamily: "var(--font-body)", fontSize: "0.8rem",
        color: strong ? "var(--color-cq-text)" : "var(--color-cq-muted)",
        fontWeight: strong ? 700 : 400,
      }}>
        {label}
      </span>
      <span className="tabular-nums" style={{
        fontFamily: "var(--font-display)",
        fontSize: strong ? "1rem" : "0.82rem",
        fontWeight: strong ? 800 : 600,
        color: negativo ? "#10b981" : "var(--color-cq-text)",
      }}>
        {negativo ? "−" : ""}{formatMoneda(value, moneda)}
      </span>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */
export function PedidoDetalleSection({ pedidoId }: { pedidoId: string }) {
  const [pedido,  setPedido]  = useState<PedidoDetalleCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    fetch(`/api/pedidos/${pedidoId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelado) return;
        if (json.success) setPedido(json.data as PedidoDetalleCliente);
        else setError(json.error ?? "No se pudo cargar el pedido");
      })
      .catch(() => { if (!cancelado) setError("Error de conexión"); })
      .finally(() => { if (!cancelado) setLoading(false); });

    return () => { cancelado = true; };
  }, [pedidoId]);

  const copiarNumero = useCallback(() => {
    if (!pedido) return;
    navigator.clipboard.writeText(pedido.numero).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    }).catch(() => {});
  }, [pedido]);

  /* ── Estados de carga / error ── */
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            border: "3px solid var(--color-cq-border)",
            borderTopColor: "var(--color-cq-accent)",
          }}
        />
      </div>
    );
  }

  if (error || !pedido) {
    return (
      <div className="rounded-xl p-12 text-center"
        style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
        <div className="flex items-center justify-center rounded-full mx-auto mb-5"
          style={{ width: 72, height: 72, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "1.6rem", color: "#ef4444" }} />
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--color-cq-text)", marginBottom: 6 }}>
          {error ?? "Pedido no encontrado"}
        </h3>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-cq-muted)", marginBottom: 18 }}>
          Puede que el pedido no exista o no esté asociado a tu cuenta.
        </p>
        <Link href="/cuenta/pedidos" className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5"
          style={{ background: "var(--color-cq-primary)", color: "white", fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 700 }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.7rem" }} />
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const meta    = estadoMeta(pedido.estado);
  const paso    = pasoActual(pedido.estado);
  const anulado = ESTADOS_ANULADOS.includes(pedido.estado);
  const mon     = pedido.moneda ?? "MXN";
  const nArts   = pedido.items.reduce((acc, it) => acc + Number(it.cantidad), 0);

  const direccion = [
    `${pedido.envio_calle} ${pedido.envio_numero_ext}${pedido.envio_numero_int ? ` int. ${pedido.envio_numero_int}` : ""}`,
    pedido.envio_colonia,
    `${pedido.envio_ciudad}, ${pedido.envio_estado} ${pedido.envio_cp}`,
    pedido.envio_pais,
  ].filter(Boolean).join("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-4"
    >
      {/* ══ Volver ══ */}
      <Link href="/cuenta/pedidos" className="inline-flex items-center gap-2 self-start"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted)" }}>
        <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.68rem" }} />
        Volver a mis pedidos
      </Link>

      {/* ══ Encabezado ══ */}
      <section className="rounded-xl px-5 py-5"
        style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 style={{
                fontFamily: "var(--font-mono)", fontSize: "1.05rem", fontWeight: 700,
                letterSpacing: "0.04em", color: "var(--color-cq-text)", margin: 0,
              }}>
                {pedido.numero}
              </h1>
              <button
                onClick={copiarNumero}
                title="Copiar número de pedido"
                className="flex items-center justify-center rounded-md"
                style={{
                  width: 26, height: 26, cursor: "pointer",
                  background: "var(--color-cq-surface-2)",
                  border: "1px solid var(--color-cq-border)",
                }}
              >
                <i className={copiado ? "fa-solid fa-check" : "fa-regular fa-copy"}
                  style={{ fontSize: "0.65rem", color: copiado ? "#10b981" : "var(--color-cq-muted)" }} />
              </button>
              <span className="px-2.5 py-1 rounded-full" style={{
                background: meta.bg, color: meta.color,
                fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                {meta.label}
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", color: "var(--color-cq-muted)", marginTop: 6 }}>
              Realizado el {fechaLarga(pedido.created_at)}
            </p>
          </div>

          <div className="text-right">
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--color-cq-muted-2)", margin: 0,
            }}>
              Total
            </p>
            <p className="tabular-nums" style={{
              fontFamily: "var(--font-display)", fontSize: "1.35rem", fontWeight: 800,
              color: "var(--color-cq-text)", margin: 0,
            }}>
              {formatMoneda(Number(pedido.total), mon)}
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-cq-muted)", margin: 0 }}>
              {nArts} {nArts === 1 ? "artículo" : "artículos"}
            </p>
          </div>
        </div>
      </section>

      {/* ══ Seguimiento ══ */}
      {anulado ? (
        <div className="rounded-xl px-5 py-4 flex items-start gap-3"
          style={{ background: meta.bg, border: `1px solid ${meta.color}33` }}>
          <i className="fa-solid fa-circle-info" style={{ fontSize: "0.85rem", color: meta.color, marginTop: 2 }} />
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: meta.color, margin: 0 }}>
              Pedido {meta.label.toLowerCase()}
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted)", margin: 0 }}>
              Si tienes dudas sobre este pedido, contáctanos con el número {pedido.numero}.
            </p>
          </div>
        </div>
      ) : (
        <Card title="Seguimiento" icon="fa-solid fa-route">
          <div className="flex items-start">
            {FLUJO.map((step, i) => {
              const hecho  = i <= paso;
              const activo = i === paso;
              return (
                <div key={step.estado} className="flex-1 flex flex-col items-center relative min-w-0">
                  {/* Conector con el paso anterior */}
                  {i > 0 && (
                    <span style={{
                      position: "absolute", top: 15, right: "50%", width: "100%", height: 2,
                      background: i <= paso ? "var(--color-cq-primary)" : "var(--color-cq-border)",
                    }} />
                  )}
                  <div className="flex items-center justify-center rounded-full relative" style={{
                    width: 32, height: 32, zIndex: 1,
                    background: hecho ? "var(--color-cq-primary)" : "var(--color-cq-surface-2)",
                    border: hecho ? "none" : "1px solid var(--color-cq-border)",
                    boxShadow: activo ? "0 0 0 4px rgba(18,36,160,0.12)" : "none",
                  }}>
                    <i className={step.icon} style={{
                      fontSize: "0.68rem",
                      color: hecho ? "white" : "var(--color-cq-muted-2)",
                    }} />
                  </div>
                  <p className="text-center" style={{
                    fontFamily: "var(--font-display)", fontSize: "0.68rem",
                    fontWeight: activo ? 700 : 500, marginTop: 8,
                    color: hecho ? "var(--color-cq-text)" : "var(--color-cq-muted-2)",
                  }}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>

          {(pedido.numero_guia || pedido.paqueteria) && (
            <div className="mt-5 pt-4 flex flex-wrap items-center justify-between gap-3"
              style={{ borderTop: "1px solid var(--color-cq-border)" }}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Paquetería" value={pedido.paqueteria} />
                <Field label="Número de guía" value={
                  pedido.numero_guia
                    ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>{pedido.numero_guia}</span>
                    : "—"
                } />
              </div>
              {pedido.url_rastreo && (
                <a href={pedido.url_rastreo} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5"
                  style={{
                    background: "var(--color-cq-primary)", color: "white",
                    fontFamily: "var(--font-display)", fontSize: "0.78rem", fontWeight: 700,
                  }}>
                  <i className="fa-solid fa-location-crosshairs" style={{ fontSize: "0.7rem" }} />
                  Rastrear envío
                </a>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ══ Productos ══ */}
      <Card title={`Productos (${pedido.items.length})`} icon="fa-solid fa-box">
        <div className="flex flex-col gap-2">
          {pedido.items.map((item) => {
            const src = resolveImageUrl(item.imagen_url, item.producto_id ?? undefined) ?? item.imagen_url;
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-xl p-3"
                style={{ border: "1px solid var(--color-cq-border)" }}>
                <div className="rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                  style={{ width: 52, height: 52, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={item.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-image" style={{ fontSize: "0.9rem", color: "var(--color-cq-muted-2)" }} />
                  )}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  {item.producto_slug ? (
                    <Link href={`/producto/${item.producto_slug}`}
                      className="truncate hover:underline"
                      style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                      {item.titulo}
                    </Link>
                  ) : (
                    <span className="truncate"
                      style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                      {item.titulo}
                    </span>
                  )}
                  <span className="truncate"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--color-cq-muted-2)" }}>
                    {item.sku}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.74rem", color: "var(--color-cq-muted)" }}>
                    {item.cantidad} × {formatMoneda(Number(item.precio_unitario), mon)}
                  </span>
                </div>

                <span className="tabular-nums shrink-0"
                  style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                  {formatMoneda(Number(item.total_linea), mon)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ══ Resumen + Pago ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Resumen de pago" icon="fa-solid fa-receipt">
          <div className="flex flex-col gap-2.5">
            <MontoRow label="Subtotal" value={Number(pedido.subtotal)} moneda={mon} />
            {Number(pedido.descuento) > 0 && (
              <MontoRow
                label={pedido.cupon_codigo ? `Descuento (${pedido.cupon_codigo})` : "Descuento"}
                value={Number(pedido.descuento)} moneda={mon} negativo
              />
            )}
            <MontoRow label="Envío" value={Number(pedido.costo_envio)} moneda={mon} />
            {Number(pedido.impuestos) > 0 && (
              <MontoRow label="Impuestos" value={Number(pedido.impuestos)} moneda={mon} />
            )}
            <div style={{ borderTop: "1px solid var(--color-cq-border)", paddingTop: 10, marginTop: 2 }}>
              <MontoRow label="Total" value={Number(pedido.total)} moneda={mon} strong />
            </div>
          </div>
        </Card>

        <Card title="Método de pago" icon="fa-solid fa-credit-card">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Field label="Método" value={metodoPagoLabel(pedido.metodo_pago)} />
            <Field label="Moneda" value={mon} />
            <Field label="Pagado el" value={fechaLarga(pedido.pagado_en)} />
            <Field label="Referencia" value={
              pedido.referencia_pago
                ? <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", wordBreak: "break-all" }}>
                    {pedido.referencia_pago}
                  </span>
                : "—"
            } />
          </div>
        </Card>
      </div>

      {/* ══ Envío ══ */}
      <Card title="Dirección de envío" icon="fa-solid fa-location-dot">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          <Field label="Destinatario" value={pedido.envio_nombre} />
          <Field label="Teléfono" value={pedido.envio_telefono ?? pedido.telefono} />
          {pedido.envio_empresa && <Field label="Empresa" value={pedido.envio_empresa} />}
          <Field label="Email" value={pedido.email} />
          <div className="sm:col-span-2">
            <Field label="Dirección" value={
              <span style={{ whiteSpace: "pre-line" }}>{direccion}</span>
            } />
          </div>
          {pedido.envio_referencias && (
            <div className="sm:col-span-2">
              <Field label="Referencias" value={pedido.envio_referencias} />
            </div>
          )}
          {pedido.notas_cliente && (
            <div className="sm:col-span-2">
              <Field label="Notas del pedido" value={pedido.notas_cliente} />
            </div>
          )}
        </div>
      </Card>

      {/* ══ Historial ══ */}
      <Card title="Historial del pedido" icon="fa-solid fa-clock-rotate-left">
        <div className="flex flex-col">
          {/* La creación no queda registrada en pedido_historial: se antepone
              aquí para que la línea de tiempo arranque siempre en un punto
              conocido, incluso en pedidos sin cambios de estado todavía. */}
          {[
            { key: "creado", label: "Pedido realizado", color: "var(--color-cq-primary)", fecha: pedido.created_at },
            ...pedido.historial.map((h) => {
              const hm = estadoMeta(h.estado_nuevo);
              return { key: `h${h.id}`, label: hm.label, color: hm.color, fecha: h.created_at };
            }),
          ].map((ev, i, arr) => {
            const last = i === arr.length - 1;
            return (
              <div key={ev.key} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0" style={{ width: 12 }}>
                  <span className="rounded-full shrink-0"
                    style={{ width: 9, height: 9, background: ev.color, marginTop: 5 }} />
                  {!last && <span style={{ width: 1, flex: 1, background: "var(--color-cq-border)" }} />}
                </div>
                <div className={`flex flex-col gap-0.5 min-w-0 ${last ? "" : "pb-5"}`}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                    {ev.label}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", color: "var(--color-cq-muted-2)" }}>
                    {fechaLarga(ev.fecha)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ══ Ayuda ══ */}
      <div className="rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3"
        style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <i className="fa-solid fa-headset" style={{ fontSize: "0.9rem", color: "var(--color-cq-muted)" }} />
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-cq-text)", margin: 0 }}>
              ¿Necesitas ayuda con este pedido?
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.74rem", color: "var(--color-cq-muted)", margin: 0 }}>
              Escríbenos citando el número {pedido.numero} · Actualizado {fechaCorta(pedido.updated_at)}
            </p>
          </div>
        </div>
        <Link href="/contacto" className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5"
          style={{
            background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)",
            fontFamily: "var(--font-display)", fontSize: "0.78rem", fontWeight: 700,
            color: "var(--color-cq-text)",
          }}>
          <i className="fa-solid fa-envelope" style={{ fontSize: "0.7rem" }} />
          Contactar soporte
        </Link>
      </div>
    </motion.div>
  );
}
