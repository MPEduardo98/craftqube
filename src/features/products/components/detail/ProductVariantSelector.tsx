// app/(main)/producto/[slug]/components/ProductVariantSelector.tsx
"use client";

import { useVenta } from "@/shared/context/ContextoVenta";
import { motion } from "framer-motion";
import { varianteDisponible, type OpcionAtributo } from "@mpeduardo98/commerce-core/ficha";
import type { ProductoVariante } from "@/features/products/types/product-detail";

interface Props {
  variantes:       ProductoVariante[];
  selectedId:      number;
  /** Atributos agrupados por `useFichaProducto` */
  opciones:        OpcionAtributo[];
  onSelect:        (variante: ProductoVariante) => void;
}

export function ProductVariantSelector({ variantes, selectedId, opciones, onSelect }: Props) {
  const { ventaEnLinea } = useVenta();
  if (variantes.length <= 1) return null;

  // If no atributos defined, just show SKU buttons
  if (opciones.length === 0) {
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
            const sinStock   = !varianteDisponible(v, ventaEnLinea);
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

  return (
    <div className="flex flex-col gap-4">
      {opciones.map(({ atributo, seleccionado: currentValor, valores }) => {

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
              {valores.map(({ valor, variante: matchVariante, seleccionado: isSelected, disponible }) => {
                // La variante ya conserva el resto de la selección si hay existencia.
                const sinStock   = !disponible;

                return (
                  <motion.button
                    key={valor}
                    onClick={() => matchVariante && !sinStock && onSelect(matchVariante)}
                    whileHover={!sinStock ? { scale: 1.04 } : {}}
                    whileTap={!sinStock ? { scale: 0.96 } : {}}
                    disabled={sinStock}
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