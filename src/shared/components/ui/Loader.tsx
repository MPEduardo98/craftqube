// shared/components/ui/Loader.tsx
// ─────────────────────────────────────────────────────────────
// Loader global reutilizable: spinner (arco giratorio) con un
// texto opcional debajo para comunicar avances de carga.
//
// Es un bloque inline (no overlay) — se puede incrustar donde sea:
// dentro de un modal, una tarjeta, un botón, etc. Para cubrir un
// contenedor o la pantalla completa, usa <LoadingOverlay>.
//
// Ejemplo:
//   {saving && <Loader text="Creando marca…" />}
// ─────────────────────────────────────────────────────────────
"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  /** Texto que aparece debajo del spinner. */
  text?:      string;
  /** Diámetro del spinner en px. Default 28. */
  size?:      number;
  /** Clases extra para el contenedor. */
  className?: string;
}

export function Loader({ text, size = 28, className }: LoaderProps) {
  const stroke = Math.max(2, Math.round(size * 0.09));
  const r      = (size - stroke) / 2 - 1;
  const c      = size / 2;
  const circ   = 2 * Math.PI * r;

  return (
    <div
      className={className}
      style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "14px",
      }}
      role="status"
      aria-live="polite"
    >
      {/* Spinner — arco giratorio minimalista (consistente con LoadingOverlay) */}
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx={c} cy={c} r={r}
          stroke="var(--color-cq-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={c} cy={c} r={r}
          stroke="var(--color-cq-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circ * 0.25} ${circ * 0.75}`}
          strokeDashoffset="0"
        />
      </motion.svg>

      {text && (
        <p
          style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "0.65rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color:         "var(--color-cq-muted)",
            margin:        0,
            textAlign:     "center",
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
