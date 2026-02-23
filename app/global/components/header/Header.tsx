"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NavMenu } from "./NavMenu";
import { CartButton } from "./CartButton";
import { CraftqubeLogo } from "./CraftqubeLogo";

const mobileLinks = [
  { label: "Perfiles", href: "/productos/perfiles" },
  { label: "Accesorios", href: "/productos/accesorios" },
  { label: "Tornillería", href: "/productos/tornilleria" },
  { label: "Automatización", href: "/automatizacion" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? "rgba(2, 11, 24, 0.95)"
          : "rgba(2, 11, 24, 0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${
          scrolled
            ? "rgba(23, 53, 128, 0.5)"
            : "rgba(23, 53, 128, 0.2)"
        }`,
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.5)" : "none",
      }}
    >
      {/* Announcement bar */}
      <div
        className="text-center py-2 text-xs tracking-widest"
        style={{
          fontFamily: "var(--font-mono)",
          background:
            "linear-gradient(90deg, var(--color-cq-800), var(--color-cq-700), var(--color-cq-800))",
          color: "var(--color-cq-accent)",
          borderBottom: "1px solid rgba(0, 212, 255, 0.1)",
        }}
      >
        ⚡ ENVÍO GRATIS en pedidos mayores a $5,000 MXN · ISO 9001 CERTIFICADO
        · SOPORTE TÉCNICO 24/7
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <CraftqubeLogo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavMenu />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200"
              style={{
                borderRadius: "2px",
                background: "rgba(23, 53, 128, 0.2)",
                border: "1px solid var(--color-cq-800)",
                color: "var(--color-cq-steel-400)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--color-cq-600)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--color-cq-200)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--color-cq-800)";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "var(--color-cq-steel-400)";
              }}
              aria-label="Buscar productos"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span
                className="hidden md:block text-xs tracking-wider"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                BUSCAR
              </span>
            </button>

            <CartButton />

            <Link
              href="/cotizar"
              className="hidden lg:flex btn-primary text-xs tracking-widest"
            >
              COTIZAR
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 transition-colors"
              style={{
                borderRadius: "2px",
                background: mobileOpen ? "var(--color-cq-800)" : "transparent",
                border: "1px solid var(--color-cq-800)",
                color: "var(--color-cq-200)",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
              aria-expanded={mobileOpen}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {mobileOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            background: "rgba(2, 11, 24, 0.98)",
            borderTop: "1px solid var(--color-cq-800)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-2">
            {mobileLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-semibold tracking-wider transition-colors"
                style={{
                  color: "var(--color-cq-200)",
                  borderBottom: "1px solid var(--color-cq-900)",
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/cotizar"
              className="btn-primary mt-4 justify-center text-xs tracking-widest"
              onClick={() => setMobileOpen(false)}
            >
              SOLICITAR COTIZACIÓN
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}