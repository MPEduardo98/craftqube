// app/(main)/nosotros/components/NosotrosValores.tsx
"use client";

import { motion } from "framer-motion";

const valores = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: "Calidad",
    text: "Productos confiables y un servicio que supera expectativas.",
    color: "var(--color-cq-accent-dim)",
    rawColor: "#1D4ED8",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8M12 8l4 4-4 4" />
      </svg>
    ),
    title: "Accesibilidad",
    text: "Soluciones al alcance de cualquier proyecto o cliente.",
    color: "var(--color-cq-accent)",
    rawColor: "#2563EB",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
    title: "Innovación",
    text: "Creatividad y adaptación a las nuevas necesidades del mercado.",
    color: "#0EA5E9",
    rawColor: "#0EA5E9",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Compromiso",
    text: "Asesoría y soporte en cada etapa de tu proyecto.",
    color: "var(--color-cq-blue-400)",
    rawColor: "#3B82F6",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Responsabilidad",
    text: "Integridad y transparencia en cada decisión que tomamos.",
    color: "#6366F1",
    rawColor: "#6366F1",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const card = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function NosotrosValores() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background: "var(--color-cq-bg)",
        transition: "background-color 0.35s ease",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label justify-center">Lo que nos define</p>
          <h2
            className="text-display"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              color: "var(--color-cq-text)",
            }}
          >
            Nuestros{" "}
            <span style={{ color: "var(--color-cq-accent)" }}>valores</span>
          </h2>
        </div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {valores.map((v) => (
            <motion.div
              key={v.title}
              variants={card}
              className="group rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "var(--color-cq-surface)",
                border: "1px solid var(--color-cq-border)",
                boxShadow: "var(--shadow-card)",
                transition:
                  "background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.2s ease, transform 0.2s ease",
              }}
              whileHover={{
                y: -5,
                boxShadow: `0 10px 36px ${v.rawColor}18`,
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Icon container */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${v.rawColor}12`,
                  color: v.color,
                  transition: "background 0.2s",
                }}
              >
                {v.icon}
              </div>

              {/* Title */}
              <h3
                className="font-bold"
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  color: "var(--color-cq-text)",
                }}
              >
                {v.title}
              </h3>

              {/* Body */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-cq-muted)" }}
              >
                {v.text}
              </p>

              {/* Bottom color accent */}
              <div
                className="mt-auto"
                style={{
                  height: "2px",
                  borderRadius: "999px",
                  background: `linear-gradient(90deg, ${v.rawColor}, transparent)`,
                  opacity: 0.4,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}