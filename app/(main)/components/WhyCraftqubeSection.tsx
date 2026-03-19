// app/(main)/components/WhyCraftqubeSection.tsx
"use client";

import { motion, type Variants } from "framer-motion";

const reasons = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Catálogo Completo",
    desc: "Más de 2,500 SKUs disponibles en stock. Perfiles serie 20, 30, 40, 45 y 80, tornillería, escuadras y accesorios de instalación.",
    metric: "+2,500 SKUs",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Entrega Rápida",
    desc: "Envíos en 24-48h a toda la República. Centro de distribución estratégico con cobertura nacional en los 32 estados.",
    metric: "24-48h",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9 12l2 2 4-4" />
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
    title: "Calidad Certificada",
    desc: "Productos certificados ISO 9001:2015. Aluminio 6063-T5 de alta resistencia con tolerancias industriales estrictas.",
    metric: "ISO 9001",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Asesoría Técnica",
    desc: "Equipo de ingenieros especializados para ayudarte a seleccionar los componentes correctos y optimizar tu diseño.",
    metric: "Soporte 24/7",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Plataforma Digital",
    desc: "Catálogo online completo, cotizador inteligente, seguimiento de pedidos y descarga de CAD/planos técnicos.",
    metric: "100% digital",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: "Precios Competitivos",
    desc: "Volúmenes desde 1 pieza hasta proyectos industriales. Descuentos por volumen y programas de cliente frecuente.",
    metric: "Desde 1 pza",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function WhyCraftqubeSection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: "var(--color-cq-surface)" }}
    >
      {/* Top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.2), transparent)",
        }}
      />

      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label justify-center">¿Por qué Craftqube?</p>
          <h2
            className="text-display mx-auto"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "var(--color-cq-text)",
              maxWidth: "600px",
            }}
          >
            La diferencia está en los{" "}
            <span style={{ color: "var(--color-cq-accent)" }}>detalles</span>
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "var(--color-cq-muted)" }}
          >
            No solo vendemos perfiles. Somos su socio tecnológico para proyectos
            de ingeniería de precisión.
          </p>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {reasons.map((r) => (
            <motion.div
              key={r.title}
              variants={itemVariants}
              className="group relative p-6 rounded-xl cq-reason-card"
              style={{
                background: "var(--color-cq-surface-2)",
              }}
              whileHover={{ y: -4 }}
            >
              {/* Icon + metric */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "var(--color-cq-accent-glow)",
                    color: "var(--color-cq-accent)",
                  }}
                >
                  {r.icon}
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "var(--color-cq-accent-glow)",
                    color: "var(--color-cq-accent)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.metric}
                </span>
              </div>

              <h3
                className="text-base font-bold mb-2"
                style={{
                  color: "var(--color-cq-text)",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.01em",
                }}
              >
                {r.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-cq-muted)" }}>
                {r.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}