"use client";
// features/admin/pedidos/components/ModalPedido.tsx
// ─────────────────────────────────────────────────────────────
// Detalle del pedido en panel lateral: ítems, montos, dirección,
// pago, guía de envío e historial de estados. Permite cambiar el
// estado y capturar la guía sin salir del listado.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAlert } from "@/shared/context/AlertContext";
import { Dropdown } from "@/shared/components/ui/Dropdown";
import { resolveImageUrl } from "@/features/media/lib/resolveImageUrl";
import { formatPrice } from "@/shared/lib/format";
import {
  ESTADO_ORDEN, estadoMeta, metodoPagoLabel, PAQUETERIAS,
  type PedidoDetalle, type PedidoRow,
} from "../types";

/* ── Utilidades de formato ───────────────────────────────────── */
function fechaLarga(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const moneda = (m: string): "MXN" | "USD" => (m === "USD" ? "USD" : "MXN");

/* ── Bloques de presentación ─────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-[10px] font-bold tracking-widest uppercase"
        style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}>
        {title}
      </p>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <p className="text-[9.5px] tracking-widest uppercase"
        style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
        {label}
      </p>
      <p className="text-[12.5px] break-words"
        style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
        {value || "—"}
      </p>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4"
      style={{ background: "var(--color-cq-surface-2, #f8fafc)", border: "1px solid var(--color-cq-border, #e2e8f0)" }}>
      {children}
    </div>
  );
}

function MontoRow({ label, value, mon, negativo, strong }: {
  label: string; value: number; mon: string; negativo?: boolean; strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px]"
        style={{
          fontFamily: "var(--font-body, sans-serif)",
          color:      strong ? "var(--color-cq-text, #0f172a)" : "var(--color-cq-muted, #64748b)",
          fontWeight: strong ? 700 : 400,
        }}>
        {label}
      </span>
      <span className="tabular-nums"
        style={{
          fontFamily: "var(--font-display, sans-serif)",
          fontSize:   strong ? 15 : 12.5,
          fontWeight: strong ? 800 : 600,
          color:      negativo ? "#10b981" : "var(--color-cq-text, #0f172a)",
        }}>
        {negativo ? "−" : ""}{formatPrice(value, moneda(mon))}
      </span>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */
interface Props {
  pedidoId: number | null;
  onClose:  () => void;
  /** Notifica al listado los campos que cambiaron para refrescar la fila. */
  onUpdated: (id: number, patch: Partial<PedidoRow>) => void;
}

export function ModalPedido({ pedidoId, onClose, onUpdated }: Props) {
  const alert    = useAlert();
  const alertRef = useRef(alert);
  alertRef.current = alert;

  const [pedido,  setPedido]  = useState<PedidoDetalle | null>(null);
  const [loading, setLoading] = useState(false);

  // Cambio de estado
  const [nuevoEstado,  setNuevoEstado]  = useState("");
  const [comentario,   setComentario]   = useState("");
  const [notificar,    setNotificar]    = useState(true);
  const [savingEstado, setSavingEstado] = useState(false);

  // Guía de envío
  const [paqueteria, setPaqueteria] = useState("");
  const [guia,       setGuia]       = useState("");
  const [rastreo,    setRastreo]    = useState("");
  const [savingGuia, setSavingGuia] = useState(false);

  // Notas internas (solo visibles en el panel)
  const [notas,       setNotas]       = useState("");
  const [savingNotas, setSavingNotas] = useState(false);

  const fetchDetalle = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/pedidos/${id}`);
      const json = await res.json();
      if (!json.success) { alertRef.current.error(json.error ?? "No se pudo cargar el pedido"); return; }
      const p = json.data as PedidoDetalle;
      setPedido(p);
      setNuevoEstado(p.estado);
      setComentario("");
      setNotificar(true);
      setPaqueteria(p.paqueteria  ?? "");
      setGuia(p.numero_guia       ?? "");
      setRastreo(p.url_rastreo    ?? "");
      setNotas(p.notas_internas   ?? "");
    } catch {
      alertRef.current.error("Error de conexión");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (pedidoId == null) { setPedido(null); return; }
    void fetchDetalle(pedidoId);
  }, [pedidoId, fetchDetalle]);

  // Escape para cerrar + bloqueo del scroll de fondo
  useEffect(() => {
    if (pedidoId == null) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prev;
    };
  }, [pedidoId, onClose]);

  if (pedidoId == null) return null;

  const meta = pedido ? estadoMeta(pedido.estado) : null;

  /* ── Guardar estado ────────────────────────────────────────── */
  const guardarEstado = async () => {
    if (!pedido || !nuevoEstado || nuevoEstado === pedido.estado) return;
    setSavingEstado(true);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ estado: nuevoEstado, comentario, notificar }),
      });
      const json = await res.json().catch(() => ({ success: false }));
      if (!json.success) { alert.error(json.error ?? "No se pudo actualizar el estado"); return; }
      alert.success(`Pedido ${pedido.numero} → ${estadoMeta(nuevoEstado).label}`);
      onUpdated(pedido.id, { estado: json.data.estado, pagado_en: json.data.pagado_en });
      await fetchDetalle(pedido.id);
    } catch {
      alert.error("Error de conexión");
    } finally { setSavingEstado(false); }
  };

  /* ── Guardar guía ──────────────────────────────────────────── */
  const guardarGuia = async () => {
    if (!pedido) return;
    setSavingGuia(true);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ paqueteria, numero_guia: guia, url_rastreo: rastreo }),
      });
      const json = await res.json().catch(() => ({ success: false }));
      if (!json.success) { alert.error(json.error ?? "No se pudo guardar la guía"); return; }
      alert.success("Datos de envío guardados");
      onUpdated(pedido.id, { paqueteria: json.data.paqueteria, numero_guia: json.data.numero_guia });
      setPedido(prev => prev ? { ...prev, ...json.data, items: prev.items, historial: prev.historial } : prev);
    } catch {
      alert.error("Error de conexión");
    } finally { setSavingGuia(false); }
  };

  /* ── Guardar notas internas ────────────────────────────────── */
  const guardarNotas = async () => {
    if (!pedido) return;
    setSavingNotas(true);
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ notas_internas: notas }),
      });
      const json = await res.json().catch(() => ({ success: false }));
      if (!json.success) { alert.error(json.error ?? "No se pudieron guardar las notas"); return; }
      alert.success("Notas internas guardadas");
      setPedido(prev => prev ? { ...prev, notas_internas: json.data.notas_internas } : prev);
    } catch {
      alert.error("Error de conexión");
    } finally { setSavingNotas(false); }
  };

  const guiaDirty =
    !!pedido && (
      paqueteria !== (pedido.paqueteria  ?? "") ||
      guia       !== (pedido.numero_guia ?? "") ||
      rastreo    !== (pedido.url_rastreo ?? "")
    );

  const direccion = pedido
    ? [
        `${pedido.envio_calle} ${pedido.envio_numero_ext}${pedido.envio_numero_int ? ` int. ${pedido.envio_numero_int}` : ""}`,
        `Col. ${pedido.envio_colonia}`,
        `${pedido.envio_ciudad}${pedido.envio_municipio ? `, ${pedido.envio_municipio}` : ""}`,
        `${pedido.envio_estado}, C.P. ${pedido.envio_cp}`,
        pedido.envio_pais,
      ]
    : [];

  return (
    <>
      <style>{`
        @keyframes pd-slide-in { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .pd-panel { animation: pd-slide-in .22s cubic-bezier(.22,1,.36,1); }
        .pd-input {
          width: 100%; padding: 8px 10px; border-radius: 8px; outline: none;
          border: 1px solid var(--color-cq-border, #e2e8f0);
          background: var(--color-cq-surface, #fff);
          font-size: 12.5px; color: var(--color-cq-text, #0f172a);
          font-family: var(--font-body, sans-serif);
          transition: border-color .15s, box-shadow .15s;
        }
        .pd-input:focus {
          border-color: var(--color-cq-accent, #2563eb);
          box-shadow: 0 0 0 3px var(--color-cq-accent-glow, rgba(37,99,235,0.12));
        }
        .pd-input:disabled { opacity: .55; }
        .pd-textarea { min-height: 84px; resize: vertical; line-height: 1.55; }
        .pd-btn {
          padding: 8px 14px; border-radius: 9px; border: none;
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: var(--font-mono, monospace);
          background: var(--color-cq-accent, #2563eb); color: #fff;
          transition: opacity .15s;
        }
        .pd-btn:disabled { opacity: .45; cursor: not-allowed; }
        .pd-close {
          width: 30px; height: 30px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--color-cq-border, #e2e8f0);
          background: var(--color-cq-surface, #fff);
          color: var(--color-cq-muted, #64748b);
          cursor: pointer; transition: color .15s, background .15s;
        }
        .pd-close:hover { color: var(--color-cq-text, #0f172a); background: var(--color-cq-surface-2, #f1f5f9); }
        .pd-item-link { text-decoration: none; transition: color .15s; }
        .pd-item-link:hover { color: var(--color-cq-accent, #2563eb) !important; text-decoration: underline; }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex justify-end"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <div
          className="pd-panel h-full w-full max-w-[560px] flex flex-col"
          style={{
            background: "var(--color-cq-surface, #fff)",
            borderLeft: "1px solid var(--color-cq-border, #e2e8f0)",
            boxShadow:  "-20px 0 60px rgba(0,0,0,0.18)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Cabecera ── */}
          <div className="flex items-start justify-between gap-3 px-6 py-5 shrink-0"
            style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}>
            <div className="min-w-0">
              <p className="text-[10px] tracking-widest uppercase mb-1"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-accent, #2563eb)" }}>
                Pedido
              </p>
              <h2 className="text-[20px] font-black tracking-tight leading-none truncate"
                style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
                {pedido?.numero ?? "…"}
              </h2>
              {pedido && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {meta && (
                    <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold"
                      style={{ background: meta.bg, color: meta.color, fontFamily: "var(--font-mono, monospace)" }}>
                      {meta.label}
                    </span>
                  )}
                  <span className="text-[11px]"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
                    {fechaLarga(pedido.created_at)}
                  </span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="pd-close shrink-0" title="Cerrar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Cuerpo ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
            {loading && !pedido ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="animate-spin"
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--color-cq-border, #e2e8f0)", borderTopColor: "var(--color-cq-accent, #2563eb)" }} />
              </div>
            ) : !pedido ? (
              <p className="text-[13px] py-20 text-center"
                style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
                No se pudo cargar el pedido.
              </p>
            ) : (
              <>
                {/* ── Cambiar estado ── */}
                <Section title="Estado del pedido">
                  <Card>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Dropdown
                          value={nuevoEstado}
                          onChange={setNuevoEstado}
                          align="left"
                          width={210}
                          disabled={savingEstado}
                          options={ESTADO_ORDEN.map(e => ({ value: e, label: estadoMeta(e).label }))}
                        />
                        <button
                          className="pd-btn"
                          onClick={guardarEstado}
                          disabled={savingEstado || nuevoEstado === pedido.estado}
                        >
                          {savingEstado ? "Guardando…" : "Actualizar"}
                        </button>
                      </div>
                      {nuevoEstado !== pedido.estado && (
                        <>
                          <input
                            className="pd-input"
                            placeholder="Comentario para el historial (opcional)"
                            value={comentario}
                            onChange={e => setComentario(e.target.value)}
                          />
                          <label className="flex items-center gap-2 text-[12px] cursor-pointer"
                            style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
                            <input type="checkbox" checked={notificar} onChange={e => setNotificar(e.target.checked)}
                              className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600" />
                            Marcar para notificar al cliente
                          </label>
                        </>
                      )}
                    </div>
                  </Card>
                </Section>

                {/* ── Ítems ── */}
                <Section title={`Productos (${pedido.items.length})`}>
                  <div className="flex flex-col gap-2">
                    {pedido.items.map(item => {
                      const src = resolveImageUrl(item.imagen_url, undefined) ?? item.imagen_url;
                      const detalle = `${item.sku} · ${item.cantidad} × ${formatPrice(Number(item.precio_unitario), moneda(pedido.moneda))}`;
                      return (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl p-3"
                          style={{ border: "1px solid var(--color-cq-border, #e2e8f0)" }}>
                          <div className="rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                            style={{ width: 44, height: 44, background: "var(--color-cq-surface-2, #f1f5f9)", border: "1px solid var(--color-cq-border, #e2e8f0)" }}>
                            {src ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={src} alt={item.titulo} className="w-full h-full object-cover" />
                            ) : (
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #cbd5e1)" }}>
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                              </svg>
                            )}
                          </div>

                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            {item.producto_slug ? (
                              <Link href={`/producto/${item.producto_slug}`} target="_blank"
                                className="pd-item-link text-[12.5px] font-semibold leading-snug truncate"
                                style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
                                {item.titulo}
                              </Link>
                            ) : (
                              <span className="text-[12.5px] font-semibold leading-snug truncate"
                                style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
                                {item.titulo}
                              </span>
                            )}
                            <span className="text-[10.5px] truncate"
                              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
                              {detalle}
                            </span>
                          </div>

                          <span className="text-[13px] font-bold tabular-nums shrink-0"
                            style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
                            {formatPrice(Number(item.total_linea), moneda(pedido.moneda))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Section>

                {/* ── Montos ── */}
                <Section title="Resumen">
                  <Card>
                    <div className="flex flex-col gap-2">
                      <MontoRow label="Subtotal" value={Number(pedido.subtotal)} mon={pedido.moneda} />
                      {Number(pedido.descuento) > 0 && (
                        <MontoRow
                          label={pedido.cupon_codigo ? `Descuento (${pedido.cupon_codigo})` : "Descuento"}
                          value={Number(pedido.descuento)} mon={pedido.moneda} negativo
                        />
                      )}
                      <MontoRow label="Envío" value={Number(pedido.costo_envio)} mon={pedido.moneda} />
                      {Number(pedido.impuestos) > 0 && (
                        <MontoRow label="Impuestos" value={Number(pedido.impuestos)} mon={pedido.moneda} />
                      )}
                      <div style={{ borderTop: "1px solid var(--color-cq-border, #e2e8f0)", paddingTop: 8, marginTop: 2 }}>
                        <MontoRow label="Total" value={Number(pedido.total)} mon={pedido.moneda} strong />
                      </div>
                    </div>
                  </Card>
                </Section>

                {/* ── Cliente y envío ── */}
                <Section title="Cliente y envío">
                  <Card>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                      <Field label="Nombre"   value={pedido.envio_nombre} />
                      <Field label="Email"    value={pedido.email} />
                      <Field label="Teléfono" value={pedido.envio_telefono ?? pedido.telefono} />
                      <Field label="Empresa"  value={pedido.envio_empresa} />
                      <div className="col-span-2">
                        <Field label="Dirección" value={
                          <span style={{ lineHeight: 1.6 }}>
                            {direccion.map((linea, i) => <span key={i} className="block">{linea}</span>)}
                          </span>
                        } />
                      </div>
                      {pedido.envio_referencias && (
                        <div className="col-span-2">
                          <Field label="Referencias" value={pedido.envio_referencias} />
                        </div>
                      )}
                      {pedido.notas_cliente && (
                        <div className="col-span-2">
                          <Field label="Notas del cliente" value={pedido.notas_cliente} />
                        </div>
                      )}
                    </div>
                  </Card>
                </Section>

                {/* ── Pago ── */}
                <Section title="Pago">
                  <Card>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                      <Field label="Método"    value={metodoPagoLabel(pedido.metodo_pago)} />
                      <Field label="Pagado el" value={fechaLarga(pedido.pagado_en)} />
                      <div className="col-span-2">
                        <Field label="Referencia" value={
                          pedido.referencia_pago
                            ? <span style={{ fontFamily: "var(--font-mono, monospace)" }}>{pedido.referencia_pago}</span>
                            : null
                        } />
                      </div>
                    </div>
                  </Card>
                </Section>

                {/* ── Guía de envío ── */}
                <Section title="Guía de envío">
                  <Card>
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[9.5px] tracking-widest uppercase"
                            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
                            Paquetería
                          </p>
                          <Dropdown
                            value={paqueteria}
                            onChange={setPaqueteria}
                            align="left"
                            width={200}
                            placeholder="Sin asignar"
                            disabled={savingGuia}
                            options={[
                              { value: "", label: "Sin asignar" },
                              ...PAQUETERIAS.map(p => ({ value: p, label: p })),
                            ]}
                            triggerClassName="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold w-full transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[9.5px] tracking-widest uppercase"
                            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
                            Número de guía
                          </p>
                          <input className="pd-input" placeholder="Sin guía"
                            value={guia} onChange={e => setGuia(e.target.value)} disabled={savingGuia}
                            style={{ fontFamily: "var(--font-mono, monospace)" }} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[9.5px] tracking-widest uppercase"
                          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
                          URL de rastreo
                        </p>
                        <input className="pd-input" placeholder="https://…"
                          value={rastreo} onChange={e => setRastreo(e.target.value)} disabled={savingGuia} />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button className="pd-btn" onClick={guardarGuia} disabled={savingGuia || !guiaDirty}>
                          {savingGuia ? "Guardando…" : "Guardar envío"}
                        </button>
                        {pedido.enviado_en && (
                          <span className="text-[11px]"
                            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
                            Enviado {fechaLarga(pedido.enviado_en)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Section>

                {/* ── Notas internas ── */}
                <Section title="Notas internas">
                  <Card>
                    <div className="flex flex-col gap-3">
                      <textarea
                        className="pd-input pd-textarea"
                        placeholder="Visibles solo para el equipo — el cliente nunca las ve."
                        value={notas}
                        onChange={e => setNotas(e.target.value)}
                        disabled={savingNotas}
                      />
                      <button
                        className="pd-btn self-start"
                        onClick={guardarNotas}
                        disabled={savingNotas || notas === (pedido.notas_internas ?? "")}
                      >
                        {savingNotas ? "Guardando…" : "Guardar notas"}
                      </button>
                    </div>
                  </Card>
                </Section>

                {/* ── Historial ── */}
                <Section title={`Historial (${pedido.historial.length})`}>
                  <div className="flex flex-col">
                    {pedido.historial.length === 0 ? (
                      <p className="text-[12px]" style={{ color: "var(--color-cq-muted-2, #94a3b8)", fontFamily: "var(--font-body, sans-serif)" }}>
                        Sin movimientos registrados.
                      </p>
                    ) : pedido.historial.map((h, i) => {
                      const hm   = estadoMeta(h.estado_nuevo);
                      const last = i === pedido.historial.length - 1;
                      return (
                        <div key={h.id} className="flex gap-3">
                          {/* Línea de tiempo */}
                          <div className="flex flex-col items-center shrink-0" style={{ width: 12 }}>
                            <span className="rounded-full shrink-0"
                              style={{ width: 8, height: 8, background: hm.color, marginTop: 5 }} />
                            {!last && <span style={{ width: 1, flex: 1, background: "var(--color-cq-border, #e2e8f0)" }} />}
                          </div>
                          <div className={`flex flex-col gap-0.5 min-w-0 ${last ? "" : "pb-4"}`}>
                            <span className="text-[12px] font-semibold"
                              style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
                              {hm.label}
                              {h.estado_anterior && (
                                <span style={{ fontWeight: 400, color: "var(--color-cq-muted-2, #94a3b8)" }}>
                                  {" "}· desde {estadoMeta(h.estado_anterior).label}
                                </span>
                              )}
                            </span>
                            <span className="text-[10.5px]"
                              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
                              {fechaLarga(h.created_at)}
                            </span>
                            {h.comentario && (
                              <span className="text-[12px] mt-0.5"
                                style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--color-cq-muted, #64748b)" }}>
                                {h.comentario}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
