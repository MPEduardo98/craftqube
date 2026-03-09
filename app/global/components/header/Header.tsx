// app/global/components/header/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavMenu } from "./NavMenu";
import { CartButton } from "./CartButton";
import { CraftqubeLogo } from "./CraftqubeLogo";

/* ─── Types ───────────────────────────────────────────────── */
interface CategoriaDB {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  total_productos: number;
}

/* ─── Mobile links (sin Proyectos) ───────────────────────── */
const mobileLinks = [
  { label: "Perfiles",    href: "/productos/perfiles" },
  { label: "Accesorios",  href: "/productos/accesorios" },
  { label: "Tornillería", href: "/productos/tornilleria" },
  { label: "Nosotros",    href: "/nosotros" },
  { label: "Contacto",    href: "/contacto" },
];

/* ─── Skeleton categoria ──────────────────────────────────── */
function CatSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl p-4"
          style={{ background: "rgba(255,255,255,0.06)", height: "76px" }}
        />
      ))}
    </div>
  );
}

/* ─── Header ──────────────────────────────────────────────── */
export function Header() {
  
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const [categorias, setCategorias]     = useState<CategoriaDB[]>([]);
  const [catsLoaded, setCatsLoaded]     = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef      = useRef<HTMLElement>(null);

  /* ── Focus search al abrir ── */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  /* ── Cierre global: Escape, scroll, resize, click fuera ── */
  useEffect(() => {
    const anyPanelOpen = productsOpen || searchOpen;
    if (!anyPanelOpen) return;

    const closeAll = () => {
      setSearchOpen(false);
      setProductsOpen(false);
    };

    // Escape
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };

    // Click fuera del header
    const onClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        closeAll();
      }
    };

    // Scroll (umbral de 8px para no cerrar por micro-movimientos)
    const startY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > 8) closeAll();
    };

    // Resize (cambio de breakpoint cierra paneles)
    const onResize = () => closeAll();

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [productsOpen, searchOpen]);

  /* ── Fetch categorías (solo una vez) ── */
  useEffect(() => {
    if (catsLoaded) return;
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategorias(json.data); })
      .catch(() => {})
      .finally(() => setCatsLoaded(true));
  }, [catsLoaded]);

  /* ── Toggle productos: cierra lo demás ── */
  const handleToggleProducts = () => {
    setProductsOpen((v) => !v);
    setSearchOpen(false);
    setMobileOpen(false);
  };

  /* ── Toggle search: cierra lo demás ── */
  const handleToggleSearch = () => {
    setSearchOpen((v) => !v);
    setProductsOpen(false);
    setMobileOpen(false);
  };

  /* ── Toggle mobile: cierra lo demás ── */
  const handleToggleMobile = () => {
    setMobileOpen((v) => !v);
    setProductsOpen(false);
    setSearchOpen(false);
  };

  return (
    <motion.header
      ref={headerRef as React.RefObject<HTMLElement>}
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      style={{
        backgroundColor: "#1224a0",
        boxShadow: "0 4px 24px rgba(18,36,160,0.5)",
      }}
    >
      {/* ── Barra principal ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0" onClick={() => setProductsOpen(false)}>
            <CraftqubeLogo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavMenu
              productsOpen={productsOpen}
              onToggleProducts={handleToggleProducts}
            />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Search toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleSearch}
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: searchOpen ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                cursor: "pointer",
              }}
              aria-label="Buscar"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </motion.button>

            {/* Cart */}
            <CartButton />

            {/* Mobile hamburger */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleToggleMobile}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white",
                cursor: "pointer",
              }}
              aria-label="Menú"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen
                  ? <path d="M18 6 6 18M6 6l12 12" />
                  : <path d="M3 12h18M3 6h18M3 18h18" />
                }
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Panel: Productos (desktop) ───────────────────────── */}
      <AnimatePresence>
        {productsOpen && (
          <motion.div
            key="products-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{
              background: "#1224a0",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

              {/* Header del panel */}
              <div className="flex items-center justify-between mb-5">
                <p
                  className="text-xs tracking-widest uppercase"
                  style={{
                    fontFamily: "var(--font-jetbrains, monospace)",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  Categorías de productos
                </p>
                <Link
                  href="/catalogo"
                  onClick={() => setProductsOpen(false)}
                  className="text-xs font-semibold transition-colors"
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    textDecoration: "none",
                    fontFamily: "var(--font-jetbrains, monospace)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)"; }}
                >
                  Ver catálogo completo →
                </Link>
              </div>

              {/* Grid de categorías */}
              {!catsLoaded ? (
                <CatSkeleton />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categorias.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <Link
                        href={`/productos/${cat.slug}`}
                        onClick={() => setProductsOpen(false)}
                        className="group flex flex-col gap-1 px-4 py-3 rounded-xl transition-all duration-150"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.13)";
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
                        }}
                      >
                        <span
                          className="text-sm font-semibold leading-snug"
                          style={{
                            color: "rgba(255,255,255,0.9)",
                            fontFamily: "var(--font-display, sans-serif)",
                          }}
                        >
                          {cat.nombre}
                        </span>
                        {cat.total_productos > 0 && (
                          <span
                            className="text-xs"
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              fontFamily: "var(--font-jetbrains, monospace)",
                            }}
                          >
                            {cat.total_productos} producto{cat.total_productos !== 1 ? "s" : ""}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Panel: Search ───────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-panel"
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
                <svg
                  width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2"
                  className="flex-shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar perfiles, tornillería, accesorios..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: "white", fontFamily: "var(--font-body)" }}
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

      {/* ── Panel: Mobile menu ──────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-panel"
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

              {/* Categorías dinámicas en mobile */}
              <p
                className="text-xs tracking-widest uppercase px-4 mb-2"
                style={{
                  fontFamily: "var(--font-jetbrains, monospace)",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                Productos
              </p>
              <div className="flex flex-col gap-0.5 mb-3">
                {catsLoaded ? categorias.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/productos/${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.75)";
                    }}
                  >
                    {cat.nombre}
                  </Link>
                )) : mobileLinks.filter(l => !l.href.includes("nosotros") && !l.href.includes("contacto")).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Separador */}
              <div
                className="mx-4 mb-3"
                style={{ height: "1px", background: "rgba(255,255,255,0.08)" }}
              />

              {/* Links generales */}
              <div className="flex flex-col gap-0.5">
                {[
                  { label: "Ver catálogo completo", href: "/catalogo" },
                  { label: "Nosotros",              href: "/nosotros" },
                  { label: "Contacto",              href: "/contacto" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.1)";
                      (e.currentTarget as HTMLAnchorElement).style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                      (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)";
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}