// app/(main)/nosotros/components/NosotrosCTA.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function NosotrosCTA() {
  return (
    <section
      className="relative overflow-hidden py-24 px-6"
      style={{
        background:
          "linear-gradient(135deg, var(--color-cq-blue-900) 0%, var(--color-cq-blue-800) 50%, var(--color-cq-blue-600) 100%)",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Center glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(96,165,250,0.15) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        {/* Label */}
        <motion.p
          className="text-xs tracking-widest uppercase mb-4"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            color: "rgba(255,255,255,0.5)",
          }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          ¿Listo para empezar?
        </motion.p>

        {/* Headline */}
        <motion.h2
          className="mb-4"
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontWeight: 900,
            fontSize: "clamp(2rem, 4vw, 3rem)",
            lineHeight: 1.1,
            textTransform: "uppercase",
            color: "white",
          }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.06 }}
        >
          Explora nuestro{" "}
          <span style={{ color: "var(--color-cq-blue-200)" }}>catálogo</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="text-base leading-relaxed mb-10"
          style={{
            color: "rgba(255,255,255,0.6)",
            maxWidth: "520px",
            margin: "0 auto 2.5rem",
          }}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          Perfiles, tornillería, escuadras y accesorios disponibles ahora mismo.
          Compra en línea y recibe en casa o en tu trabajo.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.18 }}
        >
          {/* Primary */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold tracking-wide"
              style={{
                background: "rgba(255,255,255,0.95)",
                color: "var(--color-cq-blue-600)",
                textDecoration: "none",
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Ver catálogo
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          {/* Secondary */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold tracking-wide"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.22)",
                textDecoration: "none",
                fontFamily: "var(--font-display, sans-serif)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Contáctanos
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}