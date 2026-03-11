// app/(main)/cuenta/pedidos/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface PedidoListItem {
  id: number;
  numero: string;
  estado: string;
  total: number;
  created_at: string;
  metodo_pago: string | null;
  items_count: number;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n) + " MXN";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const ESTADO_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pendiente_pago: { label: "Pendiente de pago", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  pago_recibido: { label: "Pago recibido", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  en_proceso: { label: "En proceso", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  enviado: { label: "Enviado", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  entregado: { label: "Entregado", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  cancelado: { label: "Cancelado", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const res = await fetch("/api/pedidos", { credentials: "include" });
      const data = await res.json();

      if (res.ok && data.success) {
        setPedidos(data.data || []);
      } else {
        setError(data.error || "Error al cargar pedidos");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "3px solid var(--color-cq-border)",
            borderTopColor: "var(--color-cq-accent)",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{
          background: "var(--color-cq-surface)",
          border: "1px solid var(--color-cq-border)",
        }}
      >
        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "2rem", color: "#ef4444", marginBottom: 16 }} />
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-cq-text)" }}>{error}</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{
          background: "var(--color-cq-surface)",
          border: "1px solid var(--color-cq-border)",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full mx-auto mb-6"
          style={{
            width: 80,
            height: 80,
            background: "var(--color-cq-surface-2)",
            border: "1px solid var(--color-cq-border)",
          }}
        >
          <i className="fa-solid fa-box-open" style={{ fontSize: "2rem", color: "var(--color-cq-muted-2)" }} />
        </div>
        <h3
          className="mb-2"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--color-cq-text)",
          }}
        >
          No tienes pedidos aún
        </h3>
        <p
          className="mb-6"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "var(--color-cq-muted)",
          }}
        >
          Explora nuestro catálogo y realiza tu primera compra
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 rounded-lg px-6 py-3"
          style={{
            background: "var(--color-cq-primary)",
            color: "white",
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <i className="fa-solid fa-store" style={{ fontSize: "0.8rem" }} />
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence>
        {pedidos.map((pedido, i) => {
          const estadoInfo = ESTADO_LABELS[pedido.estado] || { label: pedido.estado, color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };

          return (
            <motion.div
              key={pedido.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--color-cq-surface)",
                border: "1px solid var(--color-cq-border)",
              }}
            >
              {/* Header */}
              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5"
                style={{ borderBottom: "1px solid var(--color-cq-border)" }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--color-cq-text)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      #{pedido.numero}
                    </p>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: estadoInfo.bg,
                        color: estadoInfo.color,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {estadoInfo.label}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.8rem",
                      color: "var(--color-cq-muted)",
                    }}
                  >
                    {formatDate(pedido.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className="uppercase tracking-wider mb-1"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--color-cq-muted-2)",
                      }}
                    >
                      Total
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.2rem",
                        fontWeight: 800,
                        color: "var(--color-cq-text)",
                      }}
                    >
                      {formatPrice(pedido.total)}
                    </p>
                  </div>

                  <Link
                    href={`/cuenta/pedidos/${pedido.id}`}
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: 40,
                      height: 40,
                      background: "var(--color-cq-primary)",
                      color: "white",
                      textDecoration: "none",
                    }}
                  >
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: "0.8rem" }} />
                  </Link>
                </div>
              </div>

              {/* Detalles rápidos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
                <div>
                  <p
                    className="uppercase tracking-wider mb-1"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--color-cq-muted-2)",
                    }}
                  >
                    Artículos
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-text)" }}>
                    {pedido.items_count || "—"}
                  </p>
                </div>

                <div>
                  <p
                    className="uppercase tracking-wider mb-1"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--color-cq-muted-2)",
                    }}
                  >
                    Método de pago
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-text)" }}>
                    {pedido.metodo_pago === "tarjeta" ? "Tarjeta" : pedido.metodo_pago === "transferencia" ? "SPEI" : pedido.metodo_pago === "oxxo" ? "OXXO" : "—"}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}