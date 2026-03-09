// app/nosotros/components/NosotrosIntro.tsx
"use client";

import { motion } from "framer-motion";

const marcas = ["Bosch Rexroth", "Item", "Minitec"];

const stats = [
  { value: "1ª",     label: "Tienda online en México\npara este tipo de producto" },
  { value: "3+",     label: "Marcas premium\ndisponibles" },
  { value: "48h",    label: "Entrega estándar\na todo México" },
  { value: "100%",   label: "Disponible al\npúblico general" },
];

export function NosotrosIntro() {
  return (
    <section className="py-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="section-label">Nuestra historia</p>
            <h2
              className="text-display mb-6"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                color: "#0F172A",
              }}
            >
              Soluciones modulares{" "}
              <span style={{ color: "#1D4ED8" }}>para todos</span>
            </h2>

            <div
              className="space-y-4 text-base leading-relaxed"
              style={{ color: "#475569" }}
            >
              <p>
                En CraftQube ofrecemos soluciones de ensamblaje modular con perfiles
                de aluminio de alta calidad. Trabajamos con marcas líderes como{" "}
                {marcas.map((m, i) => (
                  <span key={m}>
                    <span
                      className="font-semibold"
                      style={{ color: "#1D4ED8" }}
                    >
                      {m}
                    </span>
                    {i < marcas.length - 1 ? ", " : " "}
                  </span>
                ))}
                para que puedas diseñar y construir estructuras personalizadas,
                desde proyectos industriales hasta escolares o personales.
              </p>
              <p>
                Somos la <strong style={{ color: "#0F172A" }}>primera tienda en línea en México</strong> abierta
                al público para este tipo de productos. Queremos que la innovación
                y la ingeniería estén al alcance de todos.
              </p>
              <p>
                Nuestra tienda es fácil de usar: explora, compra y recibe tu pedido
                en casa o en tu trabajo, de forma rápida y sencilla.
              </p>
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="rounded-2xl p-6 flex flex-col gap-2"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -3, boxShadow: "0 8px 28px rgba(29,78,216,0.1)" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display, sans-serif)",
                    fontWeight: 900,
                    fontSize: "2.4rem",
                    lineHeight: 1,
                    color: "#1D4ED8",
                  }}
                >
                  {s.value}
                </span>
                <span
                  className="text-xs leading-snug"
                  style={{
                    fontFamily: "var(--font-jetbrains, monospace)",
                    color: "#94A3B8",
                    whiteSpace: "pre-line",
                  }}
                >
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}