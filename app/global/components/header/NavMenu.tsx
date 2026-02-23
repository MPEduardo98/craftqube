"use client";

import { useState } from "react";
import Link from "next/link";

interface NavChild {
  label: string;
  href: string;
  desc: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  {
    label: "Productos",
    children: [
      { label: "Perfiles Estructurales", href: "/productos/perfiles", desc: "Serie 20 · 30 · 40 · 45 · 80" },
      { label: "Escuadras & Brackets", href: "/productos/escuadras", desc: "Internas, externas, angulares" },
      { label: "Tornillería", href: "/productos/tornilleria", desc: "Cabeza martillo, T-nuts, hexagonal" },
      { label: "Tapas & Cubiertas", href: "/productos/tapas", desc: "Extremos, canales, caps" },
      { label: "Placas de Conexión", href: "/productos/placas", desc: "Junction plates, L-slots" },
      { label: "Ver todo el catálogo", href: "/catalogo", desc: "→ Catálogo completo" },
    ],
  },
  {
    label: "Automatización",
    children: [
      { label: "Estructuras para CNC", href: "/automatizacion/cnc", desc: "Frames y portales" },
      { label: "Guías Lineales", href: "/automatizacion/guias", desc: "Rieles y carros deslizantes" },
      { label: "Husillos de Bola", href: "/automatizacion/husillos", desc: "SFU1204, SFU1605 y más" },
      { label: "Kits Completos", href: "/automatizacion/kits", desc: "Listos para ensamblar" },
    ],
  },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export function NavMenu() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <div className="flex items-center">
      {navItems.map((item) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => item.children && setActiveDropdown(item.label)}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-150"
              style={{ color: "var(--color-cq-steel-300)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-cq-steel-300)";
              }}
            >
              {item.label}
            </Link>
          ) : (
            <button
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-150"
              style={{ color: "var(--color-cq-steel-300)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "white";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--color-cq-steel-300)";
              }}
            >
              {item.label}
              {item.children && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transition: "transform 0.2s",
                    transform:
                      activeDropdown === item.label
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>
          )}

          {/* Dropdown */}
          {item.children && activeDropdown === item.label && (
            <div className="absolute top-full left-0 pt-2 min-w-64 z-50">
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  background: "var(--color-cq-900)",
                  border: "1px solid var(--color-cq-800)",
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(30,77,183,0.15)",
                }}
              >
                {item.children.map((child, idx) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="flex flex-col px-4 py-3 transition-all duration-150"
                    style={{
                      borderBottom:
                        idx < (item.children?.length ?? 0) - 1
                          ? "1px solid var(--color-cq-800)"
                          : "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "var(--color-cq-800)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "transparent";
                    }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-cq-100)" }}
                    >
                      {child.label}
                    </span>
                    <span
                      className="text-xs mt-0.5"
                      style={{
                        fontFamily: "var(--font-jetbrains, monospace)",
                        color: "var(--color-cq-steel-400)",
                      }}
                    >
                      {child.desc}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}