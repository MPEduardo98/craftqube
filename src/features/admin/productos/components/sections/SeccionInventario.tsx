// app/admin/productos/components/sections/SeccionInventario.tsx
"use client";

import { SectionCard, Field } from "../producto-form-ui";
import { inputSmallCls, type VarianteForm } from "../producto-form-types";

interface Props {
  variantes: VarianteForm[];
  onChange:  (i: number, k: keyof VarianteForm, v: string | boolean) => void;
}

function varianteLabel(v: VarianteForm, i: number) {
  return v.nombre?.trim() || v.sku?.trim() || `Variante ${i + 1}`;
}

const soloUna = (variantes: VarianteForm[]) => variantes.length === 1;

export function SeccionInventario({ variantes, onChange }: Props) {
  return (
    <SectionCard title="Inventario">
      <div className="space-y-5">
        {variantes.map((v, i) => (
          <div key={i}>
            {/* Encabezado por variante (solo si hay más de una) */}
            {!soloUna(variantes) && (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 pb-2 border-b border-slate-100">
                {varianteLabel(v, i)}
                {v.es_default && (
                  <span className="ml-2 normal-case text-indigo-500 font-normal">(base)</span>
                )}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* SKU */}
              <Field label="SKU">
                <input
                  type="text"
                  value={v.sku}
                  onChange={(e) => onChange(i, "sku", e.target.value)}
                  placeholder="SKU-001"
                  className={inputSmallCls}
                />
              </Field>

              {/* Código de barras */}
              <Field label="Código de barras">
                <input
                  type="text"
                  value={v.codigo_barras}
                  onChange={(e) => onChange(i, "codigo_barras", e.target.value)}
                  placeholder="7501234567890"
                  className={inputSmallCls}
                />
              </Field>
            </div>

            {/* Stock + Vender sin existencia */}
            <div className="flex items-end gap-4 mt-3">
              <div className="w-36">
                <Field label="Stock disponible">
                  <input
                    type="number" min="0" step="1"
                    value={v.stock}
                    onChange={(e) => onChange(i, "stock", e.target.value)}
                    className={inputSmallCls}
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 pb-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={v.vender_sin_existencia}
                  onChange={(e) => onChange(i, "vender_sin_existencia", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500/20"
                />
                <span className="text-sm text-slate-600">Vender sin existencia</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}