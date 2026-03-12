// app/(main)/cuenta/components/AccountLayout.tsx
// ─────────────────────────────────────────────────────────────
// Capa 3 de autenticación: Client Component reactivo.
// Las capas 1 y 2 ya garantizan que si llegas aquí tienes sesión.
// Este componente solo:
//   - Muestra spinner mientras AuthContext hidrata en cliente
//   - Renderiza el layout de cuenta con sidebar y nav
//   - NO hace ningún redirect (eso ya lo hicieron las capas anteriores)
// ─────────────────────────────────────────────────────────────
"use client";

import { motion }                    from "framer-motion";
import { useAuth }                   from "@/app/global/context/AuthContext";
import { useRouter, usePathname }    from "next/navigation";
import { useState }                  from "react";

type Section = "perfil" | "pedidos" | "favoritos" | "direcciones";

const NAV_ITEMS: {
  key:         Section;
  label:       string;
  icon:        string;
  description: string;
  href:        string;
}[] = [
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

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const { cargando, usuario, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const active   = getActiveFromPath(pathname);
  const [loggingOut, setLoggingOut] = useState(false);

  // Las capas 1 y 2 garantizan sesión válida antes de llegar aquí.
  // Solo esperamos a que AuthContext termine su fetch a /api/auth/me.
  if (cargando) {
    return (
      <div style={{
        minHeight:      "100vh",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        background:     "var(--color-cq-bg)",
      }}>
        <div style={{
          width:          32,
          height:         32,
          borderRadius:   "50%",
          border:         "2.5px solid var(--color-cq-border)",
          borderTopColor: "var(--color-cq-primary)",
          animation:      "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout?.();
    } finally {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        crossOrigin="anonymous"
      />

      <div className="mx-auto flex min-h-screen" style={{ maxWidth: 1280 }}>

        {/* ═══════════════════════════════════════
            SIDEBAR — solo desktop
        ═══════════════════════════════════════ */}
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
                    fontFamily:    "var(--font-display)",
                    fontSize:      "0.88rem",
                    fontWeight:    700,
                    color:         "var(--color-cq-text)",
                    whiteSpace:    "nowrap",
                    overflow:      "hidden",
                    textOverflow:  "ellipsis",
                  }}>
                    {usuario?.nombre} {usuario?.apellido}
                  </p>
                  <p style={{
                    fontFamily:   "var(--font-body)",
                    fontSize:     "0.68rem",
                    color:        "var(--color-cq-muted)",
                    whiteSpace:   "nowrap",
                    overflow:     "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {usuario?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Nav items */}
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
                      border:     "none",
                      cursor:     "pointer",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div style={{
                      width:          32,
                      height:         32,
                      borderRadius:   8,
                      flexShrink:     0,
                      background:     isActive ? "rgba(255,255,255,0.18)" : "var(--color-cq-surface)",
                      border:         isActive ? "none" : "1px solid var(--color-cq-border)",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                    }}>
                      <i
                        className={item.icon}
                        style={{
                          fontSize: "0.75rem",
                          color:    isActive ? "white" : "var(--color-cq-muted)",
                        }}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontFamily: "var(--font-display)",
                        fontSize:   "0.82rem",
                        fontWeight: 700,
                        color:      isActive ? "white" : "var(--color-cq-text)",
                        margin:     0,
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontFamily: "var(--font-body)",
                        fontSize:   "0.65rem",
                        color:      isActive ? "rgba(255,255,255,0.65)" : "var(--color-cq-muted)",
                        margin:     0,
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
                background: "transparent",
                border:     "none",
                cursor:     loggingOut ? "not-allowed" : "pointer",
                opacity:    loggingOut ? 0.5 : 1,
              }}
            >
              <div style={{
                width:          32,
                height:         32,
                borderRadius:   8,
                flexShrink:     0,
                background:     "var(--color-cq-surface)",
                border:         "1px solid var(--color-cq-border)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}>
                <i className="fa-solid fa-arrow-right-from-bracket" style={{ fontSize: "0.75rem", color: "var(--color-cq-muted)" }} />
              </div>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize:   "0.82rem",
                fontWeight: 700,
                color:      "var(--color-cq-muted)",
                margin:     0,
              }}>
                {loggingOut ? "Cerrando..." : "Cerrar sesión"}
              </p>
            </motion.button>

          </div>
        </motion.aside>

        {/* ═══════════════════════════════════════
            CONTENIDO PRINCIPAL
        ═══════════════════════════════════════ */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 min-w-0"
          style={{ padding: "24px 0 24px 24px" }}
        >
          {/* Header móvil */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center gap-3 mb-4">
              <UserAvatar nombre={usuario?.nombre} size={36} />
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-cq-text)", margin: 0 }}>
                  {usuario?.nombre} {usuario?.apellido}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", color: "var(--color-cq-muted)", margin: 0 }}>
                  {usuario?.email}
                </p>
              </div>
            </div>
            {/* Nav horizontal en móvil */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.key;
                return (
                  <motion.button
                    key={item.key}
                    onClick={() => router.push(item.href)}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 whitespace-nowrap"
                    style={{
                      background: isActive ? "var(--color-cq-primary)" : "var(--color-cq-surface)",
                      border:     isActive ? "none" : "1px solid var(--color-cq-border)",
                      cursor:     "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className={item.icon}
                      style={{
                        fontSize: "0.7rem",
                        color:    isActive ? "white" : "var(--color-cq-muted)",
                      }}
                    />
                    <span style={{
                      fontFamily: "var(--font-display)",
                      fontSize:   "0.78rem",
                      fontWeight: 700,
                      color:      isActive ? "white" : "var(--color-cq-text)",
                    }}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Page header */}
          <div className="flex items-center gap-3 mb-6">
            <div style={{
              width:          36,
              height:         36,
              borderRadius:   10,
              background:     "var(--color-cq-primary)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}>
              <i
                className={NAV_ITEMS.find((n) => n.key === active)?.icon ?? "fa-solid fa-user"}
                style={{ fontSize: "0.8rem", color: "white" }}
              />
            </div>
            <div>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontSize:   "1.1rem",
                fontWeight: 800,
                color:      "var(--color-cq-text)",
                margin:     0,
              }}>
                {NAV_ITEMS.find((n) => n.key === active)?.label}
              </h1>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize:   "0.72rem",
                color:      "var(--color-cq-muted)",
                margin:     0,
              }}>
                {NAV_ITEMS.find((n) => n.key === active)?.description}
              </p>
            </div>
          </div>

          {children}
        </motion.main>

      </div>
    </div>
  );
}