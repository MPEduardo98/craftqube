// app/(main)/checkout/components/OrderSummary.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/global/context/CartContext";

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 0,
  }).format(n) + " MXN";
}

function esAtributoVisible(a: string, v: string): boolean {
  const al = a.toLowerCase().trim();
  const vl = v.toLowerCase().trim();
  if (al === "title" || al === "titulo" || al === "default") return false;
  if (vl === "default title" || vl === "default") return false;
  return true;
}

interface Props { compact?: boolean; }

export function OrderSummary({ compact = false }: Props) {
  const { items, totalPrecio } = useCart();
  const [open, setOpen] = useState(!compact);
  const envio = 0;

  const CardWrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      background: "var(--color-cq-surface)",
      border: "1px solid var(--color-cq-border)",
      borderRadius: compact ? (open ? "12px 12px 0 0" : 12) : 16,
      boxShadow: compact ? "none" : "0 2px 16px rgba(0,0,0,0.05)",
    }}>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col">

      {/* ── Toggle mobile compact ── */}
      {compact && (
        <button onClick={() => setOpen((p) => !p)}
          className="flex items-center justify-between w-full py-3 px-5"
          style={{
            background: "var(--color-cq-surface-2)",
            border: "1px solid var(--color-cq-border)",
            borderRadius: open ? "12px 12px 0 0" : 12,
            cursor: "pointer",
          }}>
          <div className="flex items-center gap-2" style={{ color: "var(--color-cq-accent)" }}>
            <i className="fa-solid fa-bag-shopping" style={{ fontSize: "0.85rem" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
              Resumen ({items.length} art.{items.length !== 1 ? "" : ""})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-accent)" }}>
              {formatPrice(totalPrecio)}
            </span>
            <motion.i
              animate={{ rotate: open ? 180 : 0 }}
              className="fa-solid fa-chevron-down"
              style={{ fontSize: "0.7rem", color: "var(--color-cq-muted)" }}
            />
          </div>
        </button>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div style={{
              background: "var(--color-cq-surface)",
              border: "1px solid var(--color-cq-border)",
              borderTop: compact ? "none" : undefined,
              borderRadius: compact ? "0 0 12px 12px" : 16,
              boxShadow: compact ? "none" : "0 2px 16px rgba(0,0,0,0.05)",
            }}>

              {/* Header label */}
              {!compact && (
                <div className="px-5 py-4 flex items-center gap-2"
                  style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
                  <i className="fa-solid fa-receipt" style={{ fontSize: "0.75rem", color: "var(--color-cq-accent)" }} />
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.63rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
                    Tu pedido · {items.length} artículo{items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="flex flex-col px-5 pt-4 pb-2 gap-4">
                {items.map((item) => {
                  const imgSrc = item.imagenNombre
                    ? `/productos/${item.productoId}/${item.imagenNombre}`
                    : null;
                  const atributos = item.atributos.filter((a) => esAtributoVisible(a.atributo, a.valor));
                  return (
                    <div key={item.varianteId} className="flex items-start gap-3">
                      {/* Imagen + badge */}
                      <div className="relative shrink-0">
                        <div className="rounded-xl overflow-hidden" style={{
                          width: 56, height: 56,
                          background: "var(--color-cq-surface-2)",
                          border: "1px solid var(--color-cq-border)",
                        }}>
                          {imgSrc ? (
                            <Image src={imgSrc} alt={item.imagenAlt ?? item.titulo} fill style={{ objectFit: "contain" }} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="fa-regular fa-image" style={{ fontSize: "1.1rem", color: "var(--color-cq-muted-2)" }} />
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full"
                          style={{
                            minWidth: 18, height: 18, padding: "0 4px",
                            background: "var(--color-cq-accent)",
                            fontFamily: "var(--font-mono)", fontSize: "0.55rem", fontWeight: 700,
                            color: "white", border: "2px solid var(--color-cq-surface)",
                          }}>
                          {item.cantidad}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p style={{
                          fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: 600,
                          color: "var(--color-cq-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {item.titulo}
                        </p>
                        {atributos.length > 0 && (
                          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--color-cq-muted-2)", letterSpacing: "0.04em", marginTop: 2 }}>
                            {atributos.map((a) => `${a.atributo}: ${a.valor}`).join(" · ")}
                          </p>
                        )}
                      </div>

                      {/* Precio */}
                      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-cq-text)", flexShrink: 0 }}>
                        ${(item.precio * item.cantidad).toLocaleString("es-MX")}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Totales */}
              <div className="mx-5 mb-5 pt-4 flex flex-col gap-2.5"
                style={{ borderTop: "1px solid var(--color-cq-border)" }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)" }}>Subtotal</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--color-cq-text)" }}>
                    {formatPrice(totalPrecio)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-truck" style={{ fontSize: "0.7rem", color: "var(--color-cq-muted-2)" }} />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)" }}>Envío</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-cq-muted-2)" }}>
                    {envio === 0 ? "Por cotizar" : formatPrice(envio)}
                  </span>
                </div>
                <div style={{ height: 1, background: "var(--color-cq-border)", margin: "2px 0" }} />
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                    Total
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--color-cq-accent)" }}>
                    {formatPrice(totalPrecio + envio)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}