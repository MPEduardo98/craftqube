// app/(main)/checkout/components/OrderSummary.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/features/cart/context/CartContext";
import { formatPrice, formatMoneda } from "@/shared/lib/format";
import { resolveImageUrl } from "@/features/media/lib/resolveImageUrl";

function esAtributoVisible(a: string, v: string): boolean {
  const al = a.toLowerCase().trim();
  const vl = v.toLowerCase().trim();
  if (al === "title" || al === "titulo" || al === "default") return false;
  if (vl === "default title" || vl === "default") return false;
  return true;
}

/**
 * Contenedor de la tarjeta. Vive fuera del componente: declarado
 * dentro, React lo trataba como un tipo nuevo en cada render y
 * remontaba todo el subárbol.
 */
function CardWrapper({ children, compact, open }: {
  children: React.ReactNode; compact: boolean; open: boolean;
}) {
  return (
    <div style={{
      background: "var(--color-cq-surface)",
      border: "1px solid var(--color-cq-border)",
      borderRadius: compact ? (open ? "12px 12px 0 0" : 12) : 16,
      boxShadow: compact ? "none" : "0 2px 16px rgba(0,0,0,0.05)",
    }}>
      {children}
    </div>
  );
}

/** Desglose calculado por el servidor (misma fuente que el cobro). */
export interface ResumenImportes {
  subtotal:    number;
  descuento:   number;
  costo_envio: number;
  impuestos:   number;
  total:       number;
  moneda:      string;
}

interface Props {
  compact?: boolean;
  /**
   * Importes del servidor. null = aún sin calcular (falta el estado de
   * envío o la petición está en vuelo); en ese caso se muestra el
   * subtotal local del carrito y el envío queda "por cotizar".
   */
  resumen?: ResumenImportes | null;
}

export function OrderSummary({ compact = false, resumen = null }: Props) {
  const { items, totalPrecio } = useCart();
  const [open, setOpen] = useState(!compact);

  const moneda    = resumen?.moneda ?? "MXN";
  const subtotal  = resumen?.subtotal ?? totalPrecio;
  const descuento = resumen?.descuento ?? 0;
  const envio     = resumen?.costo_envio ?? 0;
  const total     = resumen?.total ?? totalPrecio;
  const envioPorCotizar = resumen === null;

  /** Con resumen se formatea sin convertir; sin él, el precio local. */
  const fmt = (n: number) => (resumen ? formatMoneda(n, moneda) : formatPrice(n));

  return (
    <div className="flex flex-col">

      {/* Toggle mobile compact */}
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
              Resumen ({items.length} art.)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-accent)" }}>
              {formatPrice(totalPrecio)}
            </span>
            <motion.i
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="fa-solid fa-chevron-down"
              style={{ fontSize: "0.75rem", color: "var(--color-cq-muted)" }}
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <CardWrapper compact={compact} open={open}>
              {/* Header */}
              {!compact && (
                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface-2)" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                    Resumen del pedido
                  </span>
                </div>
              )}

              {/* Items */}
              <div className="px-5 py-4 flex flex-col gap-3" style={{ maxHeight: 320, overflowY: "auto" }}>
                {items.map((item) => {
                  const imageSrc = resolveImageUrl(item.imagenNombre, item.productoId);
                  const atributosVisibles = item.atributos.filter((a) =>
                    esAtributoVisible(a.atributo, a.valor)
                  );
                  return (
                    <div key={item.varianteId} className="flex items-center gap-3">
                      <div className="relative shrink-0 rounded-lg overflow-hidden"
                        style={{ width: 52, height: 52, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
                        {imageSrc ? (
                          <Image src={imageSrc} alt={item.imagenAlt ?? item.titulo} fill className="object-contain p-1" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg viewBox="0 0 40 40" width="22" height="22">
                              <circle cx="20" cy="20" r="10" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.4"/>
                            </svg>
                          </div>
                        )}
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-white"
                          style={{ width: 18, height: 18, background: "var(--color-cq-primary)", fontFamily: "var(--font-mono)", fontSize: "0.58rem", fontWeight: 700 }}>
                          {item.cantidad}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1 font-medium" style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-text)" }}>
                          {item.titulo}
                        </p>
                        {atributosVisibles.length > 0 && (
                          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-cq-muted-2)" }}>
                            {atributosVisibles.map((a) => `${a.atributo}: ${a.valor}`).join(" · ")}
                          </p>
                        )}
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 600, color: "var(--color-cq-text)", whiteSpace: "nowrap" }}>
                        {formatPrice(item.precio * item.cantidad)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totales */}
              <div className="mx-5 mb-5 pt-4 flex flex-col gap-2.5" style={{ borderTop: "1px solid var(--color-cq-border)" }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)" }}>Subtotal</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--color-cq-text)" }}>
                    {fmt(subtotal)}
                  </span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <i className="fa-solid fa-tag" style={{ fontSize: "0.7rem", color: "#22c55e" }} />
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)" }}>Descuento</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "#22c55e" }}>
                      −{fmt(descuento)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <i className="fa-solid fa-truck" style={{ fontSize: "0.7rem", color: "var(--color-cq-muted-2)" }} />
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)" }}>Envío</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-cq-muted-2)" }}>
                    {envioPorCotizar ? "Por cotizar" : envio === 0 ? "Gratis" : fmt(envio)}
                  </span>
                </div>
                <div style={{ height: 1, background: "var(--color-cq-border)", margin: "2px 0" }} />
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                    Total
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--color-cq-accent)" }}>
                    {fmt(total)}
                  </span>
                </div>
              </div>
            </CardWrapper>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}