// app/(main)/nosotros/components/NosotrosMisionVision.tsx
"use client";

import { motion } from "framer-motion";

const items = [
  {
    tag: "Misión",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2"  x2="12" y2="6"  strokeLinecap="round" />
        <line x1="12" y1="18" x2="12" y2="22" strokeLinecap="round" />
        <line x1="2"  y1="12" x2="6"  y2="12" strokeLinecap="round" />
        <line x1="18" y1="12" x2="22" y2="12" strokeLinecap="round" />
      </svg>
    ),
    title: "Facilitar el acceso",
    text: "Facilitar el acceso a perfiles de aluminio y componentes modulares de forma práctica y accesible para empresas y particulares.",
    accentVar: "var(--color-cq-accent-dim)",
    accentGlowVar: "var(--color-cq-accent-glow)",
    tagColor: "var(--color-cq-accent)",
  },
  {
    tag: "Visión",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Proveedor líder en México",
    text: "Ser el proveedor líder en México de soluciones modulares, reconocidos por la calidad de nuestros productos y la facilidad de nuestra plataforma en línea.",
    accentVar: "#0EA5E9",
    accentGlowVar: "rgba(14,165,233,0.08)",
    tagColor: "#0EA5E9",
  },
];

const fadeSlide = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export function NosotrosMisionVision() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background: "var(--color-cq-surface)",
        transition: "background-color 0.35s ease",
      }}
    >
      {/* Top divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-cq-border-2), transparent)",
        }}
      />

      {/* Bottom divider */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-cq-border), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-label justify-center">Enfoque y proyección</p>
          <h2
            className="text-display"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              color: "var(--color-cq-text)",
            }}
          >
            Hacia dónde{" "}
            <span style={{ color: "var(--color-cq-accent)" }}>vamos</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.tag}
              custom={i}
              variants={fadeSlide}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="relative rounded-2xl p-8 overflow-hidden"
              style={{
                background: "var(--color-cq-surface-2)",
                border: "1px solid var(--color-cq-border)",
                boxShadow: "var(--shadow-card)",
                transition: "background-color 0.35s ease, border-color 0.35s ease",
              }}
              whileHover={{
                y: -4,
                boxShadow: `0 12px 40px ${item.accentGlowVar}`,
              }}
              transition={{ duration: 0.22 }}
            >
              {/* Corner glow */}
              <div
                className="absolute top-0 right-0 pointer-events-none"
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background: `radial-gradient(ellipse at 80% 20%, ${item.accentGlowVar} 0%, transparent 70%)`,
                  filter: "blur(24px)",
                }}
              />

              {/* Tag pill */}
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: item.accentGlowVar,
                    color: item.accentVar,
                  }}
                >
                  {item.icon}
                </div>
                <span
                  className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    background: item.accentGlowVar,
                    color: item.tagColor,
                    border: `1px solid ${item.accentGlowVar}`,
                  }}
                >
                  {item.tag}
                </span>
              </div>

              {/* Title */}
              <h3
                className="mb-3 relative z-10"
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  fontWeight: 800,
                  fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)",
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                  color: "var(--color-cq-text)",
                }}
              >
                {item.title}
              </h3>

              {/* Body */}
              <p
                className="text-base leading-relaxed relative z-10"
                style={{ color: "var(--color-cq-muted)" }}
              >
                {item.text}
              </p>

              {/* Bottom accent line */}
              <div
                className="mt-8 relative z-10"
                style={{
                  height: "2px",
                  borderRadius: "999px",
                  background: `linear-gradient(90deg, ${item.accentVar}, transparent)`,
                  opacity: 0.35,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}