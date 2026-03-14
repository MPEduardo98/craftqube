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
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-3 w-64"
            style={{
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.04)",
              overflow: "hidden",
            }}
          >
            {autenticado ? (
              <>
                {/* User info */}
                <div style={{ padding: "16px 16px 12px" }}>
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1224a0 0%, #2563eb 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "10px",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "white",
                  }}>
                    {usuario?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ 
                    fontSize: "14px", 
                    fontWeight: 600, 
                    color: "#171717",
                    margin: 0,
                    lineHeight: 1.3,
                  }}>
                    {usuario?.nombre} {usuario?.apellido}
                  </p>
                  <p style={{ 
                    fontSize: "12px", 
                    color: "#737373",
                    margin: "2px 0 0",
                    lineHeight: 1.3,
                  }}>
                    {usuario?.email}
                  </p>
                </div>

                <div style={{ height: "1px", background: "#f0f0f0", margin: "0 12px" }} />

                {/* Menu items */}
                <div style={{ padding: "8px" }}>
                  <DropdownItem 
                    href="/cuenta" 
                    onClick={() => setDropdownOpen(false)}
                    icon={<UserIcon />}
                  >
                    Mi Cuenta
                  </DropdownItem>
                  <DropdownItem 
                    href="/cuenta/pedidos" 
                    onClick={() => setDropdownOpen(false)}
                    icon={<OrderIcon />}
                  >
                    Pedidos
                  </DropdownItem>
                  <DropdownItem 
                    href="/cuenta/wishlist" 
                    onClick={() => setDropdownOpen(false)}
                    icon={<HeartIcon />}
                  >
                    Favoritos
                  </DropdownItem>
                </div>

                <div style={{ height: "1px", background: "#f0f0f0", margin: "0 12px" }} />

                {/* Logout */}
                <div style={{ padding: "8px" }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 12px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#dc2626",
                      background: "none",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "background 0.12s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                  >
                    <LogoutIcon />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: "8px" }}>
                <DropdownItem 
                  href="/login" 
                  onClick={() => setDropdownOpen(false)}
                  icon={<LoginIcon />}
                >
                  Iniciar Sesión
                </DropdownItem>
                <DropdownItem 
                  href="/registro" 
                  onClick={() => setDropdownOpen(false)}
                  icon={<UserPlusIcon />}
                >
                  Crear Cuenta
                </DropdownItem>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropdownItem({ href, onClick, icon, children }: { 
  href: string; 
  onClick: () => void; 
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 12px",
        fontSize: "13px",
        fontWeight: 500,
        color: "#171717",
        textDecoration: "none",
        borderRadius: "8px",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {icon}
      {children}
    </Link>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
      <polyline points="10 17 15 12 10 7"/>
      <line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <line x1="20" y1="8" x2="20" y2="14"/>
      <line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  );
} 