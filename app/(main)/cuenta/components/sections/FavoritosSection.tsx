// app/(main)/cuenta/components/sections/FavoritosSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/app/global/context/WishlistContext";
import { useCart } from "@/app/global/context/CartContext";

function fmt(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n) + " MXN";
}

export function FavoritosSection() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) return (
    <div className="rounded-xl p-12 text-center" style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
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
            const imgSrc = item.imagenNombre ? `/productos/${item.productoId}/${item.imagenNombre}` : null;
            return (
              <motion.div
                key={item.productoId}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
              >
                <Link href={`/producto/${item.slug}`} className="block relative"
                  style={{ aspectRatio: "1/1", background: "var(--color-cq-surface-2)", borderBottom: "1px solid var(--color-cq-border)" }}>
                  {imgSrc ? (
                    <Image src={imgSrc} alt={item.imagenAlt ?? item.titulo} fill style={{ objectFit: "contain", padding: 16 }} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fa-solid fa-image" style={{ fontSize: "2rem", color: "var(--color-cq-muted-2)" }} />
                    </div>
                  )}
                </Link>

                <div style={{ padding: "14px 16px" }}>
                  <Link href={`/producto/${item.slug}`} style={{ textDecoration: "none" }}>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-cq-text)", lineHeight: 1.3, marginBottom: 6 }}>
                      {item.titulo}
                    </p>
                  </Link>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-accent)", marginBottom: 12 }}>
                    {fmt(item.precio)}
                  </p>

                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => addItem({
                        productoId: item.productoId,
                        varianteId: item.productoId,
                        titulo: item.titulo,
                        slug: item.slug,
                        sku: `PROD-${item.productoId}`,
                        precio: item.precio,
                        cantidad: 1,
                        imagenNombre: item.imagenNombre,
                        imagenAlt: item.imagenAlt,
                        atributos: [],
                      })}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="flex-1 rounded-lg py-2.5"
                      style={{
                        background: "var(--color-cq-primary)", color: "white",
                        border: "none", cursor: "pointer",
                        fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600,
                      }}
                    >
                      Agregar al carrito
                    </motion.button>
                    <motion.button
                      onClick={() => removeItem(item.productoId)}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center rounded-lg"
                      style={{
                        width: 38, height: 38, background: "transparent",
                        border: "1px solid var(--color-cq-border)",
                        cursor: "pointer", color: "#ef4444",
                      }}
                    >
                      <i className="fa-solid fa-trash" style={{ fontSize: "0.72rem" }} />
                    </motion.button>
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