// app/(main)/cuenta/favoritos/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/app/global/context/WishlistContext";
import { useCart } from "@/app/global/context/CartContext";

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n) + " MXN";
}

export default function FavoritosPage() {
  const { items, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      productoId: item.productoId,
      varianteId: item.productoId, // Usamos productoId como varianteId por defecto
      titulo: item.titulo,
      slug: item.slug,
      sku: `PROD-${item.productoId}`,
      precio: item.precio,
      cantidad: 1,
      imagenNombre: item.imagenNombre,
      imagenAlt: item.imagenAlt,
      atributos: [],
    });
  };

  if (items.length === 0) {
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
          <i className="fa-solid fa-heart" style={{ fontSize: "2rem", color: "var(--color-cq-muted-2)" }} />
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
          No tienes favoritos
        </h3>
        <p
          className="mb-6"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "var(--color-cq-muted)",
          }}
        >
          Guarda productos que te gusten para encontrarlos fácilmente
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
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-cq-muted)",
          }}
        >
          {items.length} {items.length === 1 ? "producto" : "productos"}
        </p>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {items.map((item, i) => {
            const imageSrc = item.imagenNombre
              ? `/productos/${item.productoId}/${item.imagenNombre}`
              : null;

            return (
              <motion.div
                key={item.productoId}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl overflow-hidden group"
                style={{
                  background: "var(--color-cq-surface)",
                  border: "1px solid var(--color-cq-border)",
                }}
              >
                {/* Imagen */}
                <Link
                  href={`/producto/${item.slug}`}
                  className="relative block overflow-hidden"
                  style={{
                    aspectRatio: "1 / 1",
                    background: "var(--color-cq-surface-2)",
                    borderBottom: "1px solid var(--color-cq-border)",
                  }}
                >
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={item.imagenAlt ?? item.titulo}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i
                        className="fa-solid fa-box"
                        style={{ fontSize: "3rem", color: "var(--color-cq-border)" }}
                      />
                    </div>
                  )}

                  {/* Botón eliminar */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(item.productoId);
                    }}
                    className="absolute top-2 right-2 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      width: 32,
                      height: 32,
                      background: "rgba(0,0,0,0.7)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "white",
                    }}
                  >
                    <i className="fa-solid fa-xmark" style={{ fontSize: "0.85rem" }} />
                  </button>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link
                    href={`/producto/${item.slug}`}
                    className="line-clamp-2 mb-3 block hover:text-blue-500 transition-colors"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "var(--color-cq-text)",
                      textDecoration: "none",
                      minHeight: "2.6em",
                      lineHeight: 1.45,
                    }}
                  >
                    {item.titulo}
                  </Link>

                  <p
                    className="mb-4"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "var(--color-cq-text)",
                    }}
                  >
                    {formatPrice(item.precio)}
                  </p>

                  {/* Botón agregar */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center justify-center gap-2 rounded-lg w-full"
                    style={{
                      height: 40,
                      background: "var(--color-cq-primary)",
                      color: "white",
                      border: "none",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-cart-plus" style={{ fontSize: "0.8rem" }} />
                    Agregar al carrito
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}