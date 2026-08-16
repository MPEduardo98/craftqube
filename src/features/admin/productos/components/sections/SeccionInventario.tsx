// app/admin/productos/components/sections/SeccionInventario.tsx
"use client";

import { SectionCard, Field } from "../producto-form-ui";
import { inputSmallCls, type VarianteForm } from "../producto-form-types";

interface Props {
  variante: VarianteForm;
  onChange: (k: keyof VarianteForm, v: string | boolean) => void;
}

export function SeccionInventario({ variante: v, onChange }: Props) {
  return (
    <SectionCard title="Inventario">
      <div className="grid grid-cols-2 gap-4">
        {/* SKU */}
        <Field label="SKU">
          <input
            type="text"
            value={v.sku}
            onChange={(e) => onChange("sku", e.target.value)}
            placeholder="SKU-001"
            className={inputSmallCls}
          />
        </Field>

        {/* Código de barras */}
        <Field label="Código de barras">
          <input
            type="text"
            value={v.codigo_barras}
            onChange={(e) => onChange("codigo_barras", e.target.value)}
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
              onChange={(e) => onChange("stock", e.target.value)}
              className={inputSmallCls}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 pb-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={v.vender_sin_existencia}
            onChange={(e) => onChange("vender_sin_existencia", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500/20"
          />
          <span className="text-sm text-slate-600">Vender sin existencia</span>
        </label>
      </div>
    </SectionCard>
  );
}
