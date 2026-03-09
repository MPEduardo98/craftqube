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
        background: "var(--color-cq-bg)",
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
          <motion.div className="inline-flex mb-5" initial={fadeUpHidden} animate={fadeUpVisible(0)}>
            <span
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.18)",
                color: "var(--color-cq-accent)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--color-cq-accent)",
                  display: "inline-block",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }}
              />
              Distribución industrial · México
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-display mb-5"
            style={{
              fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
              color: "var(--color-cq-text)",
              maxWidth: "520px",
            }}
            initial={fadeUpHidden}
            animate={fadeUpVisible(1)}
          >
            Perfiles de{" "}
            <span style={{ color: "var(--color-cq-accent)" }}>Aluminio</span>
            {" "}Industrial
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-base leading-relaxed mb-8"
            style={{
              color: "var(--color-cq-muted)",
              maxWidth: "440px",
            }}
            initial={fadeUpHidden}
            animate={fadeUpVisible(2)}
          >
            Distribuidor premium de perfiles estructurales, tornillería, escuadras
            y sistemas de automatización. Más de 2,500 SKUs en stock inmediato.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap gap-3 mb-10"
            initial={fadeUpHidden}
            animate={fadeUpVisible(3)}
          >
            <Link
              href="/catalogo"
              className="btn-primary"
            >
              Ver catálogo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/cotizar"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-display)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: "var(--color-cq-text)",
                border: "1.5px solid var(--color-cq-border)",
                background: "var(--color-cq-surface)",
                transition: "all 0.2s ease",
              }}
            >
              Cotizar proyecto
            </Link>
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
                  background: "var(--color-cq-surface)",
                  border: "1px solid var(--color-cq-border)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <p
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 900,
                    color: "var(--color-cq-accent)",
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
                    color: "var(--color-cq-muted-2)",
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
        <div className="relative hidden lg:flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            style={{ position: "relative", width: "440px", aspectRatio: "1/1" }}
          >
            {/* Glow bg */}
            <div
              style={{
                position: "absolute",
                inset: "-20%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <Image
              src="/imagenes/heros/hero_principal.png"
              alt="Perfil de aluminio industrial — CraftQube"
              fill
              priority
              className="object-contain"
              sizes="440px"
              style={{ filter: "drop-shadow(0 24px 40px rgba(29,78,216,0.18))" }}
            />
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
              color: "var(--color-cq-muted-2)",
              fontFamily: "var(--font-mono, monospace)",
              textTransform: "uppercase",
            }}
          >
            scroll
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-cq-muted-2)" }}>
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}