// app/(main)/cuenta/components/AccountLayout.tsx
"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/app/global/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Section = "perfil" | "pedidos" | "favoritos" | "direcciones";

const NAV_ITEMS: { key: Section; label: string; icon: string; description: string; href: string }[] = [
  { key: "perfil",      label: "Perfil",      icon: "fa-solid fa-user",         description: "Datos personales y facturación", href: "/cuenta" },
  { key: "pedidos",     label: "Pedidos",     icon: "fa-solid fa-box",          description: "Historial de compras",           href: "/cuenta/pedidos" },
  { key: "favoritos",   label: "Favoritos",   icon: "fa-solid fa-heart",        description: "Productos guardados",            href: "/cuenta/favoritos" },
  { key: "direcciones", label: "Direcciones", icon: "fa-solid fa-location-dot", description: "Envíos y facturación",           href: "/cuenta/direcciones" },
];

function getActiveFromPath(pathname: string): Section {
  if (pathname.startsWith("/cuenta/pedidos"))     return "pedidos";
  if (pathname.startsWith("/cuenta/favoritos"))   return "favoritos";
  if (pathname.startsWith("/cuenta/direcciones")) return "direcciones";
  return "perfil";
}

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
  children: React.ReactNode;
}

export function AccountLayout({ children }: Props) {
  const { autenticado, cargando, usuario, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const active   = getActiveFromPath(pathname);
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
          <div style={{ position: "sticky", top: 80, padding: "24px 12px 24px 0" }}>

            {/* User card */}
            <div
              className="rounded-xl p-4 mb-3"
              style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
            >
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
            <nav className="flex flex-col gap-1 mb-3">
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.key;
                return (
                  <motion.button
                    key={item.key}
                    onClick={() => router.push(item.href)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left"
                    style={{
                      background: isActive ? "var(--color-cq-primary)" : "transparent",
                      border: "none", cursor: "pointer",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: isActive ? "rgba(255,255,255,0.18)" : "var(--color-cq-surface)",
                      border: isActive ? "none" : "1px solid var(--color-cq-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className={item.icon} style={{
                        fontSize: "0.72rem",
                        color: isActive ? "white" : "var(--color-cq-muted)",
                      }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontFamily: "var(--font-body)", fontSize: "0.83rem", fontWeight: 600,
                        color: isActive ? "white" : "var(--color-cq-text)",
                        margin: 0, lineHeight: 1.2,
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontFamily: "var(--font-body)", fontSize: "0.67rem",
                        color: isActive ? "rgba(255,255,255,0.7)" : "var(--color-cq-muted)",
                        margin: 0, marginTop: 1,
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </nav>

            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              disabled={loggingOut}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3"
              style={{
                background: "transparent", border: "none", cursor: loggingOut ? "not-allowed" : "pointer",
                opacity: loggingOut ? 0.5 : 1,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "var(--color-cq-surface)",
                border: "1px solid var(--color-cq-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {loggingOut ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                    style={{ width: 11, height: 11, borderRadius: "50%", border: "1.5px solid var(--color-cq-border)", borderTopColor: "#ef4444" }}
                  />
                ) : (
                  <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: "0.72rem", color: "#ef4444" }} />
                )}
              </div>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.83rem", fontWeight: 600,
                color: "#ef4444", margin: 0,
              }}>
                Cerrar sesión
              </p>
            </motion.button>
          </div>
        </motion.aside>

        {/* ═══════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════ */}
        <main className="flex-1 min-w-0" style={{ padding: "24px 0 48px 24px" }}>

          {/* Mobile nav tabs */}
          <div className="flex lg:hidden gap-1 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.key;
              return (
                <motion.button
                  key={item.key}
                  onClick={() => router.push(item.href)}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 whitespace-nowrap"
                  style={{
                    background: isActive ? "var(--color-cq-primary)" : "var(--color-cq-surface)",
                    border: isActive ? "none" : "1px solid var(--color-cq-border)",
                    cursor: "pointer", flexShrink: 0,
                  }}
                >
                  <i className={item.icon} style={{
                    fontSize: "0.7rem",
                    color: isActive ? "white" : "var(--color-cq-muted)",
                  }} />
                  <span style={{
                    fontFamily: "var(--font-body)", fontSize: "0.78rem", fontWeight: 600,
                    color: isActive ? "white" : "var(--color-cq-text)",
                  }}>
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Section header */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5"
          >
            <div className="flex items-center gap-3">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--color-cq-surface)",
                border: "1px solid var(--color-cq-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={currentNav.icon} style={{ fontSize: "0.8rem", color: "var(--color-cq-accent)" }} />
              </div>
              <div>
                <h1 style={{
                  fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 800,
                  color: "var(--color-cq-text)", margin: 0, lineHeight: 1.2,
                }}>
                  {currentNav.label}
                </h1>
                <p style={{
                  fontFamily: "var(--font-body)", fontSize: "0.75rem",
                  color: "var(--color-cq-muted)", margin: 0, marginTop: 2,
                }}>
                  {currentNav.description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}