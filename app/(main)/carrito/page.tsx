// app/(main)/carrito/page.tsx
"use client";

import Image  from "next/image";
import Link   from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/global/context/CartContext";
import { formatPrice } from "@/app/global/lib/format";

function esAtributoVisible(atributo: string, valor: string): boolean {
  const a = atributo.toLowerCase().trim();
  const v = valor.toLowerCase().trim();
  if (a === "title" || a === "titulo" || a === "default") return false;
  if (v === "default title" || v === "default") return false;
  return true;
}

function CartRow({ item }: { item: ReturnType<typeof useCart>["items"][number] }) {
  const { removeItem, updateQty } = useCart();
  const imageSrc = item.imagenNombre
    ? `/productos/${item.productoId}/${item.imagenNombre}`
    : null;

  const atributosVisibles = item.atributos.filter((a) =>
    esAtributoVisible(a.atributo, a.valor)
  );

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      style={{ borderBottom: "1px solid var(--color-cq-border)" }}
    >
      {/* Producto */}
      <td className="py-5 px-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/producto/${item.slug}`}
            className="relative shrink-0 rounded-xl overflow-hidden"
            style={{ width: 80, height: 80, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}
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
          <div className="min-w-0">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-cq-muted-2)", letterSpacing: "0.05em", display: "block" }}>
              {item.sku}
            </span>
            <Link href={`/producto/${item.slug}`}
              className="font-semibold leading-snug hover:text-blue-500 transition-colors line-clamp-2 block"
              style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-cq-text)", textDecoration: "none" }}>
              {item.titulo}
            </Link>
            {atributosVisibles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {atributosVisibles.map((a) => (
                  <span key={a.atributo} style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", background: "var(--color-cq-accent-glow)", color: "var(--color-cq-accent)", border: "1px solid rgba(37,99,235,0.15)", padding: "1px 7px", borderRadius: 4 }}>
                    {a.atributo}: {a.valor}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Precio unitario */}
      <td className="py-5 px-4 hidden sm:table-cell text-right">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--color-cq-muted)", fontWeight: 500 }}>
          {formatPrice(item.precio)}
        </span>
      </td>

      {/* Cantidad */}
      <td className="py-5 px-4">
        <div className="flex items-center rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--color-cq-border)", width: "fit-content", height: 40 }}>
          <button
            onClick={() => item.cantidad <= 1 ? removeItem(item.varianteId) : updateQty(item.varianteId, item.cantidad - 1)}
            className="flex items-center justify-center transition-colors hover:bg-red-500/10"
            style={{ width: 36, height: 40, color: item.cantidad <= 1 ? "#EF4444" : "var(--color-cq-muted)", cursor: "pointer" }}
          >
            {item.cantidad <= 1 ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11"><path d="M5 12h14"/></svg>
            )}
          </button>
          <span style={{ width: 40, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-cq-text)", borderLeft: "1px solid var(--color-cq-border)", borderRight: "1px solid var(--color-cq-border)" }}>
            {item.cantidad}
          </span>
          <button
            onClick={() => updateQty(item.varianteId, item.cantidad + 1)}
            className="flex items-center justify-center transition-colors hover:bg-blue-500/10"
            style={{ width: 36, height: 40, color: "var(--color-cq-muted)", cursor: "pointer" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </td>

      {/* Total línea */}
      <td className="py-5 px-4 text-right">
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--color-cq-text)" }}>
          {formatPrice(item.precio * item.cantidad)}
        </span>
      </td>

      {/* Eliminar */}
      <td className="py-5 px-4">
        <button
          onClick={() => removeItem(item.varianteId)}
          className="flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500"
          style={{ width: 32, height: 32, color: "var(--color-cq-muted-2)", cursor: "pointer", border: "1px solid var(--color-cq-border)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </td>
    </motion.tr>
  );
}

export default function CarritoPage() {
  const { items, totalItems, totalPrecio, clearCart } = useCart();
  const envio      = 0;
  const totalFinal = totalPrecio + envio;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(37,99,235,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", zIndex: 0 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-10 lg:pt-24 lg:pb-16">

        {/* Encabezado */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10">
          <p className="text-label mb-1">Mi compra</p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-display" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "var(--color-cq-text)" }}>
              Carrito
              {totalItems > 0 && (
                <span className="ml-3 text-base font-normal" style={{ color: "var(--color-cq-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
                  ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})
                </span>
              )}
            </h1>
            {items.length > 0 && (
              <button onClick={clearCart} className="text-xs transition-colors hover:text-red-500"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-cq-muted-2)", cursor: "pointer" }}>
                Vaciar carrito
              </button>
            )}
          </div>
        </motion.div>

        {/* Vacío */}
        {items.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
                <rect x="10" y="20" width="60" height="50" rx="6" stroke="var(--color-cq-border)" strokeWidth="2"/>
                <path d="M26 20v-5a14 14 0 0 1 28 0v5" stroke="var(--color-cq-border)" strokeWidth="2"/>
                <path d="M26 34a14 14 0 0 0 28 0" stroke="var(--color-cq-muted-2)" strokeWidth="1.5" strokeDasharray="4 3"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="font-bold mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--color-cq-text)", letterSpacing: "0.02em" }}>
                Tu carrito está vacío
              </p>
              <p className="text-sm" style={{ color: "var(--color-cq-muted)", fontFamily: "var(--font-mono)" }}>
                Agrega productos desde el catálogo para comenzar
              </p>
            </div>
            <Link href="/catalogo" className="btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Ver catálogo
            </Link>
          </motion.div>
        )}

        {/* Contenido con items */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Tabla — 2/3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="lg:col-span-2"
              style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)", borderRadius: 16, overflow: "hidden" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface-2)" }}>
                    {["Producto", "Precio", "Cantidad", "Total", ""].map((h) => (
                      <th key={h}
                        className={`py-3 px-4 text-left ${h === "Precio" ? "hidden sm:table-cell" : ""} ${h === "Total" || h === "Precio" ? "text-right" : ""}`}
                        style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-cq-muted)", fontWeight: 500 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="px-4">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartRow key={item.varianteId} item={item} />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>

            {/* Resumen — 1/3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
              className="flex flex-col gap-0 rounded-2xl overflow-hidden sticky top-24"
              style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>

              <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface-2)" }}>
                <span className="text-display" style={{ fontSize: "0.9rem", color: "var(--color-cq-text)" }}>
                  Resumen del pedido
                </span>
              </div>

              <div className="px-5 py-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.06em", color: "var(--color-cq-muted)" }}>Subtotal</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--color-cq-text)", fontWeight: 600 }}>
                    {formatPrice(totalPrecio)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.06em", color: "var(--color-cq-muted)" }}>Envío</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#22C55E", fontWeight: 600 }}>
                    {envio === 0 ? "Por cotizar" : formatPrice(envio)}
                  </span>
                </div>
                <div style={{ height: 1, background: "var(--color-cq-border)", margin: "4px 0" }} />
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-cq-text)" }}>Total</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, color: "var(--color-cq-accent)" }}>
                    {formatPrice(totalFinal)}
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-2.5">
                <Link href="/checkout"
                  className="w-full flex items-center justify-center gap-2 rounded-xl font-bold"
                  style={{ height: 52, background: "var(--color-cq-primary)", color: "white", textDecoration: "none", fontFamily: "var(--font-display)", fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 4px 20px rgba(29,78,216,0.3)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Proceder al pago
                </Link>
                <Link href="/catalogo"
                  className="w-full flex items-center justify-center rounded-xl"
                  style={{ height: 42, background: "transparent", color: "var(--color-cq-muted)", textDecoration: "none", fontFamily: "var(--font-body)", fontSize: "0.82rem", border: "1px solid var(--color-cq-border)" }}>
                  Seguir comprando
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}