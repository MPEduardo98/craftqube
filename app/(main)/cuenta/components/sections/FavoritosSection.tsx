// app/(main)/cuenta/components/sections/FavoritosSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/app/global/context/WishlistContext";
import { useCart } from "@/app/global/context/CartContext";
import { formatPrice } from "@/app/global/lib/format";

export function FavoritosSection() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) return (
    <div className="rounded-xl p-12 text-center"
      style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
      <div className="flex items-center justify-center rounded-full mx-auto mb-5"
        style={{ width: 72, height: 72, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
        <i className="fa-solid fa-heart" style={{ fontSize: "1.75rem", color: "var(--color-cq-muted-2)" }} />
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--color-cq-text)", marginBottom: 6 }}>
        No tienes favoritos
      </h3>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-muted)", marginBottom: 20 }}>
        Guarda productos para encontrarlos fácilmente
      </p>
      <Link href="/catalogo" className="inline-flex items-center gap-2 rounded-lg px-5 py-3"
        style={{ background: "var(--color-cq-primary)", color: "white", fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
        <i className="fa-solid fa-store" style={{ fontSize: "0.75rem" }} />
        Explorar catálogo
      </Link>
    </div>
  );

  return (
    <div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.83rem", color: "var(--color-cq-muted)", marginBottom: 16 }}>
        {items.length} {items.length === 1 ? "producto" : "productos"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {items.map((item, i) => {
            const imgSrc = item.imagenNombre
              ? `/productos/${item.productoId}/${item.imagenNombre}`
              : null;

            return (
              <motion.div
                key={item.productoId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="rounded-xl overflow-hidden flex flex-col"
                style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
              >
                {/* Imagen */}
                <Link href={`/producto/${item.slug}`}
                  className="relative block shrink-0"
                  style={{ aspectRatio: "1/1", background: "var(--color-cq-surface-2)", borderBottom: "1px solid var(--color-cq-border)" }}>
                  {imgSrc ? (
                    <Image src={imgSrc} alt={item.imagenAlt ?? item.titulo} fill className="object-contain p-4" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 40 40" width="32" height="32">
                        <circle cx="20" cy="20" r="12" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.3"/>
                        <circle cx="20" cy="20" r="5" fill="#2563EB" opacity="0.4"/>
                      </svg>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex flex-col gap-2 p-4 flex-1">
                  {item.marca && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-accent)" }}>
                      {item.marca}
                    </span>
                  )}
                  <Link href={`/producto/${item.slug}`}
                    className="font-semibold leading-snug line-clamp-2 hover:text-blue-500 transition-colors"
                    style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--color-cq-text)", textDecoration: "none" }}>
                    {item.titulo}
                  </Link>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800, color: "var(--color-cq-text)" }}>
                    {formatPrice(item.precio)}
                  </span>

                  {/* Acciones */}
                  <div className="flex gap-2 mt-auto pt-2">
                    <button
                      onClick={() => {
                        addItem({
                          productoId:   item.productoId,
                          varianteId:   item.productoId,
                          titulo:       item.titulo,
                          slug:         item.slug,
                          sku:          `PROD-${item.productoId}`,
                          precio:       item.precio,
                          cantidad:     1,
                          imagenNombre: item.imagenNombre,
                          imagenAlt:    item.imagenAlt,
                          atributos:    [],
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold"
                      style={{ height: 36, background: "var(--color-cq-primary)", color: "white", fontFamily: "var(--font-display)", letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: "pointer", boxShadow: "0 2px 10px rgba(29,78,216,0.2)" }}>
                      <svg viewBox="0 0 576 512" fill="currentColor" width="11" height="11">
                        <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                      </svg>
                      Agregar
                    </button>
                    <button
                      onClick={() => removeItem(item.productoId)}
                      className="flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                      style={{ width: 36, height: 36, color: "var(--color-cq-muted-2)", border: "1px solid var(--color-cq-border)", cursor: "pointer" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}