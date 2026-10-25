// shared/components/header/MenuMovil.tsx
// Sidebar de navegación para teléfono: entra desde la izquierda con overlay.
// Va en un portal a <body> para quedar por encima de todo, no dentro del header.
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CraftqubeLogo } from "./CraftqubeLogo";
import type { CategoriaNav } from "@/features/categories/lib/getCategorias";

interface MenuMovilProps {
  abierto: boolean;
  onCerrar: () => void;
  categorias: CategoriaNav[];
  contactoActivo: boolean;
}

const enlacesTienda = [
  { label: "Nosotros",           href: "/about/nosotros" },
  { label: "Preguntas frecuentes", href: "/about/faq" },
  { label: "Contacto",           href: "/contacto" },
];

const estiloSeccion = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.65rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.45)",
};

export function MenuMovil({ abierto, onCerrar, categorias, contactoActivo }: MenuMovilProps) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  /* Escape cierra y el fondo no se desplaza mientras está abierto */
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", onKey);
    };
  }, [abierto, onCerrar]);

  if (!montado) return null;

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            key="menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCerrar}
            className="fixed inset-0 z-[60] md:hidden"
            style={{ background: "rgba(0,0,0,0.5)" }}
          />

          <motion.aside
            key="menu-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 38 }}
            className="fixed left-0 top-0 bottom-0 z-[61] flex flex-col md:hidden"
            style={{
              width: "min(320px, 85vw)",
              background: "var(--color-cq-primary)",
              boxShadow: "12px 0 48px rgba(0,0,0,0.3)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
          >
            {/* Cabecera */}
            <div
              className="flex items-center justify-between px-5 shrink-0"
              style={{ height: 64, borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Link href="/" onClick={onCerrar} style={{ textDecoration: "none" }}>
                <CraftqubeLogo />
              </Link>
              <button
                onClick={onCerrar}
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", color: "white" }}
                aria-label="Cerrar menú"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Enlaces */}
            <nav className="flex-1 overflow-y-auto px-3 py-5 min-h-0">
              <p className="px-3 mb-2" style={estiloSeccion}>Productos</p>
              <div className="flex flex-col gap-0.5 mb-6">
                {categorias.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categoria/${cat.slug}`}
                    onClick={onCerrar}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-white/10"
                    style={{ color: "rgba(255,255,255,0.9)", textDecoration: "none" }}
                  >
                    {cat.nombre}
                    {cat.total_productos > 0 && (
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", fontWeight: 500 }}>
                        {cat.total_productos}
                      </span>
                    )}
                  </Link>
                ))}
                <Link
                  href="/catalogo"
                  onClick={onCerrar}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-white/10"
                  style={{ color: "white", textDecoration: "none" }}
                >
                  Ver todo el catálogo
                  <i className="fa-solid fa-arrow-right text-xs" />
                </Link>
              </div>

              <p className="px-3 mb-2" style={estiloSeccion}>La tienda</p>
              <div className="flex flex-col gap-0.5">
                {enlacesTienda
                  .filter((e) => e.href !== "/contacto" || contactoActivo)
                  .map((e) => (
                    <Link
                      key={e.href}
                      href={e.href}
                      onClick={onCerrar}
                      className="px-3 py-2.5 rounded-lg text-sm font-semibold active:bg-white/10"
                      style={{ color: "rgba(255,255,255,0.9)", textDecoration: "none" }}
                    >
                      {e.label}
                    </Link>
                  ))}
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
