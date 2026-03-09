// app/global/components/footer/Footer.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { CraftqubeLogo } from "../header/CraftqubeLogo";
import { ThemeToggle } from "./ThemeToggle";

interface CategoriaDB {
  id: number;
  nombre: string;
  slug: string;
  total_productos: number;
}

const footerLinks = {
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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
];

export function Footer() {
  const [categorias, setCategorias] = useState<CategoriaDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategorias(json.data.slice(0, 5));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <footer style={{ background: "#0A0A0A", color: "#fff" }}>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <div className="mb-6 opacity-90">
              <CraftqubeLogo />
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              Perfiles de aluminio y accesorios industriales de alta calidad.
              Soluciones innovadoras para tus proyectos.
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
          </div>

          {/* Productos - DINAMICO */}
          <div>
            <h4
              className="text-xs tracking-widest uppercase mb-5"
              style={{ fontFamily: "var(--font-jetbrains, monospace)", color: "#3B82F6" }}
            >
              Productos
            </h4>
            <ul className="flex flex-col gap-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={i}>
                    <div
                      className="h-4 rounded animate-pulse"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        width: `${60 + Math.random() * 30}%`,
                      }}
                    />
                  </li>
                ))
              ) : categorias.length > 0 ? (
                <>
                  {categorias.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/productos/${cat.slug}`}
                        className="text-sm transition-colors duration-150"
                        style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)"; }}
                      >
                        {cat.nombre}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/catalogo"
                      className="text-sm font-semibold transition-colors duration-150"
                      style={{ color: "#3B82F6", textDecoration: "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#60A5FA"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#3B82F6"; }}
                    >
                      Catálogo Completo →
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/productos"
                      className="text-sm transition-colors duration-150"
                      style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)"; }}
                    >
                      Ver Productos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/catalogo"
                      className="text-sm transition-colors duration-150"
                      style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)"; }}
                    >
                      Catálogo Completo
                    </Link>
                  </li>
                </>
              )}
            </ul>
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
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/eduardo_martinez66"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-colors"
              style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)"; }}
            >
              Designed by @eduardo_martinez66
            </a>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}