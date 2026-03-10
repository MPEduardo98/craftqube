// app/(main)/components/FeaturedProductsSection.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ProductCard }        from "@/app/global/components/products/ProductCard";
import { ProductCardSkeleton } from "@/app/global/components/products/ProductCardSkeleton";
import type { Producto } from "@/app/global/types/product";

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProducts(json.data);
        else setError("No se pudieron cargar los productos.");
      })
      .catch(() => setError("Error de conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      className="py-24 relative"
      style={{ background: "var(--color-cq-surface)" }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="section-label">Productos destacados</p>
            <h2
              className="text-display"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-cq-text)" }}
            >
              Los más{" "}
              <span style={{ color: "var(--color-cq-accent)" }}>solicitados</span>
            </h2>
          </div>
          <Link href="/catalogo" className="btn-ghost self-start sm:self-auto">
            Ver todos →
          </Link>
        </div>

        {/* ── Error ── */}
        {error && !loading && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-8"
            style={{
              background: "rgba(220,38,38,0.08)",
              border:     "1px solid rgba(220,38,38,0.2)",
              color:      "#DC2626",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8"  x2="12"    y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* ── Skeletons — 4 columnas ── */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Grid productos — 4 columnas ── */}
        {!loading && products.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={cardVariants} style={{ height: "100%" }}>
                <ProductCard
                  producto={product}
                  imageSizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && products.length === 0 && (
          <p
            className="text-center py-16 text-sm"
            style={{ color: "var(--color-cq-muted-2)" }}
          >
            No hay productos disponibles en este momento.
          </p>
        )}
      </div>
    </section>
  );
}