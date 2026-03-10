// app/(main)/producto/[slug]/components/ProductSpecs.tsx
"use client";

import { motion } from "framer-motion";
import type { Metacampo, ProductoVariante } from "@/app/global/types/product-detail";

interface Props {
  metacampos:       Metacampo[];
  varianteActiva:   ProductoVariante | null;
}

function SpecRow({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-start justify-between gap-4 py-3"
      style={{ borderBottom: "1px solid var(--color-cq-border)" }}
    >
      <span
        style={{
          fontFamily:    "var(--font-mono)",
          fontSize:      "0.7rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color:         "var(--color-cq-muted)",
          flexShrink:    0,
        }}
      >
        {label}
      </span>
      <span
        className="text-right text-sm font-semibold"
        style={{ color: "var(--color-cq-text)" }}
      >
        {value}
      </span>
    </motion.div>
  );
}

export function ProductSpecs({ metacampos, varianteActiva }: Props) {
  const rows: { label: string; value: string }[] = [];

  // Product-level metacampos
  for (const m of metacampos) {
    rows.push({ label: m.llave, value: m.valor });
  }

  // Variante metacampos
  if (varianteActiva) {
    for (const m of varianteActiva.metacampos) {
      rows.push({ label: m.llave, value: m.valor });
    }

    // Dimensions
    const d = varianteActiva;
    if (d.largo)  rows.push({ label: "Largo",  value: `${d.largo} ${d.medida_unidad ?? "cm"}` });
    if (d.ancho)  rows.push({ label: "Ancho",  value: `${d.ancho} ${d.medida_unidad ?? "cm"}` });
    if (d.alto)   rows.push({ label: "Alto",   value: `${d.alto}  ${d.medida_unidad ?? "cm"}` });
    if (d.peso)   rows.push({ label: "Peso",   value: `${d.peso}  ${d.peso_unidad   ?? "kg"}` });

    // SKU
    rows.push({ label: "SKU", value: d.sku });
    if (d.codigo_barras) rows.push({ label: "Código de barras", value: d.codigo_barras });
  }

  if (rows.length === 0) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border:     "1px solid var(--color-cq-border)",
        background: "var(--color-cq-surface)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface-2)" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-cq-accent)" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <span
          style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "0.65rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color:         "var(--color-cq-muted)",
          }}
        >
          Especificaciones
        </span>
      </div>

      {/* Rows */}
      <div className="px-5">
        {rows.map((row, i) => (
          <SpecRow key={`${row.label}-${i}`} label={row.label} value={row.value} index={i} />
        ))}
      </div>
    </div>
  );
}