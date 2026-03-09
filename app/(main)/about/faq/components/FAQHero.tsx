// app/(main)/faq/components/FAQHero.tsx
"use client";

import { motion } from "framer-motion";

export function FAQHero() {
  return (
    <section
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: "var(--color-cq-surface)" }}
    >
      {/* Grid bg */}
      <div
        className="absolute inset-0 bg-grid-pattern"
        style={{ "--grid-opacity": "0.035" } as React.CSSProperties}
      />

      {/* Glow blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "10%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(37,99,235,0.2), transparent)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label justify-center mb-4">Preguntas Frecuentes</p>
          <h1
            className="text-display mb-5"
            style={{
              fontSize: "clamp(2.4rem, 5.5vw, 4rem)",
              color: "var(--color-cq-text)",
            }}
          >
            ¿En qué podemos{" "}
            <span style={{ color: "var(--color-cq-accent)" }}>ayudarte?</span>
          </h1>
          <p
            className="text-base md:text-lg max-w-xl mx-auto"
            style={{ color: "var(--color-cq-muted)" }}
          >
            Aquí respondemos las preguntas más comunes para que tu experiencia
            con CraftQube sea más fácil y clara.
          </p>
        </motion.div>
      </div>
    </section>
  );
}