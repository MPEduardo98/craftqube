// app/(main)/nosotros/components/NosotrosIntro.tsx
"use client";

import { motion } from "framer-motion";

const marcas = ["Bosch Rexroth", "Item", "Minitec"];

const stats = [
  { value: "1ª",   label: "Tienda online en México\npara este tipo de producto" },
  { value: "3+",   label: "Marcas premium\ndisponibles" },
  { value: "48h",  label: "Entrega estándar\na todo México" },
  { value: "100%", label: "Disponible al\npúblico general" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export function NosotrosIntro() {
  return (
    <section
      className="py-24"
      style={{ background: "var(--color-cq-bg)", transition: "background-color 0.35s ease" }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Texto ── */}
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
                color: "var(--color-cq-text)",
              }}
            >
              Soluciones modulares{" "}
              <span style={{ color: "var(--color-cq-accent)" }}>para todos</span>
            </h2>

            <div
              className="space-y-4 text-base leading-relaxed"
              style={{ color: "var(--color-cq-muted)" }}
            >
              <p>
                En CraftQube ofrecemos soluciones de ensamblaje modular con perfiles
                de aluminio de alta calidad. Trabajamos con marcas líderes como{" "}
                {marcas.map((m, i) => (
                  <span key={m}>
                    <span
                      className="font-semibold"
                      style={{ color: "var(--color-cq-accent)" }}
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
                Somos la{" "}
                <strong style={{ color: "var(--color-cq-text)" }}>
                  primera tienda en línea en México
                </strong>{" "}
                abierta al público para este tipo de productos. Queremos que la
                innovación y la ingeniería estén al alcance de todos.
              </p>
              <p>
                Nuestra tienda es fácil de usar: explora, compra y recibe tu pedido
                en casa o en tu trabajo, de forma rápida y sencilla.
              </p>
            </div>
          </motion.div>

          {/* ── Stats grid ── */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {stats.map((s) => (
              <motion.div
                key={s.value}
                variants={fadeUp}
                className="rounded-2xl p-6 flex flex-col gap-2"
                style={{
                  background: "var(--color-cq-surface)",
                  border: "1px solid var(--color-cq-border)",
                  boxShadow: "var(--shadow-card)",
                  transition: "background-color 0.35s ease, border-color 0.35s ease",
                }}
              >
                {/* Big number */}
                <span
                  style={{
                    fontFamily: "var(--font-display, sans-serif)",
                    fontWeight: 900,
                    fontSize: "clamp(2rem, 4vw, 2.8rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: "var(--color-cq-accent)",
                  }}
                >
                  {s.value}
                </span>

                {/* Label */}
                <span
                  className="text-xs leading-snug whitespace-pre-line"
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    color: "var(--color-cq-muted)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {s.label}
                </span>

                {/* Bottom accent line */}
                <div
                  className="mt-auto pt-3"
                  style={{
                    borderTop: "1px solid var(--color-cq-border)",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "2px",
                      borderRadius: "999px",
                      background: "var(--color-cq-accent)",
                      opacity: 0.5,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}