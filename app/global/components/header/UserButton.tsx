// app/global/components/header/UserButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/app/global/context/AuthContext";

export function UserButton() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { usuario, autenticado, logout } = useAuth();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-lg"
        style={{
          background: dropdownOpen ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "white",
          cursor: "pointer",
        }}
        aria-label="Usuario"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden"
            style={{
              background: "rgba(18,36,160,0.98)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {autenticado ? (
              <>
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm font-semibold text-white truncate">
                    {usuario?.nombre} {usuario?.apellido}
                  </p>
                  <p className="text-xs text-white/60 truncate mt-0.5">
                    {usuario?.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/cuenta"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 transition-colors"
                    style={{ textDecoration: "none" }}
                  >
                    Mi Cuenta
                  </Link>
                  <Link
                    href="/cuenta/pedidos"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 transition-colors"
                    style={{ textDecoration: "none" }}
                  >
                    Mis Pedidos
                  </Link>
                  <Link
                    href="/cuenta/wishlist"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 transition-colors"
                    style={{ textDecoration: "none" }}
                  >
                    Lista de Deseos
                  </Link>
                </div>

                <div className="border-t border-white/10 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 transition-colors"
                    style={{ background: "none", border: "none", cursor: "pointer" }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="py-1">
                <Link
                  href="/login"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 text-sm text-white/85 hover:bg-white/10 transition-colors"
                  style={{ textDecoration: "none" }}
                >
                  Crear Cuenta
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}