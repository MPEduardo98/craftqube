// app/nosotros/components/NosotrosHero.tsx
"use client";

import { motion } from "framer-motion";

export function NosotrosHero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "#1224a0",
        paddingTop: "96px",
        paddingBottom: "80px",
      }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px", height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <motion.p
          className="text-xs tracking-widest uppercase mb-4"
          style={{
            fontFamily: "var(--font-jetbrains, monospace)",
            color: "rgba(255,255,255,0.5)",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Quiénes somos
        </motion.p>

        <motion.h1
          className="mb-6"
          style={{
            fontFamily: "var(--font-display, sans-serif)",
            fontWeight: 900,
            fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "white",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          La ingeniería al{" "}
          <span style={{ color: "#60A5FA" }}>alcance de todos</span>
        </motion.h1>

        <motion.p
          className="text-lg leading-relaxed mx-auto"
          style={{
            color: "rgba(255,255,255,0.65)",
            maxWidth: "640px",
            fontFamily: "var(--font-body, sans-serif)",
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.16 }}
        >
          La primera tienda en línea en México abierta al público para
          perfiles de aluminio y componentes modulares de alta calidad.
        </motion.p>
      </div>
    </section>
  );
}