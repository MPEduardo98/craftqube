// app/(main)/catalogo/components/CatalogToolbar.tsx
"use client";

import { motion } from "framer-motion";

const SORT_OPTIONS = [
  { value: "reciente",    label: "Más recientes" },
  { value: "precio_asc",  label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
  { value: "az",          label: "A → Z" },
  { value: "za",          label: "Z → A" },
];

interface CatalogToolbarProps {
  total:         number;
  sort:          string;
  view:          "grid" | "list";
  loading:       boolean;
  onSortChange:  (v: string) => void;
  onViewChange:  (v: "grid" | "list") => void;
}

export function CatalogToolbar({
  total,
  sort,
  view,
  loading,
  onSortChange,
  onViewChange,
}: CatalogToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* Conteo */}
      <span style={{
        fontFamily:    "var(--font-mono)",
        fontSize:      "0.68rem",
        letterSpacing: "0.06em",
        color:         "var(--color-cq-muted)",
      }}>
        {loading ? (
          <span className="inline-block w-16 h-3 rounded animate-pulse" style={{ background: "var(--color-cq-border)" }} />
        ) : (
          <>{total.toLocaleString("es-MX")} {total === 1 ? "producto" : "productos"}</>
        )}
      </span>

      <div className="flex items-center gap-2">
        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pr-7 pl-3 py-1.5 rounded-lg text-xs cursor-pointer"
            style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "0.68rem",
              letterSpacing: "0.04em",
              background:    "var(--color-cq-surface)",
              border:        "1px solid var(--color-cq-border)",
              color:         "var(--color-cq-text)",
              outline:       "none",
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            width="10" height="10"
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-cq-muted)" }}
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>

        {/* View toggle */}
        <div
          className="flex items-center rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface)" }}
        >
          {(["grid", "list"] as const).map((v) => (
            <motion.button
              key={v}
              onClick={() => onViewChange(v)}
              whileTap={{ scale: 0.9 }}
              className="flex items-center justify-center"
              style={{
                width:      "32px",
                height:     "32px",
                background: view === v ? "var(--color-cq-accent)" : "transparent",
                color:      view === v ? "white" : "var(--color-cq-muted)",
                border:     "none",
                cursor:     "pointer",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              {v === "grid" ? (
                <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                  <rect x="0" y="0" width="6.5" height="6.5" rx="1"/>
                  <rect x="9.5" y="0" width="6.5" height="6.5" rx="1"/>
                  <rect x="0" y="9.5" width="6.5" height="6.5" rx="1"/>
                  <rect x="9.5" y="9.5" width="6.5" height="6.5" rx="1"/>
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                  <rect x="0" y="0" width="16" height="3.5" rx="1"/>
                  <rect x="0" y="6.25" width="16" height="3.5" rx="1"/>
                  <rect x="0" y="12.5" width="16" height="3.5" rx="1"/>
                </svg>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}