// app/(main)/producto/[slug]/components/ProductVariantSelector.tsx
"use client";

import { motion } from "framer-motion";
import type { ProductoVariante } from "@/app/global/types/product-detail";

interface Props {
  variantes:       ProductoVariante[];
  selectedId:      number;
  onSelect:        (variante: ProductoVariante) => void;
}

export function ProductVariantSelector({ variantes, selectedId, onSelect }: Props) {
  if (variantes.length <= 1) return null;

  // Group unique atributos across all variantes
  const atributosMap = new Map<string, Set<string>>();
  for (const v of variantes) {
    for (const a of v.atributos) {
      if (!atributosMap.has(a.atributo)) atributosMap.set(a.atributo, new Set());
      atributosMap.get(a.atributo)!.add(a.valor);
    }
  }

  // If no atributos defined, just show SKU buttons
  if (atributosMap.size === 0) {
    return (
      <div className="flex flex-col gap-3">
        <span
          style={{
            fontFamily:    "var(--font-mono)",
            fontSize:      "0.65rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color:         "var(--color-cq-muted)",
          }}
        >
          Variante
        </span>
        <div className="flex flex-wrap gap-2">
          {variantes.map((v) => {
            const isSelected = v.id === selectedId;
            const sinStock   = v.stock === 0 && !v.vender_sin_existencia;
            return (
              <motion.button
                key={v.id}
                onClick={() => !sinStock && onSelect(v)}
                whileHover={!sinStock ? { scale: 1.03 } : {}}
                whileTap={!sinStock ? { scale: 0.97 } : {}}
                disabled={sinStock}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  fontFamily:    "var(--font-mono)",
                  letterSpacing: "0.06em",
                  border:        isSelected ? "1.5px solid var(--color-cq-accent)" : "1.5px solid var(--color-cq-border)",
                  background:    isSelected ? "var(--color-cq-accent-glow)"        : "var(--color-cq-surface)",
                  color:         isSelected ? "var(--color-cq-accent)"             : sinStock ? "var(--color-cq-muted-2)" : "var(--color-cq-text)",
                  cursor:        sinStock ? "not-allowed" : "pointer",
                  opacity:       sinStock ? 0.45 : 1,
                  textDecoration: sinStock ? "line-through" : "none",
                }}
              >
                {v.sku}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const selected = variantes.find((v) => v.id === selectedId);

  return (
    <div className="flex flex-col gap-4">
      {Array.from(atributosMap.entries()).map(([atributo, valores]) => {
        const currentValor = selected?.atributos.find((a) => a.atributo === atributo)?.valor;

        return (
          <div key={atributo} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily:    "var(--font-mono)",
                  fontSize:      "0.65rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color:         "var(--color-cq-muted)",
                }}
              >
                {atributo}
              </span>
              {currentValor && (
                <span
                  style={{
                    fontFamily:    "var(--font-mono)",
                    fontSize:      "0.65rem",
                    letterSpacing: "0.06em",
                    color:         "var(--color-cq-accent)",
                    fontWeight:    700,
                  }}
                >
                  — {currentValor}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(valores).map((valor) => {
                // Find which variante has this value for this atributo
                const matchVariante = variantes.find((v) =>
                  v.atributos.some((a) => a.atributo === atributo && a.valor === valor)
                );
                const isSelected = matchVariante?.id === selectedId;
                const sinStock   = matchVariante ? matchVariante.stock === 0 && !matchVariante.vender_sin_existencia : false;

                return (
                  <motion.button
                    key={valor}
                    onClick={() => matchVariante && !sinStock && onSelect(matchVariante)}
                    whileHover={!sinStock ? { scale: 1.04 } : {}}
                    whileTap={!sinStock ? { scale: 0.96 } : {}}
                    disabled={sinStock || !matchVariante}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all relative"
                    style={{
                      fontFamily:     "var(--font-body)",
                      border:         isSelected ? "1.5px solid var(--color-cq-accent)" : "1.5px solid var(--color-cq-border)",
                      background:     isSelected ? "var(--color-cq-accent-glow)"        : "var(--color-cq-surface)",
                      color:          isSelected ? "var(--color-cq-accent)"             : sinStock ? "var(--color-cq-muted-2)" : "var(--color-cq-text)",
                      cursor:         sinStock ? "not-allowed" : "pointer",
                      opacity:        sinStock ? 0.4 : 1,
                    }}
                  >
                    {valor}
                    {sinStock && (
                      <span
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ pointerEvents: "none" }}
                      >
                        <span
                          className="w-full h-px absolute rotate-12"
                          style={{ background: "var(--color-cq-muted-2)" }}
                        />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}