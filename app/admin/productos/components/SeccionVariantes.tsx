"use client";
// app/admin/productos/components/SeccionVariantes.tsx
// ─────────────────────────────────────────────────────────────
// Sección de variantes: lista, edición inline y eliminación.
// ─────────────────────────────────────────────────────────────
import { SectionCard, Field } from "./producto-form-ui";
import { inputSmallCls, type VarianteForm } from "./producto-form-types";

interface Props {
  variantes:  VarianteForm[];
  onAdd:      () => void;
  onRemove:   (i: number) => void;
  onChange:   (i: number, k: keyof VarianteForm, v: string | boolean) => void;
}

export function SeccionVariantes({ variantes, onAdd, onRemove, onChange }: Props) {
  return (
    <SectionCard
      title={`Variantes (${variantes.length})`}
      action={
        <button
          type="button"
          onClick={onAdd}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir variante
        </button>
      }
    >
      <div className="space-y-4">
        {variantes.map((v, i) => (
          <div
            key={i}
            className={`rounded-lg border p-4 space-y-3 ${
              v.es_default ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200"
            }`}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange(i, "es_default", true)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition ${
                    v.es_default
                      ? "border-indigo-400 bg-indigo-500 text-white"
                      : "border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {v.es_default ? "✓ Default" : "Marcar default"}
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  Variante {i + 1}
                </span>
              </div>
              {variantes.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="text-slate-300 hover:text-red-400 transition"
                  title="Eliminar variante"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Fila 1: SKU + código de barras */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="SKU" required>
                <input
                  type="text"
                  value={v.sku}
                  onChange={(e) => onChange(i, "sku", e.target.value)}
                  placeholder="SKU-001"
                  className={inputSmallCls}
                />
              </Field>
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

            {/* Fila 2: Precio original + precio final + costo */}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Precio original">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
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
                    type="number"
                    min="0"
                    step="0.01"
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
                    type="number"
                    min="0"
                    step="0.01"
                    value={v.costo}
                    onChange={(e) => onChange(i, "costo", e.target.value)}
                    className={`${inputSmallCls} pl-6`}
                  />
                </div>
              </Field>
            </div>

            {/* Fila 3: Stock + vender sin existencia */}
            <div className="flex items-end gap-4">
              <div className="w-32">
                <Field label="Stock">
                  <input
                    type="number"
                    min="0"
                    step="1"
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