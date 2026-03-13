// app/global/components/header/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname }  from "next/navigation";
import Link             from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavMenu }        from "./NavMenu";
import { CartButton }     from "./CartButton";
import { UserButton }     from "./UserButton";
import { CraftqubeLogo }  from "./CraftqubeLogo";
import type { CategoriaNav } from "@/app/global/lib/db/getCategorias";

// Re-export del tipo para consumidores externos
export type { CategoriaNav };

interface HeaderProps {
  /** Categorías pre-fetched en el Server Component del layout. */
  initialCategorias?: CategoriaNav[];
}

const mobileLinks = [
  { label: "Perfiles",    href: "/productos/perfiles" },
  { label: "Accesorios",  href: "/productos/accesorios" },
  { label: "Tornillería", href: "/productos/tornilleria" },
  { label: "Nosotros",    href: "/nosotros" },
  { label: "Contacto",    href: "/contacto" },
];

/* ── Header simplificado solo para checkout ──────────────── */
function CheckoutOnlyHeader() {
  return (
    <header
      className="sticky top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "#1224a0",
        boxShadow: "0 4px 24px rgba(18,36,160,0.5)",
      }}
    >
      <div className="flex items-center justify-center" style={{ height: 64 }}>
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

/* ── Export principal ────────────────────────────────────── */
export function Header({ initialCategorias = [] }: HeaderProps) {
  const pathname = usePathname();
  if (pathname === "/checkout") return <CheckoutOnlyHeader />;
  return <FullHeader initialCategorias={initialCategorias} />;
}

/* ── Header completo ─────────────────────────────────────── */
function FullHeader({ initialCategorias }: Required<HeaderProps>) {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  // Categorías listas desde el servidor — sin fetch client-side
  const [categorias, setCategorias] = useState<CategoriaNav[]>(initialCategorias);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef      = useRef<HTMLElement>(null);

  /* Foco al abrir search */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  /* Fallback fetch — solo si el prop llegó vacío (ej. error de DB en SSR) */
  useEffect(() => {
    if (categorias.length > 0) return; // ya tenemos datos, no fetchar
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((j) => { if (j.success) setCategorias(j.data); })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Cerrar al click fuera del header */
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setSearchOpen(false);
        setProductsOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggleProducts = () => setProductsOpen((p) => !p);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "#1224a0",
        boxShadow: "0 4px 24px rgba(18,36,160,0.5)",
      }}
    >
      {/* ── Barra principal ── */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between"
        style={{ height: 64 }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.97 }}>
            <CraftqubeLogo />
          </motion.div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center">
          <NavMenu
            productsOpen={productsOpen}
            onToggleProducts={toggleProducts}
          />
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Search icon */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setSearchOpen((p) => !p); setProductsOpen(false); }}
            className="flex items-center justify-center w-9 h-9 rounded-lg"
            style={{
              background: searchOpen ? "rgba(255,255,255,0.12)" : "transparent",
              border: "none", cursor: "pointer", color: "white",
            }}
            aria-label="Buscar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </motion.button>

          <CartButton />
          <UserButton />

          {/* Hamburger mobile */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setMobileOpen((p) => !p); setProductsOpen(false); }}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-lg"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "white" }}
            aria-label="Menú"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2">
              {mobileOpen
                ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
            </svg>
          </motion.button>
        </div>
      </div>

      {/* ── Panel Productos desktop ── */}
      <AnimatePresence>
        {productsOpen && (
          <motion.div
            key="products-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "#0f1fa8",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              padding: "24px 0 28px",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              {categorias.length === 0 ? (
                /* Skeleton mínimo — sólo si el fallback fetch aún no resolvió */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl"
                      style={{ background: "rgba(255,255,255,0.06)", height: 76 }}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categorias.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <Link
                        href={`/catalogo?cat=${cat.slug}`}
                        onClick={() => setProductsOpen(false)}
                        className="flex flex-col gap-1 rounded-xl p-4 transition-colors"
                        style={{
                          textDecoration: "none",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                        }}
                      >
                        <span style={{ color: "white", fontWeight: 600, fontSize: "0.88rem" }}>
                          {cat.nombre}
                        </span>
                        {cat.total_productos > 0 && (
                          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem" }}>
                            {cat.total_productos} producto{cat.total_productos !== 1 ? "s" : ""}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Ver todo */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categorias.length * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href="/catalogo"
                      onClick={() => setProductsOpen(false)}
                      className="flex flex-col justify-center items-center gap-1 rounded-xl p-4 transition-colors"
                      style={{
                        textDecoration: "none",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px dashed rgba(255,255,255,0.15)",
                        height: "100%",
                        minHeight: 76,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)";
                      }}
                    >
                      <span style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "0.82rem" }}>
                        Ver todo el catálogo →
                      </span>
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Barra de búsqueda ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-bar"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              background: "#0f1fa8",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = searchInputRef.current?.value?.trim();
                  if (q) window.location.href = `/catalogo?q=${encodeURIComponent(q)}`;
                }}
                className="flex gap-2"
              >
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Buscar productos, SKU, categoría…"
                  className="flex-1 rounded-lg px-4 py-2 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "white", color: "#1224a0", border: "none", cursor: "pointer" }}
                >
                  Buscar
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Menú mobile ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              background: "#0f1fa8",
            }}
            className="md:hidden"
          >
            <div className="flex flex-col px-4 py-4 gap-1">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}