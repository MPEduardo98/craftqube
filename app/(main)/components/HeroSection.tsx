// app/(main)/components/HeroSection.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Transition } from "framer-motion";

const stats = [
  { value: "+2,500", label: "SKUs en stock" },
  { value: "10+",    label: "Años de experiencia" },
  { value: "48h",    label: "Entrega estándar" },
  { value: "ISO",    label: "9001 Certificado" },
];

const fadeUpHidden = { opacity: 0, y: 20 };

function fadeUpVisible(i: number): { opacity: number; y: number; transition: Transition } {
  return {
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" },
  };
}

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "#F8FAFC",
        minHeight: "100dvh",
        display: "grid",
        gridTemplateRows: "1fr auto",
        paddingTop: "80px",
      }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 65% 45%, rgba(37,99,235,0.06) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.035) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Main grid: texto | imagen ── */}
      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "2rem",
          paddingTop: "clamp(2rem, 6vh, 5rem)",
          paddingBottom: "clamp(2rem, 6vh, 4rem)",
        }}
      >
        {/* ── Columna izquierda — texto ── */}
        <div style={{ maxWidth: "560px" }}>
          {/* Badge */}
          <motion.div
            className="inline-flex mb-5"
            initial={fadeUpHidden}
            animate={fadeUpVisible(0)}
          >
            <span
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.18)",
                color: "#1D4ED8",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#1D4ED8", animation: "pulse 2s infinite" }}
              />
              Distribución Industrial Premium
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            style={{
              fontSize: "clamp(2.6rem, 5vw, 4.5rem)",
              fontFamily: "var(--font-display, sans-serif)",
              fontWeight: 900,
              color: "#0F172A",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: "1.25rem",
            }}
            initial={fadeUpHidden}
            animate={fadeUpVisible(1)}
          >
            Perfiles de{" "}
            <span style={{ color: "#1D4ED8" }}>aluminio</span>
            <br />
            para construir
            <br />
            <span style={{ color: "#374151" }}>el futuro</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            style={{
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "#64748B",
              marginBottom: "2rem",
              maxWidth: "460px",
            }}
            initial={fadeUpHidden}
            animate={fadeUpVisible(2)}
          >
            Proveedor líder de perfiles estructurales, tornillería especializada y
            sistemas de automatización industrial. Precisión suiza, entrega en 48h.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-3"
            style={{ marginBottom: "2.5rem" }}
            initial={fadeUpHidden}
            animate={fadeUpVisible(3)}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/catalogo"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.75rem 1.75rem",
                  borderRadius: "10px",
                  background: "#1D4ED8",
                  color: "white",
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(29,78,216,0.28)",
                  transition: "box-shadow 0.2s",
                }}
              >
                Ver catálogo
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/contacto"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "0.75rem 1.75rem",
                  borderRadius: "10px",
                  background: "white",
                  color: "#1E293B",
                  fontFamily: "var(--font-display, sans-serif)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  border: "1.5px solid #E2E8F0",
                }}
              >
                Cotizar proyecto
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
            }}
            initial={fadeUpHidden}
            animate={fadeUpVisible(4)}
          >
            {stats.map((s) => (
              <div
                key={s.value}
                style={{
                  padding: "0.875rem 0.75rem",
                  borderRadius: "12px",
                  background: "white",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <p
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 900,
                    color: "#1D4ED8",
                    fontFamily: "var(--font-display, sans-serif)",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: "0.62rem",
                    color: "#94A3B8",
                    fontFamily: "var(--font-mono, monospace)",
                    letterSpacing: "0.06em",
                    lineHeight: 1.3,
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Columna derecha — imagen ── */}
        <div
          className="relative hidden lg:flex items-center justify-center"
          style={{ height: "clamp(400px, 55vh, 620px)" }}
        >
          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 75% 65% at 55% 50%, rgba(37,99,235,0.09) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
          />

          {/* Imagen flotante */}
          <motion.div
            className="relative"
            style={{ width: "92%", height: "92%", rotate: -5 }}
            initial={{ opacity: 0, x: 50, rotate: -8 }}
            animate={{ opacity: 1, x: 0, rotate: -5 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.25 }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Sombra elíptica */}
              <div
                className="absolute"
                style={{
                  bottom: "-20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "55%",
                  height: "28px",
                  background: "radial-gradient(ellipse, rgba(29,78,216,0.2) 0%, transparent 70%)",
                  filter: "blur(12px)",
                  borderRadius: "50%",
                }}
              />

              <Image
                src="/imagenes/heros/hero_principal.png"
                alt="Perfil de aluminio industrial — CraftQube"
                fill
                priority
                className="object-contain select-none"
                sizes="50vw"
                style={{
                  filter:
                    "drop-shadow(0 30px 50px rgba(29,78,216,0.16)) drop-shadow(0 8px 18px rgba(0,0,0,0.12))",
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ── Imagen mobile ── */}
      <motion.div
        className="lg:hidden relative z-10 w-full flex justify-center pb-10 px-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
      >
        <div className="relative" style={{ width: "min(80vw, 280px)", aspectRatio: "1/1" }}>
          <Image
            src="/imagenes/heros/hero_principal.png"
            alt="Perfil de aluminio industrial — CraftQube"
            fill
            priority
            className="object-contain"
            sizes="80vw"
            style={{ filter: "drop-shadow(0 16px 30px rgba(29,78,216,0.2))" }}
          />
        </div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-6 left-1/2 hidden lg:flex"
        style={{ transform: "translateX(-50%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
        >
          <span
            style={{
              fontSize: "0.58rem",
              letterSpacing: "0.18em",
              color: "#CBD5E1",
              fontFamily: "var(--font-mono, monospace)",
              textTransform: "uppercase",
            }}
          >
            scroll
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}