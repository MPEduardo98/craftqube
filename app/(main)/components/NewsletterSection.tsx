"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "#F1F5F9" }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37, 99, 235, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <p className="section-label justify-center">Newsletter</p>
          <h2
            className="text-display mb-4"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", color: "#0F172A" }}
          >
            Actualizaciones técnicas y{" "}
            <span style={{ color: "#1D4ED8" }}>novedades</span>
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: "#64748B" }}>
            Recibe fichas técnicas, nuevos productos, guías de instalación y ofertas exclusivas
            directamente en tu correo.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@empresa.com"
                required
                className="flex-1 px-4 py-3 rounded-lg text-sm outline-none"
                style={{
                  background: "white",
                  border: "1.5px solid #E2E8F0",
                  color: "#0F172A",
                  fontFamily: "var(--font-body)",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#1D4ED8")}
                onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 rounded-lg text-xs font-bold tracking-widest uppercase"
                style={{
                  background: "#1D4ED8",
                  color: "white",
                  fontFamily: "var(--font-display)",
                  boxShadow: "0 4px 16px rgba(29, 78, 216, 0.25)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Suscribirse
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl max-w-md mx-auto"
              style={{
                background: "rgba(37, 99, 235, 0.07)",
                border: "1px solid rgba(37, 99, 235, 0.2)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#1D4ED8" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: "#1D4ED8" }}>
                ¡Suscripción exitosa! Pronto recibirás novedades.
              </p>
            </motion.div>
          )}

          <p className="text-xs mt-4" style={{ color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
            Sin spam. Cancelación inmediata. Solo contenido técnico de valor.
          </p>
        </motion.div>
      </div>
    </section>
  );
}