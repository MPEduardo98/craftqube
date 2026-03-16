// app/admin/productos/components/sections/SeccionPrecios.tsx
"use client";

import { SectionCard, Field } from "../producto-form-ui";
import { inputSmallCls, type VarianteForm } from "../producto-form-types";

interface Props {
  variantes: VarianteForm[];
  onChange:  (i: number, k: keyof VarianteForm, v: string | boolean) => void;
}

export function SeccionPrecios({ variantes, onChange }: Props) {
  return (
    <SectionCard title="Precios">
      <div className="space-y-4">
        {variantes.map((v, i) => (
          <div
            key={i}
            className={`rounded-lg border p-4 space-y-3 ${
              v.es_default ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200"
            }`}
          >
            {variantes.length > 1 && (
              <p className="text-xs font-mono text-slate-400">
                {v.sku ? v.sku : `Variante ${i + 1}`}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3">
              <Field label="Precio original">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={v.precio_original}
                    onChange={(e) => onChange(i, "precio_original", e.target.value)}
                    className={`${inputSmallCls} pl-6`}
                  />
                </div>
              </Field>

              <Field label="Precio final" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={v.precio_final}
                    onChange={(e) => onChange(i, "precio_final", e.target.value)}
                    className={`${inputSmallCls} pl-6`}
                  />
                </div>
              </Field>

              <Field label="Costo">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number" min="0" step="0.01"
                    value={v.costo}
                    onChange={(e) => onChange(i, "costo", e.target.value)}
                    className={`${inputSmallCls} pl-6`}
                  />
                </div>
              </Field>
            </div>

            {/* Margen calculado */}
            {(() => {
              const final = parseFloat(v.precio_final) || 0;
              const costo = parseFloat(v.costo) || 0;
              if (final > 0 && costo > 0) {
                const margen = ((final - costo) / final) * 100;
                return (
                  <p className="text-xs text-slate-400">
                    Margen:{" "}
                    <span className={margen < 0 ? "text-red-500" : "text-emerald-600"}>
                      {margen.toFixed(1)}%
                    </span>
                  </p>
                );
              }
              return null;
            })()}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}