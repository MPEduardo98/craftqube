// app/global/components/cart/CartDrawer.tsx
"use client";

import Image from "next/image";
import Link  from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart }       from "@/app/global/context/CartContext";
import { formatPrice }   from "@/app/global/lib/format";
import { resolveImageUrl } from "@/app/global/lib/resolveImageUrl";

function DrawerItem({ item }: { item: ReturnType<typeof useCart>["items"][number] }) {
  const { removeItem, updateQty } = useCart();
  const imageSrc = resolveImageUrl(item.imagenNombre, item.productoId);

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
        style={{ width: 84, height: 84, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}
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
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-cq-muted-2)", letterSpacing: "0.06em" }}>
          {item.sku}
        </span>

        <Link
          href={`/productos/${item.slug}`}
          className="font-semibold leading-snug line-clamp-2 hover:text-blue-500 transition-colors"
          style={{ fontFamily: "var(--font-body)", fontSize: "0.925rem", color: "var(--color-cq-text)", textDecoration: "none" }}
        >
          {item.titulo}
        </Link>

        {item.atributos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.atributos.map((a) => (
              <span key={a.atributo} style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.04em", background: "var(--color-cq-accent-glow)", color: "var(--color-cq-accent)", border: "1px solid rgba(37,99,235,0.15)", padding: "2px 8px", borderRadius: 5 }}>
                {a.atributo}: {a.valor}
              </span>
            ))}
          </div>
        )}

        {/* Precio + controles */}
        <div className="flex items-center justify-between mt-2">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--color-cq-text)" }}>
            {formatPrice(item.precio * item.cantidad)}
          </span>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg overflow-hidden" style={{ border: "1px solid var(--color-cq-border)", height: 32 }}>
              <button
                onClick={() => item.cantidad <= 1 ? removeItem(item.varianteId) : updateQty(item.varianteId, item.cantidad - 1)}
                className="flex items-center justify-center transition-colors hover:bg-red-500/10"
                style={{ width: 32, height: 32, color: item.cantidad <= 1 ? "#EF4444" : "var(--color-cq-muted)", cursor: "pointer" }}
              >
                {item.cantidad <= 1 ? (
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>
                )}
              </button>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700, color: "var(--color-cq-text)", padding: "0 10px" }}>
                {item.cantidad}
              </span>
              <button
                onClick={() => updateQty(item.varianteId, item.cantidad + 1)}
                className="flex items-center justify-center transition-colors hover:bg-blue-500/10"
                style={{ width: 32, height: 32, color: "var(--color-cq-muted)", cursor: "pointer" }}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CartDrawer() {
  const { items, isOpen, totalItems, totalPrecio, closeDrawer } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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

          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 38 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{ width: "min(420px, 100vw)", background: "var(--color-cq-bg)", borderLeft: "1px solid var(--color-cq-border)", boxShadow: "-12px 0 48px rgba(0,0,0,0.18)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "0.02em" }}>
                  Carrito
                </span>
                {totalItems > 0 && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", background: "var(--color-cq-accent)", color: "white", padding: "2px 8px", borderRadius: 20 }}>
                    {totalItems}
                  </span>
                )}
              </div>
              <button onClick={closeDrawer} className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-slate-100" style={{ color: "var(--color-cq-muted)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 min-h-0">
              <AnimatePresence initial={false}>
                {items.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center gap-5 py-20">
                    <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
                      <rect x="8" y="16" width="48" height="40" rx="4" stroke="var(--color-cq-border)" strokeWidth="2"/>
                      <path d="M22 16v-4a10 10 0 0 1 20 0v4" stroke="var(--color-cq-border)" strokeWidth="2"/>
                      <path d="M22 28a10 10 0 0 0 20 0" stroke="var(--color-cq-muted-2)" strokeWidth="1.5" strokeDasharray="3 2"/>
                    </svg>
                    <div className="text-center">
                      <p className="font-bold mb-1.5" style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: "var(--color-cq-text)", letterSpacing: "0.02em" }}>
                        Carrito vacío
                      </p>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)" }}>
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
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
                      Subtotal ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "var(--color-cq-text)" }}>
                      {formatPrice(totalPrecio)}
                    </span>
                  </div>

                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted-2)" }}>
                    Envío calculado en el checkout
                  </p>

                  <Link href="/checkout" onClick={closeDrawer}
                    className="w-full flex items-center justify-center gap-2 rounded-xl font-bold"
                    style={{ height: 52, background: "var(--color-cq-primary)", color: "white", textDecoration: "none", fontFamily: "var(--font-display)", fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 4px 20px rgba(29,78,216,0.3)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    Proceder al pago
                  </Link>

                  <Link href="/carrito" onClick={closeDrawer}
                    className="w-full flex items-center justify-center rounded-xl"
                    style={{ height: 42, background: "transparent", color: "var(--color-cq-muted)", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: "0.82rem", letterSpacing: "0.04em", border: "1px solid var(--color-cq-border)" }}>
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