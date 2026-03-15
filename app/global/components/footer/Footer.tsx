// app/global/components/footer/Footer.tsx
"use client";

import Link             from "next/link";
import { motion }       from "framer-motion";
import { useState, useEffect } from "react";
import { CraftqubeLogo } from "../header/CraftqubeLogo";
import { ThemeToggle }  from "./ThemeToggle";

interface CategoriaDB {
  id:               number;
  nombre:           string;
  slug:             string;
  total_productos:  number;
}

/* ── Columnas de navegación ─────────────────────────────── */
const footerLinks = {
  empresa: {
    title: "Empresa",
    items: [
      { label: "Quiénes Somos",   href: "/about/nosotros" },
      { label: "Proyectos",       href: "/proyectos" },
      { label: "Certificaciones", href: "/certificaciones" },
      { label: "Blog Técnico",    href: "/blog" },
      { label: "Contacto",        href: "/contacto" },
    ],
  },
  soporte: {
    title: "Soporte",
    items: [
      { label: "Guías de Instalación", href: "/guias" },
      { label: "Descarga de CAD",      href: "/cad" },
      { label: "Solicitar Cotización", href: "/cotizar" },
      { label: "Preguntas Frecuentes", href: "/about/faq" },
      { label: "Política de Envíos",   href: "/politicas/politica-de-envio" },
    ],
  },
};

const legalLinks = [
  { label: "Privacidad", href: "/politicas/politica-de-privacidad" },
  { label: "Envíos",     href: "/politicas/politica-de-envio" },
  { label: "Reembolso",  href: "/politicas/politica-de-reembolso" },
  { label: "FAQ",        href: "/about/faq" },
  { label: "Nosotros",   href: "/about/nosotros" },
];

/* ── Componente reutilizable para links del footer ──────── */
const MotionLink = motion(Link);

function FooterNavLink({
  href,
  children,
  className = "text-sm",
  baseColor = "rgba(255,255,255,0.45)",
  hoverColor = "rgba(255,255,255,0.85)",
}: {
  href:        string;
  children:    React.ReactNode;
  className?:  string;
  baseColor?:  string;
  hoverColor?: string;
}) {
  return (
    <MotionLink
      href={href}
      className={className}
      style={{ color: baseColor, textDecoration: "none" }}
      whileHover={{ color: hoverColor, x: 2 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </MotionLink>
  );
}

/* ── Footer principal ───────────────────────────────────── */
export function Footer() {
  const [categorias,  setCategorias]  = useState<CategoriaDB[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((d) => {
        setCategorias(d.categorias ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <footer
      role="contentinfo"
      style={{ background: "#0A0F1E", color: "rgba(255,255,255,0.7)" }}
    >
      {/* ── Cuerpo principal ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* ── Col 1: Logo + tagline ─────────────────────── */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
            <Link href="/" style={{ textDecoration: "none" }}>
              <CraftqubeLogo />
            </Link>
            <p
              className="text-sm leading-relaxed max-w-[220px]"
              style={{
                fontFamily: "var(--font-body)",
                color:      "rgba(255,255,255,0.35)",
              }}
            >
              Distribuidor premium de perfiles de aluminio y accesorios industriales en México.
            </p>
          </div>

          {/* ── Col 2: Categorías ─────────────────────────── */}
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
                    <span
                      className="block h-4 w-28 rounded"
                      style={{ background: "rgba(255,255,255,0.07)", animation: "pulse 1.5s infinite" }}
                    />
                  </li>
                ))
              ) : categorias.length > 0 ? (
                <>
                  {categorias.map((cat) => (
                    <li key={cat.id}>
                      <FooterNavLink href={`/productos?categoria=${cat.slug}`}>
                        {cat.nombre}
                      </FooterNavLink>
                    </li>
                  ))}
                  <li>
                    <FooterNavLink href="/productos">
                      Ver catálogo completo →
                    </FooterNavLink>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <FooterNavLink href="/productos">Ver Productos</FooterNavLink>
                  </li>
                  <li>
                    <FooterNavLink href="/catalogo">Catálogo Completo</FooterNavLink>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* ── Cols 3 y 4: Empresa + Soporte ────────────── */}
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
                    <FooterNavLink href={item.href}>
                      {item.label}
                    </FooterNavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────── */}
      <div
        className="border-t px-4 sm:px-6 py-6"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Copyright */}
          <p
            className="text-xs order-3 sm:order-1"
            style={{
              fontFamily: "var(--font-jetbrains, monospace)",
              color:      "rgba(255,255,255,0.25)",
            }}
          >
            © {new Date().getFullYear()} Craftqube S.A. de C.V. — Todos los derechos reservados.
          </p>

          {/* Legal links */}
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 order-1 sm:order-2"
          >
            {legalLinks.map((link, idx) => (
              <span key={link.href} className="flex items-center gap-x-4">
                <FooterNavLink
                  href={link.href}
                  className="text-xs whitespace-nowrap"
                  baseColor="rgba(255,255,255,0.25)"
                  hoverColor="rgba(255,255,255,0.55)"
                >
                  {link.label}
                </FooterNavLink>
                {idx < legalLinks.length - 1 && (
                  <span
                    aria-hidden="true"
                    style={{ color: "rgba(255,255,255,0.12)", fontSize: "10px" }}
                  >
                    ·
                  </span>
                )}
              </span>
            ))}
          </nav>

          {/* Designed by + ThemeToggle */}
          <div className="flex items-center gap-4 order-2 sm:order-3">
            <motion.a
              href="https://instagram.com/eduardo_martinez66"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none" }}
              whileHover={{ color: "rgba(255,255,255,0.55)" }}
              transition={{ duration: 0.15 }}
            >
              Designed by @eduardo_martinez66
            </motion.a>
            <ThemeToggle />
          </div>

        </div>
      </div>
    </footer>
  );
}