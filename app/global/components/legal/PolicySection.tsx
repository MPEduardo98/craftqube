// app/global/components/legal/PolicySection.tsx
"use client";

import { motion } from "framer-motion";

interface PolicySectionProps {
  id: string;
  number?: string;
  title: string;
  children: React.ReactNode;
}

export function PolicySection({ id, number, title, children }: PolicySectionProps) {
  return (
    <motion.section
      id={id}
      className="mb-12 scroll-mt-28"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Section header */}
      <div className="flex items-start gap-4 mb-5">
        {number && (
          <span
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold mt-0.5"
            style={{
              background: "var(--color-cq-accent-glow)",
              color: "var(--color-cq-accent)",
              fontFamily: "var(--font-mono)",
              border: "1px solid rgba(37,99,235,0.15)",
            }}
          >
            {number}
          </span>
        )}
        <h2
          className="text-xl font-bold leading-tight"
          style={{
            color: "var(--color-cq-text)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h2>
      </div>

      {/* Divider */}
      <div
        className="mb-5 h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(37,99,235,0.2), transparent)",
        }}
      />

      {/* Content */}
      <div
        className="text-sm leading-relaxed space-y-3"
        style={{ color: "var(--color-cq-muted)" }}
      >
        {children}
      </div>
    </motion.section>
  );
}

/** Highlighted info box */
export function PolicyNote({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warning" | "success";
}) {
  const styles = {
    info: {
      bg: "rgba(37,99,235,0.06)",
      border: "rgba(37,99,235,0.2)",
      accent: "var(--color-cq-accent)",
    },
    warning: {
      bg: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.2)",
      accent: "#F59E0B",
    },
    success: {
      bg: "rgba(16,185,129,0.06)",
      border: "rgba(16,185,129,0.2)",
      accent: "#10B981",
    },
  };

  const s = styles[variant];

  return (
    <div
      className="rounded-xl p-4 my-4 text-sm"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.accent}`,
        color: "var(--color-cq-text)",
      }}
    >
      {children}
    </div>
  );
}

/** Inline list with styled bullets */
export function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="shrink-0 w-1.5 h-1.5 rounded-full mt-2"
            style={{ background: "var(--color-cq-accent)" }}
          />
          <span style={{ color: "var(--color-cq-muted)" }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}