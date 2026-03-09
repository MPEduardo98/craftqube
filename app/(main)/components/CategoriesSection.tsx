// app/(main)/components/CategoriesSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";

/* ─── Types ───────────────────────────────────────────────── */
interface CategoriaDB {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  parent_id: number | null;
  total_productos: number;
}

/* ─── Fallback SVG por slug ───────────────────────────────── */
function FallbackIcon({ slug, accent }: { slug: string; accent: string }) {
  const s = slug.toLowerCase();

  if (s.includes("perfil") || s.includes("industrial") || s.includes("aluminio")) {
    return (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
        <rect x="10" y="8" width="22" height="64" rx="3" fill="currentColor" opacity="0.85" />
        <rect x="40" y="8" width="22" height="64" rx="3" fill="currentColor" opacity="0.5" />
        <rect x="6" y="32" width="68" height="16" rx="3" fill="currentColor" opacity="0.2" />
        <circle cx="21" cy="20" r="4" fill="white" opacity="0.5" />
        <circle cx="21" cy="60" r="4" fill="white" opacity="0.5" />
        <circle cx="51" cy="20" r="4" fill="white" opacity="0.5" />
        <circle cx="51" cy="60" r="4" fill="white" opacity="0.5" />
      </svg>
    );
  }
  if (s.includes("laptop") || s.includes("tech") || s.includes("computadora")) {
    return (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
        <rect x="10" y="12" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.8" />
        <rect x="18" y="20" width="44" height="24" rx="2" fill="currentColor" opacity="0.18" />
        <rect x="5" y="56" width="70" height="6" rx="3" fill="currentColor" opacity="0.3" />
        <rect x="28" y="52" width="24" height="4" rx="2" fill="currentColor" opacity="0.45" />
      </svg>
    );
  }
  if (s.includes("accesorio") || s.includes("tornillo") || s.includes("escuadra")) {
    return (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
        <circle cx="40" cy="40" r="24" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
        <polygon points="40,10 47,24 33,24" fill="currentColor" opacity="0.85" />
        <polygon points="40,70 47,56 33,56" fill="currentColor" opacity="0.85" />
        <polygon points="10,40 24,33 24,47" fill="currentColor" opacity="0.85" />
        <polygon points="70,40 56,33 56,47" fill="currentColor" opacity="0.85" />
        <circle cx="40" cy="40" r="10" fill="currentColor" opacity="0.9" />
        <circle cx="40" cy="40" r="4" fill="white" opacity="0.6" />
      </svg>
    );
  }
  // Default
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
      <rect x="8" y="8" width="28" height="28" rx="4" fill="currentColor" opacity="0.8" />
      <rect x="44" y="8" width="28" height="28" rx="4" fill="currentColor" opacity="0.5" />
      <rect x="8" y="44" width="28" height="28" rx="4" fill="currentColor" opacity="0.5" />
      <rect x="44" y="44" width="28" height="28" rx="4" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

/* ─── Card image con fallback ─────────────────────────────── */
function CategoryImage({ slug, nombre, accent }: { slug: string; nombre: string; accent: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${accent}10 0%, ${accent}06 100%)`,
        }}
      >
        <FallbackIcon slug={slug} accent={accent} />
      </div>
    );
  }

  return (
    <Image
      src={`/imagenes/categorias/${slug}.webp`}
      alt={nombre}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, 50vw"
      onError={() => setHasError(true)}
    />
  );
}

/* ─── Paleta de accents ───────────────────────────────────── */
const ACCENTS = ["#1D4ED8", "#2563EB", "#1E40AF", "#3B82F6", "#0EA5E9"];
const getAccent = (i: number) => ACCENTS[i % ACCENTS.length];

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
    >
      <div style={{ aspectRatio: "1 / 1", background: "#F1F5F9" }} />
      <div className="p-6 space-y-3">
        <div className="h-2.5 rounded" style={{ background: "#E2E8F0", width: "25%" }} />
        <div className="h-6 rounded" style={{ background: "#E2E8F0", width: "65%" }} />
        <div className="h-3 rounded" style={{ background: "#F1F5F9", width: "90%" }} />
        <div className="h-3 rounded" style={{ background: "#F1F5F9", width: "60%" }} />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-24 rounded-full" style={{ background: "#EFF6FF" }} />
          <div className="h-5 w-16 rounded" style={{ background: "#E2E8F0" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Variants ────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

/* ─── Main ────────────────────────────────────────────────── */
export function CategoriesSection() {
  const [categorias, setCategorias] = useState<CategoriaDB[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCategorias(json.data);
        else setError("No se pudieron cargar las categorías.");
      })
      .catch(() => setError("Error de conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 relative" style={{ background: "#F1F5F9" }}>
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="section-label">Catálogo</p>
            <h2
              className="text-display"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#0F172A" }}
            >
              Categorías de{" "}
              <span style={{ color: "#1D4ED8" }}>productos</span>
            </h2>
          </div>
          <Link href="/catalogo" className="btn-ghost self-start sm:self-auto">
            Ver catálogo completo →
          </Link>
        </div>

        {/* Error */}
        {error && !loading && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-10"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid dinámico */}
        {!loading && categorias.length > 0 && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {categorias.map((cat, index) => {
              const accent = getAccent(index);
              const label  = `CAT·${String(index + 1).padStart(2, "0")}`;
              const href   = `/catalogo?categoria=${cat.slug}`;

              return (
                <motion.div key={cat.id} variants={cardVariants}>
                  <Link
                    href={href}
                    className="group block rounded-2xl overflow-hidden"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      textDecoration: "none",
                      transition: "border-color 0.3s ease, transform 0.3s ease",
                    }}
                  >
                    {/* ── Imagen 1:1 ── */}
                    <div
                      className="relative overflow-hidden"
                      style={{ aspectRatio: "1 / 1" }}
                    >
                      <CategoryImage slug={cat.slug} nombre={cat.nombre} accent={accent} />

                      {/* Overlay gradiente para legibilidad */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.10) 50%, transparent 100%)",
                        }}
                      />

                      {/* Label flotante sobre imagen */}
                      <div className="absolute top-3 left-3">
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "99px",
                            background: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,0.25)",
                            color: "white",
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.62rem",
                            fontWeight: 600,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                          }}
                        >
                          {label}
                        </span>
                      </div>

                      {/* Conteo de productos sobre imagen */}
                      <div className="absolute bottom-3 right-3">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "4px 10px",
                            borderRadius: "99px",
                            background: `${accent}CC`,
                            backdropFilter: "blur(6px)",
                            color: "white",
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.7)",
                              display: "inline-block",
                            }}
                          />
                          {cat.total_productos > 0
                            ? `${cat.total_productos} producto${cat.total_productos !== 1 ? "s" : ""}`
                            : "Ver productos"}
                        </span>
                      </div>
                    </div>

                    {/* ── Info ── */}
                    <div className="p-5">
                      <h3
                        className="text-display mb-2"
                        style={{
                          fontSize: "1.15rem",
                          color: "#0F172A",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {cat.nombre}
                      </h3>

                      <p
                        className="text-sm leading-relaxed mb-4 line-clamp-2"
                        style={{ color: "#64748B", minHeight: "2.6rem" }}
                      >
                        {cat.descripcion ??
                          `Explora nuestra selección de ${cat.nombre.toLowerCase()} con la mejor relación calidad‑precio.`}
                      </p>

                      {/* Footer */}
                      <div
                        className="flex items-center justify-between pt-4"
                        style={{ borderTop: "1px solid #F1F5F9" }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.7rem",
                            fontFamily: "var(--font-mono, monospace)",
                            color: "#94A3B8",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: accent,
                              display: "inline-block",
                            }}
                          />
                          {cat.slug}
                        </span>

                        <motion.span
                          className="flex items-center gap-1 text-sm font-semibold"
                          style={{ color: accent }}
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          Explorar
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="transition-transform duration-200 group-hover:translate-x-1"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </motion.span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty */}
        {!loading && !error && categorias.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              No hay categorías disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}