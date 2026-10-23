// app/(main)/components/FeaturedProductsSection.tsx
"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ProductCard }        from "@/features/products/components/ProductCard";
import type { Producto } from "@mpeduardo98/commerce-core/catalogo";

const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export function FeaturedProductsSection({ productos: products }: { productos: Producto[] }) {

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

        {/* ── Grid productos — 4 columnas ── */}
        {products.length > 0 && (
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
        {products.length === 0 && (
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
