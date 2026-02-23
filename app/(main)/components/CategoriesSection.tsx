import Link from "next/link";
import type { ReactNode } from "react";

interface Category {
  id: string;
  label: string;
  title: string;
  desc: string;
  href: string;
  accent: string;
  icon: ReactNode;
  features: string[];
}

const categories: Category[] = [
  {
    id: "perfiles",
    label: "CAT·01",
    title: "Perfiles Estructurales",
    desc: "Serie 20 · 30 · 40 · 45 · 80mm. Aluminio 6063-T5. Compatible con sistemas europeos.",
    href: "/productos/perfiles",
    accent: "#2d6be4",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <rect x="8" y="8" width="20" height="48" rx="2" fill="currentColor" opacity="0.9" />
        <rect x="36" y="8" width="20" height="48" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="6" y="26" width="52" height="12" rx="2" fill="currentColor" opacity="0.4" />
        <circle cx="18" cy="18" r="3" fill="white" opacity="0.4" />
        <circle cx="18" cy="46" r="3" fill="white" opacity="0.4" />
        <circle cx="46" cy="18" r="3" fill="white" opacity="0.4" />
        <circle cx="46" cy="46" r="3" fill="white" opacity="0.4" />
      </svg>
    ),
    features: ["6063-T5 Aleación", "Anodizado natural", "Tolerancia ±0.1mm"],
  },
  {
    id: "tornilleria",
    label: "CAT·02",
    title: "Tornillería Especializada",
    desc: "T-nuts, cabeza martillo, hexagonal, tornillos de fijación. Acero inoxidable 304.",
    href: "/productos/tornilleria",
    accent: "#00d4ff",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3" />
        <polygon points="32,8 38,20 26,20" fill="currentColor" opacity="0.8" />
        <polygon points="32,56 38,44 26,44" fill="currentColor" opacity="0.8" />
        <polygon points="8,32 20,26 20,38" fill="currentColor" opacity="0.8" />
        <polygon points="56,32 44,26 44,38" fill="currentColor" opacity="0.8" />
        <circle cx="32" cy="32" r="8" fill="currentColor" opacity="0.9" />
        <circle cx="32" cy="32" r="3" fill="white" opacity="0.5" />
      </svg>
    ),
    features: ["Acero inox 304", "Zinc-níquel coating", "Métricas DIN/ISO"],
  },
  {
    id: "escuadras",
    label: "CAT·03",
    title: "Escuadras & Brackets",
    desc: "Internas, externas, de esquina. Fundición de aluminio de alta resistencia.",
    href: "/productos/escuadras",
    accent: "#4d8ef5",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <path d="M12 52 L12 12 L52 12" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
        <rect x="12" y="12" width="16" height="16" rx="2" fill="currentColor" opacity="0.5" />
        <path d="M28 28 L28 52 L52 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />
        <circle cx="20" cy="20" r="3" fill="white" opacity="0.5" />
      </svg>
    ),
    features: ["Fundición Al-380", "Pre-taladradas", "Compatibilidad universal"],
  },
  {
    id: "automatizacion",
    label: "CAT·04",
    title: "Automatización Industrial",
    desc: "Guías lineales, husillos de bola, estructuras CNC. Kits completos para proyectos.",
    href: "/automatizacion",
    accent: "#1e4db7",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <rect x="8" y="28" width="48" height="8" rx="2" fill="currentColor" opacity="0.7" />
        <rect x="20" y="20" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
        <circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.9" />
        <circle cx="12" cy="32" r="4" fill="currentColor" opacity="0.6" />
        <circle cx="52" cy="32" r="4" fill="currentColor" opacity="0.6" />
      </svg>
    ),
    features: ["Precisión 0.01mm", "Kits plug & play", "Soporte de ingeniería"],
  },
];

export function CategoriesSection() {
  return (
    <section className="py-24 relative" style={{ background: "var(--color-cq-950)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="section-label">Catálogo</p>
            <h2
              className="text-display"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "white" }}
            >
              Categorías de{" "}
              <span style={{ color: "var(--color-cq-accent)" }}>productos</span>
            </h2>
          </div>
          <Link href="/catalogo" className="btn-ghost self-start sm:self-auto">
            Ver catálogo completo →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group card-surface p-8 transition-all duration-300 block"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span
                    className="text-xs tracking-widest block mb-3"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-cq-steel-500)",
                    }}
                  >
                    {cat.label}
                  </span>
                  <h3
                    className="text-display text-xl"
                    style={{ color: "white" }}
                  >
                    {cat.title}
                  </h3>
                </div>
                <div
                  className="w-14 h-14 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: cat.accent }}
                >
                  {cat.icon}
                </div>
              </div>

              {/* Description */}
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "var(--color-cq-steel-400)" }}
              >
                {cat.desc}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {cat.features.map((feat) => (
                  <span
                    key={feat}
                    className="text-xs px-3 py-1"
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: `${cat.accent}20`,
                      color: cat.accent,
                      border: `1px solid ${cat.accent}40`,
                      borderRadius: "2px",
                    }}
                  >
                    {feat}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div
                className="flex items-center gap-2 text-sm font-semibold transition-all duration-200 group-hover:gap-4"
                style={{ color: cat.accent }}
              >
                Explorar categoría
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, ${cat.accent}, transparent)`,
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}