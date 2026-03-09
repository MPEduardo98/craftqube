// app/nosotros/components/NosotrosMisionVision.tsx
"use client";

import { motion } from "framer-motion";

const items = [
  {
    tag: "Misión",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2"  x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2"  y1="12" x2="6"  y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
    title: "Facilitar el acceso",
    text: "Facilitar el acceso a perfiles de aluminio y componentes modulares de forma práctica y accesible para empresas y particulares.",
    accent: "#1D4ED8",
    bg: "rgba(29,78,216,0.05)",
    border: "rgba(29,78,216,0.15)",
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
    accent: "#0EA5E9",
    bg: "rgba(14,165,233,0.05)",
    border: "rgba(14,165,233,0.15)",
  },
];

export function NosotrosMisionVision() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      {/* Top border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.2), transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-16">
          <p className="section-label justify-center">Enfoque y proyección</p>
          <h2
            className="text-display"
            style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", color: "#0F172A" }}
          >
            Hacia dónde{" "}
            <span style={{ color: "#1D4ED8" }}>vamos</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.tag}
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: item.bg,
                border: `1px solid ${item.border}`,
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.12 }}
              whileHover={{ y: -4, boxShadow: `0 12px 40px ${item.accent}20` }}
            >
              {/* Tag */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${item.accent}15`, color: item.accent }}
                >
                  {item.icon}
                </div>
                <span
                  className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{
                    fontFamily: "var(--font-jetbrains, monospace)",
                    background: `${item.accent}12`,
                    color: item.accent,
                    border: `1px solid ${item.accent}25`,
                  }}
                >
                  {item.tag}
                </span>
              </div>

              <h3
                className="text-xl font-bold mb-3"
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  color: "#0F172A",
                  letterSpacing: "0.01em",
                }}
              >
                {item.title}
              </h3>

              <p
                className="text-base leading-relaxed"
                style={{ color: "#64748B" }}
              >
                {item.text}
              </p>

              {/* Decorative corner glow */}
              <div
                className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 100% 100%, ${item.accent}10 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}