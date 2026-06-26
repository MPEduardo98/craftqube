// app/global/components/legal/PolicyLayout.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface PolicySection {
  id: string;
  title: string;
}

interface PolicyLayoutProps {
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated?: string;
  sections?: PolicySection[];
  children: React.ReactNode;
}

export function PolicyLayout({
  badge,
  title,
  subtitle,
  lastUpdated,
  sections = [],
  children,
}: PolicyLayoutProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-cq-bg)" }}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "var(--color-cq-surface)" }}
      >
        {/* Grid bg */}
        <div
          className="absolute inset-0 bg-grid-pattern"
          style={{ "--grid-opacity": "0.035" } as React.CSSProperties}
        />
        {/* Blue glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "60%",
            transform: "translate(-50%, -50%)",
            width: "500px",
            height: "300px",
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(37,99,235,0.2), transparent)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="section-label mb-4">{badge}</p>
            <h1
              className="text-display mb-4"
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                color: "var(--color-cq-text)",
              }}
            >
              {title}
            </h1>
            <p
              className="text-base md:text-lg max-w-2xl"
              style={{ color: "var(--color-cq-muted)" }}
            >
              {subtitle}
            </p>
            {lastUpdated && (
              <p
                className="mt-4 text-xs"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-cq-accent)",
                  letterSpacing: "0.1em",
                }}
              >
                Última actualización: {lastUpdated}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex gap-12">
          {/* Sidebar nav – only on large screens */}
          {sections.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-28">
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-cq-muted)",
                  }}
                >
                  Contenido
                </p>
                <nav className="flex flex-col gap-1">
                  {sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollTo(sec.id)}
                      className="text-left text-sm px-3 py-2 rounded-lg transition-all duration-200"
                      style={{
                        color: "var(--color-cq-muted)",
                        fontFamily: "var(--font-body)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--color-cq-accent)";
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "var(--color-cq-accent-glow)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--color-cq-muted)";
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "transparent";
                      }}
                    >
                      {sec.title}
                    </button>
                  ))}
                </nav>

                {/* Back link */}
                <div
                  className="mt-8 pt-6"
                  style={{ borderTop: "1px solid var(--color-cq-border)" }}
                >
                  <Link
                    href="/"
                    className="text-xs flex items-center gap-2 transition-colors"
                    style={{ color: "var(--color-cq-muted)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--color-cq-accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--color-cq-muted)";
                    }}
                  >
                    ← Volver al inicio
                  </Link>
                </div>
              </div>
            </aside>
          )}

          {/* Main content */}
          <motion.main
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}