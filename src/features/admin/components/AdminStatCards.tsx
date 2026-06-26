// app/admin/components/AdminStatCards.tsx
"use client";

import Link   from "next/link";
import { motion } from "framer-motion";

interface Card {
  key:      string;
  label:    string;
  href:     string;
  accent:   string;
  accentBg: string;
  d:        string;
  value:    string | number;
}

interface AdminStatCardsProps {
  cards: Card[];
}

export function AdminStatCards({ cards }: AdminStatCardsProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href={c.href}
            className="relative overflow-hidden flex flex-col gap-4 p-5 rounded-xl block"
            style={{
              background: "var(--color-cq-surface, #fff)",
              border:     "1px solid var(--color-cq-border, #e2e8f0)",
              boxShadow:  "var(--shadow-card)",
              textDecoration: "none",
            }}
          >
            {/* Glow top-right */}
            <div
              className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
              style={{
                background: c.accentBg,
                filter:     "blur(20px)",
                transform:  "translate(30%, -30%)",
              }}
            />

            {/* Icon + trend placeholder */}
            <div className="flex items-start justify-between relative z-10">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: c.accentBg }}
              >
                <svg
                  width="15" height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={c.accent}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={c.d} />
                </svg>
              </div>
            </div>

            {/* Value */}
            <div className="relative z-10">
              <p
                className="text-[28px] font-black leading-none tracking-tight"
                style={{
                  fontFamily: "var(--font-display, sans-serif)",
                  color:      "var(--color-cq-text, #0f172a)",
                }}
              >
                {c.value}
              </p>
              <p
                className="text-[10px] uppercase tracking-widest mt-1.5"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  color:      "var(--color-cq-muted, #64748b)",
                }}
              >
                {c.label}
              </p>
            </div>

            {/* Accent bottom bar */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: c.accent, opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}