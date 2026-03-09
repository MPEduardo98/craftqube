// app/(main)/components/AutomationSection.tsx
'use client';

import Link from "next/link";
import { motion } from "framer-motion";

const automationItems = [
  {
    title: "Estructuras para CNC",
    desc: "Frames robustos de aluminio para máquinas CNC de fresado, corte y grabado. Diseño modular para cualquier configuración.",
    href: "/automatizacion/cnc",
    accent: "#2d6be4",
  },
  {
    title: "Sistemas de Movimiento Lineal",
    desc: "Guías de perfil, rieles redondos, husillos de bola y sistemas de desplazamiento de alta precisión.",
    href: "/automatizacion/guias",
    accent: "#00d4ff",
  },
  {
    title: "Proyectos Llave en Mano",
    desc: "Desde el diseño conceptual hasta la puesta en marcha. Nuestros ingenieros diseñan y construyen su solución.",
    href: "/automatizacion/proyectos",
    accent: "#4d8ef5",
  },
];

export function AutomationSection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        /* Esta sección es siempre dark por diseño — no cambia con el tema */
        background: "linear-gradient(180deg, #0F172A 0%, #0A0A0A 100%)",
      }}
    >
      {/* Decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow effect */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "-200px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.07) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: content */}
          <div>
            <p className="section-label" style={{ color: "#00d4ff" }}>
              Automatización Industrial
            </p>
            <h2
              className="text-display mb-6"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "white" }}
            >
              Soluciones para la{" "}
              <span style={{ color: "#00d4ff" }}>
                industria 4.0
              </span>
            </h2>
            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: "rgba(255,255,255,0.5)", maxWidth: "480px" }}
            >
              Combinamos la versatilidad del perfil de aluminio con componentes de automatización
              de precisión para crear sistemas robustos, escalables y de alto rendimiento.
            </p>

            {/* Items */}
            <div className="flex flex-col gap-4 mb-10">
              {automationItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-start gap-4 p-4 rounded-md transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                    style={{ background: item.accent }}
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>
                      {item.title}
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {item.desc}
                    </p>
                  </div>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                    className="flex-shrink-0 mt-1 transition-all group-hover:stroke-white group-hover:translate-x-1"
                    style={{ transition: "all 0.2s ease" }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/automatizacion"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold"
                style={{
                  background: "rgba(45,107,228,0.2)",
                  border: "1px solid rgba(45,107,228,0.4)",
                  color: "#60A5FA",
                  textDecoration: "none",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                }}
              >
                Ver soluciones completas
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>

          {/* Right: visual */}
          <div className="hidden lg:flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              style={{
                width: "380px",
                aspectRatio: "1/1",
                borderRadius: "24px",
                background: "linear-gradient(135deg, rgba(45,107,228,0.15) 0%, rgba(0,212,255,0.08) 100%)",
                border: "1px solid rgba(45,107,228,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative rings */}
              {[80, 140, 200].map((size) => (
                <div
                  key={size}
                  style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    border: "1px solid rgba(45,107,228,0.15)",
                  }}
                />
              ))}
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(45,107,228,0.6)" strokeWidth="1">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}