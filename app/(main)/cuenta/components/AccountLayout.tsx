// app/(main)/cuenta/components/AccountLayout.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/app/global/context/AuthContext";
import { useEffect } from "react";

const NAV_ITEMS = [
  { href: "/cuenta/perfil", label: "Perfil", icon: "fa-solid fa-user" },
  { href: "/cuenta/pedidos", label: "Pedidos", icon: "fa-solid fa-box" },
  { href: "/cuenta/favoritos", label: "Favoritos", icon: "fa-solid fa-heart" },
  { href: "/cuenta/direcciones", label: "Direcciones", icon: "fa-solid fa-location-dot" },
];

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { autenticado, cargando } = useAuth();

  useEffect(() => {
    if (!cargando && !autenticado) {
      router.push("/login?redirect=/cuenta/perfil");
    }
  }, [autenticado, cargando, router]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-cq-bg)" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "2px solid var(--color-cq-border)",
            borderTopColor: "var(--color-cq-accent)",
          }}
        />
      </div>
    );
  }

  if (!autenticado) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p
            className="uppercase tracking-widest mb-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              color: "var(--color-cq-muted-2)",
            }}
          >
            Tu cuenta
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              color: "var(--color-cq-text)",
              letterSpacing: "-0.02em",
            }}
          >
            Panel de{" "}
            <span style={{ color: "var(--color-cq-accent)" }}>Control</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          {/* Navegación lateral */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <nav
              className="rounded-xl overflow-hidden sticky top-24"
              style={{
                background: "var(--color-cq-surface)",
                border: "1px solid var(--color-cq-border)",
              }}
            >
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-5 py-4 transition-all relative"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--color-cq-accent)" : "var(--color-cq-text)",
                      background: isActive ? "rgba(37,99,235,0.06)" : "transparent",
                      borderLeft: isActive ? "3px solid var(--color-cq-accent)" : "3px solid transparent",
                      textDecoration: "none",
                    }}
                  >
                    <i
                      className={item.icon}
                      style={{
                        fontSize: "0.85rem",
                        width: 16,
                        color: isActive ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
                      }}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.aside>

          {/* Contenido */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}