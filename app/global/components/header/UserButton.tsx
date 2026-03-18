// app/global/components/header/UserButton.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence }      from "framer-motion";
import Link                             from "next/link";
import { useAuth }                      from "@/app/global/context/AuthContext";

export function UserButton() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { usuario, autenticado, logout } = useAuth();

  const esAdmin =
    usuario?.rol === "admin" || usuario?.rol === "superadmin";

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

  const close = () => setDropdownOpen(false);

  return (
    <div ref={dropdownRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setDropdownOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-lg"
        style={{
          background: dropdownOpen ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
          border:  "1px solid rgba(255,255,255,0.15)",
          color:   "white",
          cursor:  "pointer",
        }}
        aria-label="Usuario"
      >
        <i className="fa-solid fa-user" style={{ fontSize: "14px" }} />
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-64"
            style={{
              background:   "white",
              borderRadius: "16px",
              boxShadow:    "0 8px 32px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.04)",
              overflow:     "hidden",
            }}
          >
            {autenticado ? (
              <>
                {/* Avatar + nombre/email en fila */}
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #1224a0 0%, #2563eb 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "15px", fontWeight: 700, color: "white", letterSpacing: "-0.02em",
                  }}>
                    {usuario?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontSize: "13px", fontWeight: 600, color: "#171717",
                      margin: 0, lineHeight: 1.3,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {usuario?.nombre} {usuario?.apellido}
                    </p>
                    <p style={{
                      fontSize: "11px", color: "#737373", margin: "2px 0 0", lineHeight: 1.3,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {usuario?.email}
                    </p>
                  </div>
                </div>

                <div style={{ height: "1px", background: "#f0f0f0", margin: "0 12px" }} />

                <div style={{ padding: "8px" }}>
                  <DropdownItem href="/cuenta"           icon="fa-solid fa-user"    onClick={close}>Mi Cuenta</DropdownItem>
                  <DropdownItem href="/cuenta/pedidos"   icon="fa-solid fa-box"     onClick={close}>Pedidos</DropdownItem>
                  <DropdownItem href="/cuenta/favoritos" icon="fa-solid fa-heart"   onClick={close}>Favoritos</DropdownItem>

                  {esAdmin && (
                    <>
                      <div style={{ height: "1px", background: "#f0f0f0", margin: "4px 0" }} />
                      <DropdownItem href="/admin" icon="fa-solid fa-shield-halved" onClick={close} accent>
                        Panel Admin
                      </DropdownItem>
                    </>
                  )}
                </div>

                <div style={{ height: "1px", background: "#f0f0f0", margin: "0 12px" }} />

                <div style={{ padding: "8px" }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "10px",
                      padding: "9px 12px", fontSize: "13px", fontWeight: 500,
                      color: "#dc2626", background: "none", border: "none",
                      borderRadius: "8px", cursor: "pointer", transition: "background 0.12s",
                      fontFamily: "inherit", textAlign: "left",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: "13px", width: "16px", textAlign: "center" }} />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: "8px" }}>
                <DropdownItem href="/login"    icon="fa-solid fa-right-to-bracket" onClick={close}>Iniciar Sesión</DropdownItem>
                <DropdownItem href="/registro" icon="fa-solid fa-user-plus"        onClick={close}>Crear Cuenta</DropdownItem>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({
  href, icon, onClick, accent = false, children,
}: {
  href: string; icon: string; onClick: () => void;
  accent?: boolean; children: React.ReactNode;
}) {
  const color = accent ? "#2563eb" : "#171717";
  const hover = accent ? "rgba(37,99,235,0.06)" : "#f5f5f5";

  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 12px", fontSize: "13px", fontWeight: 500,
        color, textDecoration: "none", borderRadius: "8px", transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = hover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      <i className={icon} style={{ fontSize: "13px", width: "16px", textAlign: "center", opacity: accent ? 1 : 0.5 }} />
      {children}
    </Link>
  );
}