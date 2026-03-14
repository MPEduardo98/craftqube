// app/(main)/components/CategoriesSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";

interface CategoriaDB {
  id:              number;
  nombre:          string;
  slug:            string;
  descripcion:     string | null;
  /** Nombre de archivo. Ruta: public/categorias/{imagen} */
  imagen:          string | null;
  total_productos: number;
}

/* ─── Fallback SVG icons ──────────────────────────────────── */
function FallbackIcon({ slug, accent }: { slug: string; accent: string }) {
  const s = slug.toLowerCase();

  if (s.includes("perfil") || s.includes("aluminio") || s.includes("estructura")) {
    return (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
        <rect x="8" y="32" width="64" height="16" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.7" />
        <rect x="8" y="32" width="12" height="16" rx="2" fill="currentColor" opacity="0.25" />
        <rect x="60" y="32" width="12" height="16" rx="2" fill="currentColor" opacity="0.25" />
        <line x1="32" y1="20" x2="32" y2="60" stroke="currentColor" strokeWidth="2.5" opacity="0.5" strokeLinecap="round" />
        <line x1="48" y1="20" x2="48" y2="60" stroke="currentColor" strokeWidth="2.5" opacity="0.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (s.includes("panel") || s.includes("placa") || s.includes("monitor")) {
    return (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
        <rect x="8" y="12" width="64" height="44" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.7" />
        <rect x="16" y="20" width="48" height="28" rx="2" fill="currentColor" opacity="0.15" />
        <line x1="28" y1="64" x2="52" y2="64" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <line x1="40" y1="56" x2="40" y2="64" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
      </svg>
    );
  }
  if (s.includes("tornill") || s.includes("accesorio") || s.includes("conector")) {
    return (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
        <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.4" />
        <circle cx="40" cy="40" r="12" fill="currentColor" opacity="0.2" />
        <line x1="40" y1="12" x2="40" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="40" y1="52" x2="40" y2="68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="12" y1="40" x2="28" y2="40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <line x1="52" y1="40" x2="68" y2="40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      </svg>
    );
  }
  if (s.includes("laptop") || s.includes("tech") || s.includes("computo")) {
    return (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
        <rect x="12" y="16" width="56" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.6" />
        <rect x="20" y="24" width="40" height="20" rx="2" fill="currentColor" opacity="0.15" />
        <rect x="4" y="56" width="72" height="8" rx="4" fill="currentColor" opacity="0.25" />
        <rect x="28" y="52" width="24" height="4" rx="2" fill="currentColor" opacity="0.3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
      <rect x="8"  y="8"  width="28" height="28" rx="4" fill="currentColor" opacity="0.5" />
      <rect x="44" y="8"  width="28" height="28" rx="4" fill="currentColor" opacity="0.25" />
      <rect x="8"  y="44" width="28" height="28" rx="4" fill="currentColor" opacity="0.5" />
      <rect x="44" y="44" width="28" height="28" rx="4" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

/* ─── Helpers ─────────────────────────────────────────────── */
const ACCENTS   = ["#1D4ED8", "#2563EB", "#1E40AF", "#3B82F6", "#0EA5E9"];
const getAccent = (i: number) => ACCENTS[i % ACCENTS.length];

/* ─── Skeleton ────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
    >
      <div style={{ aspectRatio: "1 / 1", background: "var(--color-cq-surface-2)" }} />
      <div className="p-5 space-y-3">
        <div className="h-2.5 rounded" style={{ background: "var(--color-cq-border)", width: "25%" }} />
        <div className="h-6 rounded"   style={{ background: "var(--color-cq-border)", width: "65%" }} />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-24 rounded-full" style={{ background: "var(--color-cq-accent-glow)" }} />
          <div className="h-5 w-16 rounded"      style={{ background: "var(--color-cq-border)" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── CategoryCard ────────────────────────────────────────── */
function CategoryCard({ cat, index }: { cat: CategoriaDB; index: number }) {
  const [hovered,  setHovered]  = useState(false);
  const [imgError, setImgError] = useState(false);

  const accent = getAccent(index);
  const label  = `CAT·${String(index + 1).padStart(2, "0")}`;
  const href   = `/catalogo?categoria=${cat.slug}`;
  const src    = cat.imagen && !imgError ? `/categorias/${cat.imagen}` : null;

  return (
    <Link
      href={href}
      style={{
        display:        "block",
        borderRadius:   "1rem",
        overflow:       "hidden",
        background:     "var(--color-cq-surface)",
        border:         `1px solid ${hovered ? "rgba(37,99,235,0.35)" : "var(--color-cq-border)"}`,
        textDecoration: "none",
        transform:      hovered ? "translateY(-3px)" : "translateY(0)",
        transition:     "border-color 0.3s ease, transform 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Imagen 1:1 ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1" }}>

        {src ? (
          <motion.div
            className="absolute inset-0"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: "transform" }}
          >
            <Image
              src={src}
              alt={cat.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImgError(true)}
            />
          </motion.div>
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)` }}
          >
            <FallbackIcon slug={cat.slug} accent={accent} />
          </div>
        )}

        {/* Label flotante */}
        <div className="absolute top-3 left-3 z-10">
          <span style={{
            display:        "inline-block",
            padding:        "3px 10px",
            borderRadius:   "99px",
            background:     "rgba(0,0,0,0.35)",
            backdropFilter: "blur(8px)",
            border:         "1px solid rgba(255,255,255,0.15)",
            fontFamily:     "var(--font-mono)",
            fontSize:       "0.58rem",
            letterSpacing:  "0.1em",
            color:          "white",
            textTransform:  "uppercase",
          }}>
            {label}
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-5">
        <p style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "0.6rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color:         accent,
          marginBottom:  6,
        }}>
          {cat.total_productos} producto{cat.total_productos !== 1 ? "s" : ""}
        </p>
        <h3 style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "1.1rem",
          fontWeight:    700,
          color:         "var(--color-cq-text)",
          letterSpacing: "-0.01em",
          marginBottom:  8,
        }}>
          {cat.nombre}
        </h3>
        {cat.descripcion && (
          <p style={{
            fontFamily:      "var(--font-body)",
            fontSize:        "0.8rem",
            color:           "var(--color-cq-muted)",
            lineHeight:      1.65,
            display:         "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow:        "hidden",
          }}>
            {cat.descripcion}
          </p>
        )}
        <div className="flex items-center justify-between mt-4">
          <span style={{
            display:       "inline-flex",
            alignItems:    "center",
            padding:       "4px 12px",
            borderRadius:  "99px",
            background:    `${accent}14`,
            border:        `1px solid ${accent}30`,
            fontFamily:    "var(--font-mono)",
            fontSize:      "0.62rem",
            letterSpacing: "0.08em",
            color:         accent,
            textTransform: "uppercase",
          }}>
            Ver categoría
          </span>
          <motion.svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            width="16" height="16" style={{ color: "var(--color-cq-muted-2)" }}
            animate={{ x: hovered ? 4 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </div>
      </div>
    </Link>
  );
}

/* ─── Variants ────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ─── Componente principal ────────────────────────────────── */
export function CategoriesSection() {
  const [categorias, setCategorias] = useState<CategoriaDB[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

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
    <section className="py-24 relative" style={{ background: "var(--color-cq-bg)" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-12">
          <p className="section-label">Categorías</p>
          <h2
            className="text-display"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-cq-text)" }}
          >
            Explora nuestro{" "}
            <span style={{ color: "var(--color-cq-accent)" }}>catálogo</span>
          </h2>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8"  x2="12"    y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* ── Skeletons ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && categorias.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {categorias.map((cat, index) => (
              <motion.div key={cat.id} variants={cardVariants}>
                <CategoryCard cat={cat} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}