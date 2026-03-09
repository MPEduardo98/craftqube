// app/global/components/footer/Footer.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CraftqubeLogo } from "../header/CraftqubeLogo";

const footerLinks = {
  productos: {
    title: "Productos",
    items: [
      { label: "Perfiles de Aluminio",       href: "/productos/perfiles" },
      { label: "Escuadras & Brackets",       href: "/productos/escuadras" },
      { label: "Tornillería Especializada",  href: "/productos/tornilleria" },
      { label: "Tapas & Accesorios",         href: "/productos/tapas" },
      { label: "Catálogo Completo",          href: "/catalogo" },
    ],
  },
  empresa: {
    title: "Empresa",
    items: [
      { label: "Quiénes Somos",    href: "/nosotros" },
      { label: "Proyectos",        href: "/proyectos" },
      { label: "Certificaciones",  href: "/certificaciones" },
      { label: "Blog Técnico",     href: "/blog" },
      { label: "Contacto",         href: "/contacto" },
    ],
  },
  soporte: {
    title: "Soporte",
    items: [
      { label: "Guías de Instalación",  href: "/guias" },
      { label: "Descarga de CAD",       href: "/cad" },
      { label: "Solicitar Cotización",  href: "/cotizar" },
      { label: "Preguntas Frecuentes",  href: "/faq" },
      { label: "Política de Envíos",    href: "/envios" },
    ],
  },
};

const certifications = [
  { label: "ISO 9001:2015", desc: "Calidad certificada" },
  { label: "RoHS",          desc: "Sin sustancias peligrosas" },
  { label: "CE Mark",       desc: "Conformidad europea" },
];

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 1.96C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0A0A0A" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer style={{ background: "#0A0A0A", color: "#fff" }}>

      {/* CTA Banner */}
      <div
        className="relative overflow-hidden py-16 px-6"
        style={{
          background: "linear-gradient(135deg, #1D4ED8 0%, #1a3fa8 50%, #1638a0 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ fontFamily: "var(--font-jetbrains, monospace)", color: "rgba(255,255,255,0.55)" }}
          >
            ¿Tienes un proyecto?
          </p>
          <h3
            className="text-display text-3xl md:text-4xl mb-6"
            style={{ color: "white" }}
          >
            Hablemos de tu{" "}
            <span style={{ color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>
              solución industrial
            </span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/cotizar"
                className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-bold tracking-wide"
                style={{ background: "rgba(255,255,255,0.95)", color: "#1D4ED8" }}
              >
                Solicitar cotización gratuita
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/contacto"
                className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-bold tracking-wide"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                Contactar a un asesor
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="mb-6 opacity-90">
              <CraftqubeLogo />
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              Distribuidor premium de perfiles de aluminio y accesorios industriales.
              Más de 10 años entregando precisión y calidad.
            </p>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {certifications.map((cert) => (
                <div key={cert.label} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#3B82F6" }} />
                  <span
                    className="text-xs"
                    style={{ fontFamily: "var(--font-jetbrains, monospace)", color: "rgba(255,255,255,0.45)" }}
                  >
                    {cert.label}
                    <span style={{ color: "rgba(255,255,255,0.25)" }}> — {cert.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4
                className="text-xs tracking-widest uppercase mb-5"
                style={{ fontFamily: "var(--font-jetbrains, monospace)", color: "#3B82F6" }}
              >
                {section.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm transition-colors duration-150"
                      style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)"; }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t px-4 sm:px-6 py-6" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-xs"
            style={{ fontFamily: "var(--font-jetbrains, monospace)", color: "rgba(255,255,255,0.25)" }}
          >
            © {new Date().getFullYear()} Craftqube S.A. de C.V. — Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            {["Privacidad", "Términos", "Cookies"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)"; }}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}