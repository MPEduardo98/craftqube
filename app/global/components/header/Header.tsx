"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        backgroundColor: scrolled ? "#1a3fa8" : "#1D4ED8",
        boxShadow: scrolled
          ? "0 4px 32px rgba(29, 78, 216, 0.35)"
          : "0 2px 12px rgba(29, 78, 216, 0.2)",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
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
          <div className="flex items-center gap-2">

            {/* Search toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSearchOpen((v) => !v)}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
              style={{
                background: searchOpen
                  ? "rgba(255,255,255,0.22)"
                  : "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "white",
              }}
              aria-label={searchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
              aria-expanded={searchOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {searchOpen ? (
                  <motion.svg
                    key="close"
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="search"
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Cart */}
            <CartButton />

            {/* Mobile burger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menú"
              aria-expanded={mobileOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Search bar expandible */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{
              background: "#1638a0",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
              <div
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" className="flex-shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar perfiles, tornillería, accesorios..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{
                    color: "white",
                    fontFamily: "var(--font-body)",
                  }}
                />
                <span
                  className="text-xs px-2 py-0.5 rounded-md flex-shrink-0 hidden sm:block"
                  style={{
                    fontFamily: "var(--font-jetbrains, monospace)",
                    color: "rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  ESC
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              background: "#1638a0",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col gap-1">
              {mobileLinks.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-4 py-3 rounded-md text-sm font-semibold tracking-wide"
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}