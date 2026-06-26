// app/(main)/components/TestimonialsSection.tsx
"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Ing. Marco A. Vega",
    role: "Director de Ingeniería",
    company: "AutoParts MX",
    text: "Craftqube nos provee los perfiles de aluminio para nuestras líneas de ensamble. La calidad es consistente y los tiempos de entrega nunca fallan. Son nuestro proveedor de confianza desde hace 5 años.",
    rating: 5,
  },
  {
    name: "Dr. Patricia Flores",
    role: "Jefa de Manufactura",
    company: "Industrias Monterrey",
    text: "La asesoría técnica del equipo de Craftqube fue fundamental para optimizar nuestro diseño de frames CNC. Redujimos costos un 30% sin sacrificar rigidez. Increíble soporte.",
    rating: 5,
  },
  {
    name: "Ricardo Chávez",
    role: "Fundador",
    company: "RoboticasLAB",
    text: "Como startup de robótica, necesitábamos un proveedor que entendiera nuestras necesidades de precisión y volumen variable. Craftqube es exactamente eso. Catálogo extenso y precios competitivos.",
    rating: 5,
  },
];

const clients = [
  "AutoParts MX",
  "Grupo Industrial Monterrey",
  "TechRobots CDMX",
  "Maquinados Precisión",
  "Industrias del Bajío",
  "MedTech México",
];

export function TestimonialsSection() {
  return (
    /* Esta sección es siempre dark por diseño — invariante al tema */
    <section className="py-24 relative" style={{ background: "#0A0A0A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Client logos */}
        <div
          className="mb-20 py-8 px-6"
          style={{
            background: "#161B22",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "8px",
          }}
        >
          <p
            className="text-center text-xs tracking-widest uppercase mb-6"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Empresas que confían en Craftqube
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {clients.map((client) => (
              <span
                key={client}
                className="text-sm font-bold tracking-wider uppercase"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                {client}
              </span>
            ))}
          </div>
        </div>

        {/* Section header */}
        <div className="mb-12 text-center">
          <p className="section-label justify-center">Testimonios</p>
          <h2
            className="text-display"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "white" }}
          >
            Lo que dicen{" "}
            <span style={{ color: "#3B82F6" }}>nuestros clientes</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="p-6 flex flex-col rounded-xl"
              style={{
                background: "#161B22",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Stars */}
              <div
                className="flex items-center gap-1 mb-5"
                aria-label={`Calificación: ${t.rating} de 5 estrellas`}
              >
                {Array.from({ length: t.rating }).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#facc15" stroke="none" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              <blockquote
                className="text-sm leading-relaxed flex-1 mb-6 italic"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                &ldquo;{t.text}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
                    color: "white",
                  }}
                  aria-hidden="true"
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {t.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}