// app/global/components/header/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NavMenu }       from "./NavMenu";
import { CartButton }    from "./CartButton";
import { UserButton }    from "./UserButton";
import { CraftqubeLogo } from "./CraftqubeLogo";

interface CategoriaDB {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  total_productos: number;
}

const mobileLinks = [
  { label: "Perfiles",    href: "/productos/perfiles" },
  { label: "Accesorios",  href: "/productos/accesorios" },
  { label: "Tornillería", href: "/productos/tornilleria" },
  { label: "Nosotros",    href: "/nosotros" },
  { label: "Contacto",    href: "/contacto" },
];

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

/* ── Header simplificado solo para checkout ───────────────── */
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

/* ── Export principal ─────────────────────────────────────── */
export function Header() {
  const pathname = usePathname();
  if (pathname === "/checkout") return <CheckoutOnlyHeader />;
  return <FullHeader />;
}

/* ── Header completo ──────────────────────────────────────── */
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
    if (productsOpen && !catsLoaded) {
      setCatsLoaded(true);
      fetch("/api/categorias")
        .then((r) => r.json())
        .then((j) => { if (j.success) setCategorias(j.data); })
        .catch(() => {});
    }
  }, [productsOpen, catsLoaded]);

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

  const handleToggleProducts = () => { setProductsOpen((v) => !v);  setSearchOpen(false); setMobileOpen(false); };
  const handleToggleSearch   = () => { setSearchOpen((v) => !v);    setProductsOpen(false); setMobileOpen(false); };
  const handleToggleMobile   = () => { setMobileOpen((v) => !v);    setProductsOpen(false); setSearchOpen(false); };

  return (
    <motion.header
      ref={headerRef as React.RefObject<HTMLElement>}
      className="sticky top-0 left-0 right-0 z-50"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      style={{ backgroundColor: "#1224a0", boxShadow: "0 4px 24px rgba(18,36,160,0.5)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex-shrink-0" onClick={() => setProductsOpen(false)}>
            <CraftqubeLogo />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <NavMenu productsOpen={productsOpen} onToggleProducts={handleToggleProducts} />
          </nav>

          <div className="flex items-center gap-2">
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

            <UserButton />
            <CartButton />

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
                  : <><path d="M4 12h16M4 6h16M4 18h16"/></>
                }
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(180deg, rgba(18,36,160,0.97) 0%, rgba(18,36,160,0.95) 100%)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Buscar productos..."
                className="w-full px-5 py-3 rounded-xl text-base"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white", outline: "none",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    window.location.href = `/catalogo?q=${encodeURIComponent(e.currentTarget.value.trim())}`;
                  }
                }}
              />
            </div>
          </motion.div>
        )}

        {productsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: "linear-gradient(180deg, rgba(18,36,160,0.97) 0%, rgba(18,36,160,0.94) 100%)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <p className="text-xs tracking-widest uppercase mb-4"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                Categorías
              </p>
              {!catsLoaded || !categorias.length ? (
                <CatSkeleton />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categorias.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/productos/${cat.slug}`}
                      onClick={() => setProductsOpen(false)}
                      className="group rounded-xl p-4 transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)";
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm" style={{ color: "white" }}>
                          {cat.nombre}
                        </span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {cat.total_productos}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              background: "linear-gradient(180deg, rgba(18,36,160,0.97) 0%, rgba(18,36,160,0.95) 100%)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              <nav className="flex flex-col gap-1">
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-base font-semibold transition-colors"
                    style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "white";
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)";
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}