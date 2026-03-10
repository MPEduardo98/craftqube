// app/global/components/header/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavMenu }       from "./NavMenu";
import { CartButton }    from "./CartButton";
import { CraftqubeLogo } from "./CraftqubeLogo";

/* ─── Types ───────────────────────────────────────────────── */
interface CategoriaDB {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  total_productos: number;
}

/* ─── Mobile links ────────────────────────────────────────── */
const mobileLinks = [
  { label: "Perfiles",    href: "/productos/perfiles" },
  { label: "Accesorios",  href: "/productos/accesorios" },
  { label: "Tornillería", href: "/productos/tornilleria" },
  { label: "Nosotros",    href: "/nosotros" },
  { label: "Contacto",    href: "/contacto" },
];

/* ─── Skeleton categoría ──────────────────────────────────── */
function CatSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl p-4"
          style={{ background: "rgba(255,255,255,0.06)", height: "76px" }} />
      ))}
    </div>
  );
}

/* ─── Header checkout — solo logo centrado ────────────────── */
function CheckoutOnlyHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "#1224a0",
        boxShadow: "0 4px 24px rgba(18,36,160,0.5)",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ height: 64 }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ opacity: 0.8 }}
            whileTap={{ scale: 0.97 }}
          >
            <CraftqubeLogo />
          </motion.div>
        </Link>
      </div>
    </header>
  );
}

/* ─── Header principal ────────────────────────────────────── */
export function Header() {
  const pathname = usePathname();

  /* Modo checkout — solo logo */
  if (pathname === "/checkout") {
    return <CheckoutOnlyHeader />;
  }

  return <FullHeader />;
}

/* ─── Full Header ─────────────────────────────────────────── */
function FullHeader() {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [categorias,   setCategorias]   = useState<CategoriaDB[]>([]);
  const [catsLoaded,   setCatsLoaded]   = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef      = useRef<HTMLElement>(null);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  useEffect(() => {
    const anyPanelOpen = productsOpen || searchOpen;
    if (!anyPanelOpen) return;

    const closeAll = () => { setSearchOpen(false); setProductsOpen(false); };
    const onKey          = (e: KeyboardEvent) => { if (e.key === "Escape") closeAll(); };
    const onClickOutside = (e: MouseEvent)    => { if (headerRef.current && !headerRef.current.contains(e.target as Node)) closeAll(); };
    const startY         = window.scrollY;
    const onScroll       = () => { if (Math.abs(window.scrollY - startY) > 8) closeAll(); };
    const onResize       = () => closeAll();

    window.addEventListener("keydown",    onKey);
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll",     onScroll, { passive: true });
    window.addEventListener("resize",     onResize);
    return () => {
      window.removeEventListener("keydown",    onKey);
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll",     onScroll);
      window.removeEventListener("resize",     onResize);
    };
  }, [productsOpen, searchOpen]);

  useEffect(() => {
    if (catsLoaded) return;
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCategorias(json.data); })
      .catch(() => {})
      .finally(() => setCatsLoaded(true));
  }, [catsLoaded]);

  const handleToggleProducts = () => { setProductsOpen((v) => !v); setSearchOpen(false); setMobileOpen(false); };
  const handleToggleSearch   = () => { setSearchOpen((v) => !v);   setProductsOpen(false); setMobileOpen(false); };
  const handleToggleMobile   = () => { setMobileOpen((v) => !v);   setProductsOpen(false); setSearchOpen(false); };

  return (
    <motion.header
      ref={headerRef as React.RefObject<HTMLElement>}
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      style={{ backgroundColor: "#1224a0", boxShadow: "0 4px 24px rgba(18,36,160,0.5)" }}
    >
      {/* ── Barra principal ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0" onClick={() => setProductsOpen(false)}>
            <CraftqubeLogo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavMenu productsOpen={productsOpen} onToggleProducts={handleToggleProducts} />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={handleToggleSearch}
              className="flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: searchOpen ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white", cursor: "pointer",
              }}
              aria-label="Buscar"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </motion.button>

            {/* Cart */}
            <CartButton />

            {/* Mobile hamburger */}
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={handleToggleMobile}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "white", cursor: "pointer",
              }}
              aria-label="Menú"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen
                  ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                  : <><line x1="4" x2="20" y1="6"  y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></>
                }
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Panel búsqueda ────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
            style={{ background: "rgba(18,36,160,0.97)", borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <form onSubmit={(e) => { e.preventDefault(); const q = searchInputRef.current?.value; if (q) window.location.href = `/catalogo?q=${encodeURIComponent(q)}`; }}>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar productos, categorías, SKUs..."
                    className="w-full rounded-xl px-5 py-3 pr-12 text-sm outline-none"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                      fontFamily: "var(--font-body)",
                    }}
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.6)", cursor: "pointer", background: "none", border: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Panel productos desktop ───────────────────────── */}
      <AnimatePresence>
        {productsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
            style={{ background: "rgba(16,32,140,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                  Categorías de productos
                </p>
                <Link href="/catalogo" onClick={() => setProductsOpen(false)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
                  Ver todo →
                </Link>
              </div>
              {!catsLoaded ? <CatSkeleton /> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categorias.map((cat) => (
                    <Link key={cat.id} href={`/catalogo?cat=${cat.slug}`} onClick={() => setProductsOpen(false)}
                      style={{ textDecoration: "none" }}>
                      <motion.div whileHover={{ background: "rgba(255,255,255,0.1)", scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", color: "white", marginBottom: 4 }}>
                          {cat.nombre}
                        </p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>
                          {cat.total_productos} producto{cat.total_productos !== 1 ? "s" : ""}
                        </p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Menú mobile ───────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden"
            style={{ background: "rgba(16,32,140,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {/* Categorías */}
              <div className="flex flex-col gap-0.5 mb-2">
                {mobileLinks.filter((l) => !l.href.includes("nosotros") && !l.href.includes("contacto")).map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mx-4 mb-3" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />
              <div className="flex flex-col gap-0.5">
                {[
                  { label: "Ver catálogo completo", href: "/catalogo" },
                  { label: "Nosotros",              href: "/nosotros" },
                  { label: "Contacto",              href: "/contacto" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
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