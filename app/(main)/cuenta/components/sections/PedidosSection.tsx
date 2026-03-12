// app/(main)/cuenta/components/sections/PedidosSection.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PedidoItem {
  id: number;
  numero: string;
  estado: string;
  total: number;
  created_at: string;
  metodo_pago: string | null;
  total_items: number;
}

const ESTADO: Record<string, { label: string; color: string; bg: string }> = {
  pendiente_pago: { label: "Pendiente de pago", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  pago_recibido:  { label: "Pago recibido",     color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  en_proceso:     { label: "En proceso",         color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  listo_envio:    { label: "Listo para envío",   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  enviado:        { label: "Enviado",            color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  entregado:      { label: "Entregado",          color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  cancelado:      { label: "Cancelado",          color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  reembolsado:    { label: "Reembolsado",        color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

function fmt(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n) + " MXN";
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
}

function metodoPago(m: string | null) {
  if (m === "tarjeta") return "Tarjeta";
  if (m === "transferencia") return "SPEI";
  if (m === "oxxo") return "OXXO";
  return "—";
}

export function PedidosSection() {
  const [pedidos, setPedidos] = useState<PedidoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pedidos", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPedidos(d.data ?? []);
        else setError(d.error ?? "Error al cargar pedidos");
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--color-cq-border)", borderTopColor: "var(--color-cq-accent)" }} />
    </div>
  );

  if (error) return (
    <div className="rounded-xl p-8 text-center" style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
      <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "1.75rem", color: "#ef4444", display: "block", marginBottom: 12 }} />
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-text)" }}>{error}</p>
    </div>
  );

  if (pedidos.length === 0) return (
    <div className="rounded-xl p-12 text-center" style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
      <div className="flex items-center justify-center rounded-full mx-auto mb-5"
        style={{ width: 72, height: 72, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
        <i className="fa-solid fa-box-open" style={{ fontSize: "1.75rem", color: "var(--color-cq-muted-2)" }} />
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--color-cq-text)", marginBottom: 6 }}>
        No tienes pedidos aún
      </h3>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-muted)" }}>
        Cuando realices una compra aparecerá aquí
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {pedidos.map((p, i) => {
          const estado = ESTADO[p.estado] ?? { label: p.estado, color: "#64748b", bg: "rgba(100,116,139,0.1)" };
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: "1px solid var(--color-cq-border)" }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "0.04em" }}>
                      {p.numero}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-cq-muted)", marginTop: 2 }}>
                      {fmtDate(p.created_at)}
                    </p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full"
                    style={{
                      background: estado.bg,
                      color: estado.color,
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {estado.label}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                  {fmt(p.total)}
                </p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-5 py-4">
                {[
                  { label: "Artículos",      value: p.total_items ? `${p.total_items}` : "—" },
                  { label: "Método de pago", value: metodoPago(p.metodo_pago) },
                  { label: "Moneda",         value: "MXN" },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-cq-muted-2)", marginBottom: 4 }}>
                      {item.label}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-text)" }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}