"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";

interface ProductoDB {
  id: number;
  titulo: string;
  descripcion_corta: string | null;
  slug: string;
  categoria: string | null;
  categoria_slug: string | null;
  marca: string | null;
  sku: string | null;
  precio: number | null;
  precio_original: number | null;
  stock: number | null;
  imagen_url: string | null;
  imagen_alt: string | null;
}

function FallbackIllustration({ categoria }: { categoria: string | null }) {
  const cat = (categoria ?? "").toLowerCase();
  const gradId = `grad-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {cat.includes("perfil") ? (
        <>
          <rect x="45" y="15" width="28" height="130" rx="3" fill={`url(#${gradId})`} />
          <rect x="83" y="15" width="28" height="130" rx="3" fill={`url(#${gradId})`} opacity="0.7" />
          <rect x="35" y="60" width="90" height="22" rx="3" fill={`url(#${gradId})`} opacity="0.3" />
          <rect x="35" y="90" width="90" height="22" rx="3" fill={`url(#${gradId})`} opacity="0.2" />
        </>
      ) : cat.includes("accesorio") ? (
        <>
          <path d="M80 130 L80 50 L130 50" stroke="#2563EB" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.6" />
          <rect x="55" y="28" width="30" height="30" rx="3" fill={`url(#${gradId})`} opacity="0.5" />
          <circle cx="80" cy="50" r="5" fill="#2563EB" opacity="0.7" />
          <circle cx="80" cy="130" r="5" fill="#2563EB" opacity="0.7" />
          <circle cx="130" cy="50" r="5" fill="#2563EB" opacity="0.7" />
        </>
      ) : (
        <>
          <circle cx="80" cy="80" r="42" fill="none" stroke="#2563EB" strokeWidth="2" opacity="0.25" />
          <polygon points="80,22 93,56 68,56" fill="#2563EB" opacity="0.7" />
          <polygon points="80,138 93,104 68,104" fill="#2563EB" opacity="0.7" />
          <polygon points="22,80 52,67 52,93" fill="#2563EB" opacity="0.7" />
          <polygon points="138,80 108,67 108,93" fill="#2563EB" opacity="0.7" />
          <circle cx="80" cy="80" r="18" fill={`url(#${gradId})`} opacity="0.85" />
        </>
      )}
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden animate-pulse"
      style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
    >
      <div className="aspect-square" style={{ background: "#F1F5F9" }} />
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="h-2.5 rounded" style={{ background: "#E2E8F0", width: "60%" }} />
        <div className="h-4 rounded" style={{ background: "#E2E8F0", width: "85%" }} />
        <div className="flex gap-1">
          <div className="h-5 w-14 rounded-md" style={{ background: "#EFF6FF" }} />
        </div>
        <div className="h-3 rounded mt-2" style={{ background: "#E2E8F0", width: "40%" }} />
        <div className="mt-2 pt-2 border-t" style={{ borderColor: "#F1F5F9" }}>
          <div className="h-5 rounded mb-2" style={{ background: "#EFF6FF", width: "50%" }} />
          <div className="h-8 rounded-lg" style={{ background: "#DBEAFE" }} />
        </div>
      </div>
    </div>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<ProductoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/productos")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setProducts(json.data);
        } else {
          setError("No se pudieron cargar los productos.");
        }
      })
      .catch(() => setError("Error de conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 relative" style={{ background: "#FFFFFF" }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="section-label">Productos destacados</p>
            <h2
              className="text-display"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#0F172A" }}
            >
              Los más{" "}
              <span style={{ color: "#1D4ED8" }}>solicitados</span>
            </h2>
          </div>
          <Link href="/catalogo" className="btn-ghost self-start sm:self-auto">
            Ver todos →
          </Link>
        </div>

        {/* Error */}
        {error && !loading && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-8"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid — 5 por fila en desktop */}
        {!loading && products.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {products.map((product) => {
              const tieneStock = (product.stock ?? 0) > 0;
              const tieneDescuento =
                product.precio_original &&
                product.precio_original > 0 &&
                product.precio_original > (product.precio ?? 0);

              return (
                <motion.article
                  key={product.id}
                  variants={cardVariants}
                  className="group flex flex-col rounded-xl overflow-hidden"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                  whileHover={{
                    y: -4,
                    boxShadow: "0 8px 28px rgba(29,78,216,0.1)",
                    borderColor: "rgba(37,99,235,0.3)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Imagen */}
                  <Link
                    href={`/productos/${product.slug}`}
                    className="relative w-full aspect-square flex items-center justify-center p-4"
                    style={{
                      background: "linear-gradient(135deg, #F0F7FF 0%, #EFF6FF 100%)",
                      borderBottom: "1px solid #E2E8F0",
                    }}
                  >
                    {product.imagen_url ? (
                      <Image
                        src={product.imagen_url}
                        alt={product.imagen_alt ?? product.titulo}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full max-w-[90px] max-h-[90px]">
                        <FallbackIllustration categoria={product.categoria} />
                      </div>
                    )}

                    {/* Stock dot */}
                    <div className="absolute top-2 right-2">
                      <span
                        className="w-2 h-2 rounded-full block"
                        title={tieneStock ? "En stock" : "Sin stock"}
                        style={{
                          background: tieneStock ? "#22c55e" : "#f59e0b",
                          boxShadow: tieneStock
                            ? "0 0 6px rgba(34,197,94,0.5)"
                            : "0 0 6px rgba(245,158,11,0.5)",
                        }}
                      />
                    </div>

                    {/* Descuento badge */}
                    {tieneDescuento && (
                      <div className="absolute top-2 left-2">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                          style={{
                            background: "#DC2626",
                            color: "white",
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6rem",
                          }}
                        >
                          -{Math.round((1 - (product.precio ?? 0) / product.precio_original!) * 100)}%
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Contenido */}
                  <div className="flex flex-col flex-1 p-3.5 gap-2">
                    {product.sku && (
                      <span
                        style={{
                          fontFamily: "var(--font-jetbrains, monospace)",
                          color: "#94A3B8",
                          fontSize: "0.62rem",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {product.sku}
                      </span>
                    )}

                    <Link href={`/productos/${product.slug}`}>
                      <h3
                        className="text-sm font-bold leading-snug hover:text-blue-600 transition-colors"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "#0F172A",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {product.titulo}
                      </h3>
                    </Link>

                    {product.categoria && (
                      <span
                        className="self-start text-xs px-2 py-0.5 rounded-md"
                        style={{
                          fontFamily: "var(--font-jetbrains, monospace)",
                          fontSize: "0.6rem",
                          background: "rgba(37,99,235,0.07)",
                          color: "#1D4ED8",
                          border: "1px solid rgba(37,99,235,0.12)",
                        }}
                      >
                        {product.categoria}
                      </span>
                    )}

                    {product.descripcion_corta && (
                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: "#64748B" }}
                      >
                        {product.descripcion_corta}
                      </p>
                    )}

                    <div className="flex-1" />

                    {/* Precio + CTA */}
                    <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid #F1F5F9" }}>
                      {product.precio !== null ? (
                        <div className="flex flex-col">
                          {tieneDescuento && (
                            <span
                              className="text-xs line-through"
                              style={{
                                fontFamily: "var(--font-jetbrains, monospace)",
                                color: "#94A3B8",
                              }}
                            >
                              ${product.precio_original!.toLocaleString("es-MX")}
                            </span>
                          )}
                          <div>
                            <span
                              className="font-bold"
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "1.1rem",
                                color: "#1D4ED8",
                              }}
                            >
                              ${product.precio.toLocaleString("es-MX")}
                            </span>
                            <span
                              className="text-xs ml-1"
                              style={{
                                fontFamily: "var(--font-jetbrains, monospace)",
                                color: "#94A3B8",
                              }}
                            >
                              MXN
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
                          Precio a consultar
                        </span>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        disabled={!tieneStock}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold"
                        style={{
                          background: tieneStock ? "#1D4ED8" : "#E2E8F0",
                          color: tieneStock ? "white" : "#94A3B8",
                          fontFamily: "var(--font-display)",
                          letterSpacing: "0.06em",
                          border: "none",
                          cursor: tieneStock ? "pointer" : "not-allowed",
                        }}
                        aria-label={`Agregar ${product.titulo} al carrito`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        {tieneStock ? "Agregar" : "Sin stock"}
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div
            className="text-center py-20 rounded-xl"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            <p className="text-sm" style={{ color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
              No hay productos disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}