// app/(main)/components/CategoriesSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";

interface CategoriaDB {
  id:               number;
  nombre:           string;
  slug:             string;
  descripcion:      string | null;
  /** Nombre de archivo de la imagen, ej: "perfiles.webp". Ruta: /categorias/{id}/{imagen} */
  imagen:           string | null;
  total_productos:  number;
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

  /* Genérico */
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16" style={{ color: accent }} aria-hidden="true">
      <rect x="8"  y="8"  width="28" height="28" rx="4" fill="currentColor" opacity="0.5" />
      <rect x="44" y="8"  width="28" height="28" rx="4" fill="currentColor" opacity="0.25" />
      <rect x="8"  y="44" width="28" height="28" rx="4" fill="currentColor" opacity="0.5" />
      <rect x="44" y="44" width="28" height="28" rx="4" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

/* ─── Card image con fallback ─────────────────────────────── */
function CategoryImage({
  id,
  slug,
  nombre,
  imagen,
  accent,
}: {
  id:     number;
  slug:   string;
  nombre: string;
  imagen: string | null;
  accent: string;
}) {
  const [hasError, setHasError] = useState(false);

  /* Construye la URL solo si la DB devuelve un nombre de archivo */
  const src = imagen && !hasError ? `/categorias/${id}/${imagen}` : null;

  if (!src) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)` }}
      >
        <FallbackIcon slug={slug} accent={accent} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={nombre}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      onError={() => setHasError(true)}
    />
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
      <div className="p-6 space-y-3">
        <div className="h-2.5 rounded" style={{ background: "var(--color-cq-border)", width: "25%" }} />
        <div className="h-6 rounded"   style={{ background: "var(--color-cq-border)", width: "65%" }} />
        <div className="h-3 rounded"   style={{ background: "var(--color-cq-surface-2)", width: "90%" }} />
        <div className="h-3 rounded"   style={{ background: "var(--color-cq-surface-2)", width: "60%" }} />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-24 rounded-full" style={{ background: "var(--color-cq-accent-glow)" }} />
          <div className="h-5 w-16 rounded"      style={{ background: "var(--color-cq-border)" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Variants ────────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
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
    <section
      className="py-24 relative"
      style={{ background: "var(--color-cq-bg)" }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="section-label">Catálogo</p>
            <h2
              className="text-display"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--color-cq-text)" }}
            >
              Explora por{" "}
              <span style={{ color: "var(--color-cq-accent)" }}>categoría</span>
            </h2>
          </div>
          <Link href="/catalogo" className="btn-primary self-start sm:self-auto">
            Ver catálogo completo →
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

        {/* ── Skeletons ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Grid dinámico ── */}
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
                      background:     "var(--color-cq-surface)",
                      border:         "1px solid var(--color-cq-border)",
                      textDecoration: "none",
                      transition:     "border-color 0.3s ease, transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.35)";
                      (e.currentTarget as HTMLElement).style.transform   = "translateY(-3px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-border)";
                      (e.currentTarget as HTMLElement).style.transform   = "translateY(0)";
                    }}
                  >
                    {/* ── Imagen 1:1 ── */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
                      <CategoryImage
                        id={cat.id}
                        slug={cat.slug}
                        nombre={cat.nombre}
                        imagen={cat.imagen}
                        accent={accent}
                      />

                      {/* Label flotante */}
                      <div className="absolute top-3 left-3">
                        <span style={{
                          display:        "inline-block",
                          padding:        "3px 10px",
                          borderRadius:   "99px",
                          background:     "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(8px)",
                          border:         "1px solid rgba(255,255,255,0.2)",
                          fontFamily:     "var(--font-mono)",
                          fontSize:       "0.58rem",
                          letterSpacing:  "0.1em",
                          color:          "white",
                          fontWeight:     600,
                        }}>
                          {label}
                        </span>
                      </div>

                      {/* Count badge */}
                      {cat.total_productos > 0 && (
                        <div className="absolute top-3 right-3">
                          <span style={{
                            display:        "inline-block",
                            padding:        "3px 10px",
                            borderRadius:   "99px",
                            background:     "var(--color-cq-primary)",
                            boxShadow:      "0 2px 10px rgba(29,78,216,0.35)",
                            fontFamily:     "var(--font-mono)",
                            fontSize:       "0.58rem",
                            color:          "#ffffff",
                            letterSpacing:  "0.06em",
                            fontWeight:     600,
                          }}>
                            {cat.total_productos} productos
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ── Info ── */}
                    <div className="p-6">
                      <p style={{
                        fontFamily:    "var(--font-mono)",
                        fontSize:      "0.6rem",
                        letterSpacing: "0.14em",
                        color:         accent,
                        textTransform: "uppercase",
                        marginBottom:  "6px",
                      }}>
                        {cat.total_productos > 0 ? `${cat.total_productos} productos` : "Categoría"}
                      </p>

                      <h3
                        className="text-display group-hover:text-blue-500 transition-colors"
                        style={{
                          fontSize:     "1.15rem",
                          color:        "var(--color-cq-text)",
                          marginBottom: "8px",
                        }}
                      >
                        {cat.nombre}
                      </h3>

                      {cat.descripcion && (
                        <p style={{
                          fontSize:        "0.8rem",
                          color:           "var(--color-cq-muted)",
                          lineHeight:      1.55,
                          display:         "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow:        "hidden",
                          marginBottom:    "14px",
                        }}>
                          {cat.descripcion}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span style={{
                          display:       "inline-flex",
                          alignItems:    "center",
                          gap:           "6px",
                          fontFamily:    "var(--font-mono)",
                          fontSize:      "0.65rem",
                          letterSpacing: "0.08em",
                          color:         accent,
                          fontWeight:    600,
                          textTransform: "uppercase",
                        }}>
                          Ver productos
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && categorias.length === 0 && (
          <p className="text-center py-16 text-sm" style={{ color: "var(--color-cq-muted-2)" }}>
            No hay categorías disponibles.
          </p>
        )}
      </div>
    </section>
  );
}