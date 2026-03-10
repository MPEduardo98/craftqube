// app/global/components/cart/CartDrawer.tsx
"use client";

import Image from "next/image";
import Link  from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/global/context/CartContext";

function formatPrice(n: number) {
  return (
    new Intl.NumberFormat("es-MX", {
      style: "currency", currency: "MXN", maximumFractionDigits: 0,
    }).format(n) + " MXN"
  );
}

function DrawerItem({ item }: { item: ReturnType<typeof useCart>["items"][number] }) {
  const { removeItem, updateQty } = useCart();
  const imageSrc = item.imagenNombre
    ? `/productos/${item.productoId}/${item.imagenNombre}`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="flex gap-4 py-4"
      style={{ borderBottom: "1px solid var(--color-cq-border)" }}
    >
      {/* Imagen */}
      <Link
        href={`/productos/${item.slug}`}
        className="relative shrink-0 rounded-xl overflow-hidden"
        style={{
          width: 84, height: 84,
          background: "var(--color-cq-surface-2)",
          border: "1px solid var(--color-cq-border)",
        }}
      >
        {imageSrc ? (
          <Image src={imageSrc} alt={item.imagenAlt ?? item.titulo} fill className="object-contain p-2" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 40 40" width="28" height="28">
              <circle cx="20" cy="20" r="10" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.4"/>
              <circle cx="20" cy="20" r="4" fill="#2563EB" opacity="0.5"/>
            </svg>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* SKU */}
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "0.7rem",
          color: "var(--color-cq-muted-2)", letterSpacing: "0.06em",
        }}>
          {item.sku}
        </span>

        {/* Título */}
        <Link
          href={`/productos/${item.slug}`}
          className="font-semibold leading-snug line-clamp-2 hover:text-blue-500 transition-colors"
          style={{
            fontFamily: "var(--font-body)", fontSize: "0.925rem",
            color: "var(--color-cq-text)", textDecoration: "none",
          }}
        >
          {item.titulo}
        </Link>

        {/* Atributos */}
        {item.atributos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.atributos.map((a) => (
              <span key={a.atributo} style={{
                fontFamily: "var(--font-mono)", fontSize: "0.68rem",
                letterSpacing: "0.04em",
                background: "var(--color-cq-accent-glow)",
                color: "var(--color-cq-accent)",
                border: "1px solid rgba(37,99,235,0.15)",
                padding: "2px 8px", borderRadius: 5,
              }}>
                {a.atributo}: {a.valor}
              </span>
            ))}
          </div>
        )}

        {/* Precio + controles */}
        <div className="flex items-center justify-between mt-2">
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: "1rem", color: "var(--color-cq-text)",
          }}>
            {formatPrice(item.precio * item.cantidad)}
          </span>

          <div className="flex items-center gap-2">
            {/* Qty stepper */}
            <div className="flex items-center rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--color-cq-border)", height: 32 }}>
              <button
                onClick={() => item.cantidad <= 1 ? removeItem(item.varianteId) : updateQty(item.varianteId, item.cantidad - 1)}
                className="flex items-center justify-center transition-colors hover:bg-red-500/10"
                style={{ width: 32, height: 32, color: item.cantidad <= 1 ? "#EF4444" : "var(--color-cq-muted)", cursor: "pointer" }}
              >
                {item.cantidad <= 1 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><path d="M5 12h14"/></svg>
                )}
              </button>
              <span style={{
                width: 34, textAlign: "center",
                fontFamily: "var(--font-mono)", fontSize: "0.82rem", fontWeight: 600,
                color: "var(--color-cq-text)",
                borderLeft: "1px solid var(--color-cq-border)",
                borderRight: "1px solid var(--color-cq-border)",
              }}>
                {item.cantidad}
              </span>
              <button
                onClick={() => updateQty(item.varianteId, item.cantidad + 1)}
                className="flex items-center justify-center transition-colors hover:bg-blue-500/10"
                style={{ width: 32, height: 32, color: "var(--color-cq-muted)", cursor: "pointer" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>

            {/* Eliminar */}
            <button
              onClick={() => removeItem(item.varianteId)}
              className="flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
              style={{ width: 32, height: 32, cursor: "pointer", color: "var(--color-cq-muted-2)", border: "1px solid var(--color-cq-border)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CartDrawer() {
  const { items, isOpen, totalItems, totalPrecio, clearCart, closeDrawer } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.45)" }}
          />

          {/* Panel */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 38 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: "min(420px, 100vw)",
              background: "var(--color-cq-bg)",
              borderLeft: "1px solid var(--color-cq-border)",
              boxShadow: "-12px 0 48px rgba(0,0,0,0.18)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 shrink-0"
              style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-cq-accent)" strokeWidth="2" width="20" height="20">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span className="text-display" style={{ fontSize: "1.1rem", color: "var(--color-cq-text)" }}>
                  Carrito
                </span>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      className="px-2.5 py-0.5 rounded-full font-bold"
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                        background: "var(--color-cq-accent)", color: "white",
                      }}
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                {items.length > 0 && (
                  <button onClick={clearCart}
                    className="transition-colors hover:text-red-500"
                    style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                      letterSpacing: "0.06em", color: "var(--color-cq-muted-2)", cursor: "pointer",
                    }}>
                    Vaciar
                  </button>
                )}
                <button onClick={closeDrawer}
                  className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors hover:bg-red-500/10"
                  style={{ color: "var(--color-cq-muted)", cursor: "pointer", border: "1px solid var(--color-cq-border)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="overflow-y-auto px-6 py-2" style={{ flex: "1 1 0", minHeight: 0 }}>
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-5 py-20"
                  >
                    <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
                      <rect x="8" y="16" width="48" height="40" rx="4" stroke="var(--color-cq-border)" strokeWidth="2"/>
                      <path d="M22 16v-4a10 10 0 0 1 20 0v4" stroke="var(--color-cq-border)" strokeWidth="2"/>
                      <path d="M22 28a10 10 0 0 0 20 0" stroke="var(--color-cq-muted-2)" strokeWidth="1.5" strokeDasharray="3 2"/>
                    </svg>
                    <div className="text-center">
                      <p className="font-bold mb-1.5" style={{
                        fontFamily: "var(--font-display)", fontSize: "1.05rem",
                        color: "var(--color-cq-text)", letterSpacing: "0.02em",
                      }}>
                        Carrito vacío
                      </p>
                      <p style={{
                        fontFamily: "var(--font-body)", fontSize: "0.875rem",
                        color: "var(--color-cq-muted)",
                      }}>
                        Agrega productos para comenzar
                      </p>
                    </div>
                    <Link href="/catalogo" onClick={closeDrawer} className="btn-primary">
                      Ver catálogo
                    </Link>
                  </motion.div>
                ) : (
                  items.map((item) => <DrawerItem key={item.varianteId} item={item} />)
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 px-6 pt-4 pb-6 flex flex-col gap-3.5"
                  style={{ borderTop: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface)" }}
                >
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "var(--color-cq-muted)",
                    }}>
                      Subtotal ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})
                    </span>
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 700,
                      fontSize: "1.25rem", color: "var(--color-cq-text)",
                    }}>
                      {formatPrice(totalPrecio)}
                    </span>
                  </div>

                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.78rem",
                    color: "var(--color-cq-muted-2)",
                  }}>
                    Envío calculado en el checkout
                  </p>

                  {/* CTA checkout */}
                  <Link href="/checkout" onClick={closeDrawer}
                    className="w-full flex items-center justify-center gap-2 rounded-xl font-bold"
                    style={{
                      height: 52, background: "var(--color-cq-primary)", color: "white",
                      textDecoration: "none", fontFamily: "var(--font-display)",
                      fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase",
                      boxShadow: "0 4px 20px rgba(29,78,216,0.3)",
                    }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    Proceder al pago
                  </Link>

                  {/* Ver carrito completo */}
                  <Link href="/carrito" onClick={closeDrawer}
                    className="w-full flex items-center justify-center rounded-xl"
                    style={{
                      height: 42, background: "transparent",
                      color: "var(--color-cq-muted)", textDecoration: "none",
                      fontFamily: "var(--font-body)", fontSize: "0.82rem",
                      letterSpacing: "0.04em",
                      border: "1px solid var(--color-cq-border)",
                    }}>
                    Ver carrito completo
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}