"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const stats = [
  { value: "+2,500", label: "SKUs en stock" },
  { value: "10+", label: "Años de experiencia" },
  { value: "48h", label: "Entrega estándar" },
  { value: "ISO", label: "9001 Certificado" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ paddingTop: "88px", background: "#F8FAFC" }}
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 60% 40%, rgba(37, 99, 235, 0.07) 0%, transparent 70%), radial-gradient(ellipse 35% 35% at 15% 75%, rgba(37, 99, 235, 0.04) 0%, transparent 60%)",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.6,
          }}
        />
      </div>

      {/* Decorative right: structural SVG */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none hidden lg:block overflow-hidden">
        <motion.svg
          viewBox="0 0 600 800"
          className="absolute right-0 top-0 h-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.07, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <defs>
            <linearGradient id="heroProfileGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <rect x="50" y="100" width="80" height="600" rx="4" fill="url(#heroProfileGrad)" />
          <rect x="150" y="100" width="80" height="600" rx="4" fill="url(#heroProfileGrad)" opacity="0.7" />
          <rect x="30" y="350" width="220" height="80" rx="4" fill="url(#heroProfileGrad)" opacity="0.5" />
          <rect x="30" y="450" width="220" height="80" rx="4" fill="url(#heroProfileGrad)" opacity="0.5" />
          <rect x="300" y="200" width="60" height="500" rx="3" fill="url(#heroProfileGrad)" opacity="0.4" />
          <rect x="380" y="300" width="60" height="350" rx="3" fill="url(#heroProfileGrad)" opacity="0.3" />
        </motion.svg>
        {/* Blue glow accent */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: "15%",
            top: "30%",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-3xl">
          {/* Label badge */}
          <motion.div
            className="inline-flex items-center gap-2 mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(37, 99, 235, 0.08)",
                border: "1px solid rgba(37, 99, 235, 0.2)",
                color: "#1D4ED8",
                fontFamily: "var(--font-jetbrains, monospace)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#1D4ED8" }}
              />
              Distribución Industrial Premium
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-display mb-6"
            style={{
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              color: "#0F172A",
              lineHeight: 1.0,
            }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            Perfiles de{" "}
            <span style={{ color: "#1D4ED8" }}>aluminio</span>
            <br />
            para construir
            <br />
            <span style={{ color: "#374151" }}>el futuro</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-lg leading-relaxed mb-10 max-w-xl"
            style={{ color: "#6B7280" }}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            Proveedor líder de perfiles estructurales, tornillería especializada, escuadras
            y sistemas completos de automatización industrial. Precisión suiza, entrega inmediata.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 mb-16"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-bold tracking-wide"
                style={{
                  background: "#1D4ED8",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(29, 78, 216, 0.3)",
                  fontFamily: "var(--font-barlow, sans-serif)",
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Ver catálogo completo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/cotizar"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg text-sm font-bold tracking-wide"
                style={{
                  background: "white",
                  color: "#1D4ED8",
                  border: "1.5px solid #E5E7EB",
                  fontFamily: "var(--font-barlow, sans-serif)",
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                Solicitar cotización
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-4 gap-6 max-w-lg"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="flex flex-col"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
              >
                <span
                  className="text-display"
                  style={{
                    fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                    color: "#0F172A",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs mt-1"
                  style={{
                    fontFamily: "var(--font-jetbrains, monospace)",
                    color: "#9CA3AF",
                    letterSpacing: "0.04em",
                  }}
                >
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}