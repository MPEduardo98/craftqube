"use client";

import Link from "next/link";
import { CraftqubeLogo } from "../header/CraftqubeLogo";

const footerLinks = {
  productos: {
    title: "Productos",
    items: [
      { label: "Perfiles de Aluminio", href: "/productos/perfiles" },
      { label: "Escuadras & Brackets", href: "/productos/escuadras" },
      { label: "Tornillería Especializada", href: "/productos/tornilleria" },
      { label: "Tapas & Accesorios", href: "/productos/tapas" },
      { label: "Catálogo Completo", href: "/catalogo" },
    ],
  },
  automatizacion: {
    title: "Automatización",
    items: [
      { label: "Estructuras CNC", href: "/automatizacion/cnc" },
      { label: "Guías Lineales", href: "/automatizacion/guias" },
      { label: "Husillos de Bola", href: "/automatizacion/husillos" },
      { label: "Kits de Proyectos", href: "/automatizacion/kits" },
      { label: "Asesoría Técnica", href: "/asesoria" },
    ],
  },
  empresa: {
    title: "Empresa",
    items: [
      { label: "Quiénes Somos", href: "/nosotros" },
      { label: "Proyectos", href: "/proyectos" },
      { label: "Certificaciones", href: "/certificaciones" },
      { label: "Blog Técnico", href: "/blog" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  soporte: {
    title: "Soporte",
    items: [
      { label: "Guías de Instalación", href: "/guias" },
      { label: "Descarga de CAD", href: "/cad" },
      { label: "Solicitar Cotización", href: "/cotizar" },
      { label: "Preguntas Frecuentes", href: "/faq" },
      { label: "Política de Envíos", href: "/envios" },
    ],
  },
};

const certifications = [
  { label: "ISO 9001:2015", desc: "Calidad" },
  { label: "CE Mark", desc: "Europa" },
  { label: "RoHS", desc: "Materiales" },
];

const contactItems = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.09 6.09l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: "Teléfono",
    value: "+52 (800) 123-4567",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: "Email",
    value: "ventas@craftqube.mx",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: "Horario",
    value: "Lun–Vie · 8:00 – 18:00 CST",
  },
];

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-cq-950)",
        borderTop: "1px solid var(--color-cq-800)",
      }}
    >
      {/* CTA Strip */}
      <div
        className="py-12 px-4 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--color-cq-900) 0%, var(--color-cq-800) 50%, var(--color-cq-900) 100%)",
          borderBottom: "1px solid var(--color-cq-700)",
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="section-label justify-center">¿Tienes un proyecto?</p>
          <h3
            className="text-display text-3xl md:text-4xl mb-6"
            style={{ color: "white" }}
          >
            Hablemos de tu{" "}
            <span style={{ color: "var(--color-cq-accent)" }}>
              solución industrial
            </span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cotizar" className="btn-primary">
              Solicitar cotización gratuita
            </Link>
            <Link href="/contacto" className="btn-secondary">
              Contactar a un ingeniero
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <CraftqubeLogo className="mb-6" />
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "var(--color-cq-steel-400)" }}
            >
              Distribuidor premium de perfiles de aluminio y sistemas de
              automatización industrial. Más de 10 años entregando precisión y
              calidad.
            </p>
            <div className="flex flex-col gap-2">
              {certifications.map((cert) => (
                <div key={cert.label} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--color-cq-accent)" }}
                  />
                  <span
                    className="text-xs"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-cq-steel-300)",
                    }}
                  >
                    {cert.label}
                    <span style={{ color: "var(--color-cq-steel-500)" }}>
                      {" "}
                      — {cert.desc}
                    </span>
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
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-cq-accent)",
                }}
              >
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm transition-colors duration-150"
                      style={{ color: "var(--color-cq-steel-400)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "var(--color-cq-200)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "var(--color-cq-steel-400)";
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div
          className="mt-12 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6"
          style={{ borderTop: "1px solid var(--color-cq-800)" }}
        >
          {contactItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span style={{ color: "var(--color-cq-accent)", marginTop: "2px" }}>
                {item.icon}
              </span>
              <div>
                <p
                  className="text-xs tracking-wider uppercase mb-0.5"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-cq-steel-500)",
                  }}
                >
                  {item.label}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-cq-200)" }}
                >
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid var(--color-cq-900)" }}
        >
          <p
            className="text-xs"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-cq-steel-500)",
            }}
          >
            © {new Date().getFullYear()} Craftqube Industrial Tech S.A. de C.V.
            · Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            {["Privacidad", "Términos", "Cookies"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-xs transition-colors duration-150"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-cq-steel-500)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--color-cq-300)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--color-cq-steel-500)";
                }}
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