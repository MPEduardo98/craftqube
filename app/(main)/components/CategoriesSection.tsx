"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
    accent: "#1D4ED8",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <rect x="8" y="8" width="20" height="48" rx="2" fill="currentColor" opacity="0.9" />
        <rect x="36" y="8" width="20" height="48" rx="2" fill="currentColor" opacity="0.6" />
        <rect x="6" y="26" width="52" height="12" rx="2" fill="currentColor" opacity="0.3" />
        <circle cx="18" cy="18" r="3" fill="white" opacity="0.6" />
        <circle cx="18" cy="46" r="3" fill="white" opacity="0.6" />
        <circle cx="46" cy="18" r="3" fill="white" opacity="0.6" />
        <circle cx="46" cy="46" r="3" fill="white" opacity="0.6" />
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
    accent: "#2563EB",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
        <polygon points="32,8 38,20 26,20" fill="currentColor" opacity="0.8" />
        <polygon points="32,56 38,44 26,44" fill="currentColor" opacity="0.8" />
        <polygon points="8,32 20,26 20,38" fill="currentColor" opacity="0.8" />
        <polygon points="56,32 44,26 44,38" fill="currentColor" opacity="0.8" />
        <circle cx="32" cy="32" r="8" fill="currentColor" opacity="0.9" />
        <circle cx="32" cy="32" r="3" fill="white" opacity="0.6" />
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
    accent: "#3B82F6",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <path d="M12 52 L12 12 L52 12" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
        <rect x="12" y="12" width="16" height="16" rx="2" fill="currentColor" opacity="0.4" />
        <path d="M28 28 L28 52 L52 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.35" />
        <circle cx="20" cy="20" r="3" fill="white" opacity="0.6" />
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
    accent: "#1D4ED8",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
        <rect x="8" y="28" width="48" height="8" rx="2" fill="currentColor" opacity="0.65" />
        <rect x="20" y="20" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.35" />
        <circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.9" />
        <circle cx="12" cy="32" r="4" fill="currentColor" opacity="0.55" />
        <circle cx="52" cy="32" r="4" fill="currentColor" opacity="0.55" />
      </svg>
    ),
    features: ["Precisión 0.01mm", "Kits plug & play", "Soporte de ingeniería"],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CategoriesSection() {
  return (
    <section className="py-24 relative" style={{ background: "#F1F5F9" }}>
      {/* Subtle grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37, 99, 235, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
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

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={cardVariants}>
              <Link
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
                        color: "#94A3B8",
                      }}
                    >
                      {cat.label}
                    </span>
                    <h3
                      className="text-display text-xl"
                      style={{ color: "#0F172A" }}
                    >
                      {cat.title}
                    </h3>
                  </div>
                  <motion.div
                    className="w-14 h-14 flex-shrink-0"
                    style={{ color: cat.accent }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {cat.icon}
                  </motion.div>
                </div>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: "#64748B" }}
                >
                  {cat.desc}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {cat.features.map((f) => (
                    <span
                      key={f}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: "rgba(37, 99, 235, 0.07)",
                        color: "#1D4ED8",
                        border: "1px solid rgba(37, 99, 235, 0.15)",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#1D4ED8" }}>
                  <span style={{ fontFamily: "var(--font-mono)" }}>Ver productos</span>
                  <motion.span
                    className="inline-block"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    →
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}