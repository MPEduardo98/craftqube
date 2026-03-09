// app/global/components/header/NavMenu.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
      { label: "Perfiles Estructurales",  href: "/productos/perfiles",    desc: "Serie 20 · 30 · 40 · 45 · 80" },
      { label: "Escuadras & Brackets",    href: "/productos/escuadras",   desc: "Internas, externas, angulares" },
      { label: "Tornillería",             href: "/productos/tornilleria", desc: "Cabeza martillo, T-nuts, hexagonal" },
      { label: "Tapas & Cubiertas",       href: "/productos/tapas",       desc: "Extremos, canales, caps" },
      { label: "Placas de Conexión",      href: "/productos/placas",      desc: "Junction plates, L-slots" },
      { label: "Ver todo el catálogo",    href: "/catalogo",              desc: "→ Catálogo completo" },
    ],
  },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros",  href: "/nosotros" },
  { label: "Contacto",  href: "/contacto" },
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
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)"; }}
            >
              {item.label}
            </Link>
          ) : (
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                color: activeDropdown === item.label ? "white" : "rgba(255,255,255,0.85)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {item.label}
              {item.children && (
                <motion.svg
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="m6 9 6 6 6-6" />
                </motion.svg>
              )}
            </button>
          )}

          {/* Dropdown */}
          <AnimatePresence>
            {item.children && activeDropdown === item.label && (
              <motion.div
                className="absolute top-full left-0 pt-2 min-w-64 z-50"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "#ffffff",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 20px 60px rgba(29,78,216,0.12), 0 4px 16px rgba(0,0,0,0.08)",
                  }}
                >
                  {item.children.map((child, idx) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex flex-col px-4 py-3 transition-all duration-150"
                      style={{
                        borderBottom: idx < (item.children?.length ?? 0) - 1 ? "1px solid #F3F4F6" : "none",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#F0F7FF"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                    >
                      <span className="text-sm font-semibold" style={{ color: "#111827" }}>
                        {child.label}
                      </span>
                      <span
                        className="text-xs mt-0.5"
                        style={{ fontFamily: "var(--font-jetbrains, monospace)", color: "#6B7280" }}
                      >
                        {child.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}