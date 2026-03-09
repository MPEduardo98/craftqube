"use client";

import { motion } from "framer-motion";

const reasons = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: "Calidad Certificada ISO",
    desc: "Todos nuestros perfiles cumplen con la norma ISO 9001:2015. Trazabilidad completa de material y procesos.",
    metric: "ISO 9001",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Entrega en 48 Horas",
    desc: "Stock permanente de más de 2,500 SKUs. Procesamos y enviamos el mismo día para pedidos antes de las 2 PM.",
    metric: "48h max",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Soporte de Ingeniería",
    desc: "Equipo de ingenieros mecánicos disponibles para asesoría técnica gratuita en selección de perfiles y diseño de estructuras.",
    metric: "Ing. + Soporte",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Catálogo Digital",
    desc: "Plataforma online con fichas técnicas, modelos CAD, simulador de estructuras y cotizador instantáneo.",
    metric: "100% Digital",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Cobertura Nacional",
    desc: "Oficinas en CDMX, Monterrey y Guadalajara. Red de distribución en 32 estados.",
    metric: "32 estados",
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function WhyCraftqubeSection() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "#FFFFFF" }}>
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
              color: "#0F172A",
              maxWidth: "600px",
            }}
          >
            La diferencia está en los{" "}
            <span style={{ color: "#1D4ED8" }}>detalles</span>
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "#64748B" }}
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
              className="group relative p-6 rounded-xl"
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                transition: "all 0.2s ease",
              }}
              whileHover={{
                y: -4,
                boxShadow: "0 8px 32px rgba(29, 78, 216, 0.1)",
                borderColor: "rgba(37, 99, 235, 0.25)",
              }}
            >
              {/* Icon + metric */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(37, 99, 235, 0.08)",
                    color: "#1D4ED8",
                  }}
                >
                  {r.icon}
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(37, 99, 235, 0.08)",
                    color: "#1D4ED8",
                    fontFamily: "var(--font-mono)",
                    border: "1px solid rgba(37, 99, 235, 0.15)",
                  }}
                >
                  {r.metric}
                </span>
              </div>

              <h3
                className="text-base font-bold mb-2"
                style={{ color: "#0F172A", fontFamily: "var(--font-display)", letterSpacing: "0.01em" }}
              >
                {r.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
                {r.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}