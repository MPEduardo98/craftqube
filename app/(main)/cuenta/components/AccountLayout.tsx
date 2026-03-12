// app/(main)/cuenta/components/AccountLayout.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/global/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type Section = "perfil" | "pedidos" | "favoritos" | "direcciones";

const NAV_ITEMS: { key: Section; label: string; icon: string; description: string }[] = [
  { key: "perfil",      label: "Perfil",      icon: "fa-solid fa-user",         description: "Datos personales y facturación" },
  { key: "pedidos",     label: "Pedidos",     icon: "fa-solid fa-box",          description: "Historial de compras" },
  { key: "favoritos",   label: "Favoritos",   icon: "fa-solid fa-heart",        description: "Productos guardados" },
  { key: "direcciones", label: "Direcciones", icon: "fa-solid fa-location-dot", description: "Envíos y facturación" },
];

function UserAvatar({ nombre, size = 40 }: { nombre?: string; size?: number }) {
  const initials = nombre
    ? nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #1224a0 0%, #2563eb 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "white",
      letterSpacing: "-0.03em", flexShrink: 0,
      fontFamily: "var(--font-display)",
    }}>
      {initials}
    </div>
  );
}

interface Props {
  active: Section;
  setActive: (s: Section) => void;
  children: React.ReactNode;
}

export function AccountLayout({ active, setActive, children }: Props) {
  const { autenticado, cargando, usuario, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!cargando && !autenticado) router.push("/login?redirect=/cuenta");
  }, [autenticado, cargando, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout?.(); router.push("/"); }
    finally { setLoggingOut(false); }
  };

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-cq-bg)" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid var(--color-cq-border)", borderTopColor: "var(--color-cq-accent)", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  if (!autenticado) return null;

  const currentNav = NAV_ITEMS.find((i) => i.key === active)!;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" crossOrigin="anonymous" />

      {/* ── Layout centrado ── */}
      <div className="mx-auto flex min-h-screen" style={{ maxWidth: 1280 }}>

        {/* ═══════════════════════════════
            SIDEBAR — solo desktop
        ═══════════════════════════════ */}
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block"
          style={{ width: 280, flexShrink: 0 }}
        >
          {/* Nav sticky */}
          <div style={{ position: "sticky", top: 80, padding: "24px 12px 24px 0" }}>

            {/* User card */}
            <div
              className="rounded-xl p-4 mb-3"
              style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
            >
              {/* Avatar + nombre */}
              <div className="flex items-center gap-3">
                <UserAvatar nombre={usuario?.nombre} size={40} />
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 700,
                    color: "var(--color-cq-text)", whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {usuario?.nombre} {usuario?.apellido}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-body)", fontSize: "0.68rem",
                    color: "var(--color-cq-muted)", whiteSpace: "nowrap",
                    overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {usuario?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav
              className="rounded-xl overflow-hidden mb-3"
              style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
            >
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.2em",
                textTransform: "uppercase", color: "var(--color-cq-muted-2)",
                padding: "12px 14px 6px",
              }}>
                Mi cuenta
              </p>

              {NAV_ITEMS.map((item) => {
                const isActive = active === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActive(item.key)}
                    className="relative flex items-center gap-3 w-full text-left"
                    style={{
                      padding: "11px 14px",
                      background: "transparent",
                      border: "none",
                      borderLeft: isActive ? "2px solid var(--color-cq-accent)" : "2px solid transparent",
                      cursor: "pointer",
                      backgroundColor: isActive ? "rgba(37,99,235,0.05)" : "transparent",
                    }}
                  >
                    {/* Icon box */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isActive ? "rgba(37,99,235,0.12)" : "var(--color-cq-bg)",
                      border: `1px solid ${isActive ? "rgba(37,99,235,0.25)" : "var(--color-cq-border)"}`,
                    }}>
                      <i className={item.icon} style={{
                        fontSize: "0.85rem",
                        color: isActive ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
                        display: "block",
                      }} />
                    </div>

                    {/* Label + desc */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontFamily: "var(--font-body)", fontSize: "0.85rem",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "var(--color-cq-accent)" : "var(--color-cq-text)",
                        lineHeight: 1,
                        marginBottom: 2,
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontFamily: "var(--font-body)", fontSize: "0.65rem",
                        color: "var(--color-cq-muted-2)", lineHeight: 1,
                      }}>
                        {item.description}
                      </p>
                    </div>

                    {/* Chevron */}
                    <i
                      className="fa-solid fa-chevron-right"
                      style={{
                        fontSize: "0.55rem",
                        color: isActive ? "var(--color-cq-accent)" : "var(--color-cq-border)",
                        flexShrink: 0,
                      }}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
              style={{
                background: "transparent",
                border: "1px solid var(--color-cq-border)",
                cursor: loggingOut ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)", fontSize: "0.82rem",
                color: "var(--color-cq-muted)", textAlign: "left",
                opacity: loggingOut ? 0.5 : 1,
              }}
            >
              {loggingOut
                ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                    style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #ddd", borderTopColor: "#999" }} />
                : <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: "0.85rem", color: "#ef4444" }} />
              }
              <span>Cerrar sesión</span>
            </button>
          </div>
        </motion.aside>

        {/* ═══════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════ */}
        <div className="flex-1 min-w-0 flex flex-col" style={{ borderLeft: "1px solid var(--color-cq-border)" }}>

          {/* Mobile: tabs */}
          <div
            className="lg:hidden sticky z-20"
            style={{ top: 64, background: "var(--color-cq-surface)", borderBottom: "1px solid var(--color-cq-border)" }}
          >
            {/* User row mobile */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
              <UserAvatar nombre={usuario?.nombre} size={32} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                  {usuario?.nombre} {usuario?.apellido}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "var(--color-cq-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {usuario?.email}
                </p>
              </div>
              <button onClick={handleLogout} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-cq-muted)", padding: 6 }}>
                <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: "0.82rem" }} />
              </button>
            </div>
            <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none", padding: "0 4px" }}>
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.key;
                return (
                  <button key={item.key} onClick={() => setActive(item.key)}
                    className="relative flex items-center gap-2 px-4 py-3 whitespace-nowrap flex-shrink-0"
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "0.82rem", fontWeight: isActive ? 600 : 450, color: isActive ? "var(--color-cq-accent)" : "var(--color-cq-muted)" }}
                  >
                    <i className={item.icon} style={{ fontSize: "0.72rem" }} />
                    {item.label}
                    {isActive && (
                      <motion.div layoutId="mobile-tab"
                        className="absolute bottom-0 left-0 right-0"
                        style={{ height: 2, background: "var(--color-cq-accent)", borderRadius: "2px 2px 0 0" }}
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 px-6 sm:px-8 lg:px-10" style={{ paddingTop: 28, paddingBottom: 64 }}>

            {/* Page header */}
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="mb-6"
            >
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: "0.52rem",
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "var(--color-cq-muted-2)", marginBottom: 5,
              }}>
                Mi cuenta · {currentNav.label}
              </p>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                fontWeight: 800, color: "var(--color-cq-text)",
                letterSpacing: "-0.025em", lineHeight: 1.1,
              }}>
                {currentNav.label}
                <span style={{ color: "var(--color-cq-accent)" }}>.</span>
              </h1>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.82rem",
                color: "var(--color-cq-muted)", marginTop: 4,
              }}>
                {currentNav.description}
              </p>
            </motion.div>

            {/* Section content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}