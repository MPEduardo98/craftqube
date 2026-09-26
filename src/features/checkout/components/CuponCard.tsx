// features/checkout/components/CuponCard.tsx
// ─────────────────────────────────────────────────────────────
// Card del cupón en la columna del resumen. Sólo pone la caja y
// el título: la lógica vive en el padre, que recalcula el total
// contra el servidor.
// ─────────────────────────────────────────────────────────────
"use client";

import { CuponInput } from "./CuponInput";

interface Props {
  aplicado:  string | null;
  cargando:  boolean;
  etiqueta?: string | null;
  onAplicar: (codigo: string) => void;
  onQuitar:  () => void;
}

export function CuponCard({ aplicado, cargando, etiqueta, onAplicar, onQuitar }: Props) {
  return (
    <div style={{
      background:   "var(--color-cq-surface)",
      border:       "1px solid var(--color-cq-border)",
      borderRadius: 16,
      boxShadow:    "0 2px 16px rgba(0,0,0,0.05)",
      overflow:     "hidden",
    }}>
      <div className="px-5 py-4 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface-2)" }}>
        <i className="fa-solid fa-tag" style={{ fontSize: "0.75rem", color: "var(--color-cq-accent)" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem",
          fontWeight: 700, color: "var(--color-cq-text)" }}>
          Cupón de descuento
        </span>
      </div>

      <div className="px-5 py-4">
        <CuponInput
          aplicado={aplicado}
          cargando={cargando}
          etiqueta={etiqueta}
          onAplicar={onAplicar}
          onQuitar={onQuitar}
          abiertoPorDefecto
        />
      </div>
    </div>
  );
}
