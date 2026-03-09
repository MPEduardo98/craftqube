// app/contacto/components/ContactHero.tsx
"use client";

import { motion } from "framer-motion";

export function ContactHero() {
  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{ background: "var(--color-cq-surface)" }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.p
          className="section-label justify-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Contacto
        </motion.p>

        <motion.h1
          className="text-display mb-6"
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            color: "var(--color-cq-text)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Hablemos de tu{" "}
          <span style={{ color: "var(--color-cq-accent)" }}>proyecto</span>
        </motion.h1>

        <motion.p
          className="text-base leading-relaxed max-w-2xl mx-auto"
          style={{ color: "var(--color-cq-muted)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          ¿Necesitas asesoría técnica, una cotización o tienes alguna duda?
          Estamos aquí para ayudarte.
        </motion.p>
      </div>
    </section>
  );
}