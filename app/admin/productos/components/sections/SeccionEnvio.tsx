// app/admin/productos/components/sections/SeccionEnvio.tsx
"use client";

import { SectionCard, Field } from "../producto-form-ui";
import { inputSmallCls, type VarianteForm } from "../producto-form-types";

interface Props {
  variantes: VarianteForm[];
  onChange:  (i: number, k: keyof VarianteForm, v: string | boolean) => void;
}

const MEDIDA_UNITS = ["cm", "mm", "m", "in"];
const PESO_UNITS   = ["kg", "g", "lb", "oz"];

function varianteLabel(v: VarianteForm, i: number) {
  return v.nombre?.trim() || v.sku?.trim() || `Variante ${i + 1}`;
}

export function SeccionEnvio({ variantes, onChange }: Props) {
  const soloUna = variantes.length === 1;

  return (
    <SectionCard title="Envío">
      <div className="space-y-6">
        {variantes.map((v, i) => (
          <div key={i}>
            {/* Encabezado por variante cuando hay más de una */}
            {!soloUna && (
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">
                {varianteLabel(v, i)}
                {v.es_default && (
                  <span className="ml-2 normal-case text-indigo-500 font-normal">(base)</span>
                )}
              </p>
            )}

            {/* Toggle físico / digital */}
            <div className="flex gap-2 mb-5">
              {[
                { label: "Producto físico",  value: true },
                { label: "Producto digital", value: false },
              ].map(({ label, value }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => onChange(i, "es_fisico", value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                    v.es_fisico === value
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Dimensiones — solo si es físico */}
            {v.es_fisico && (
              <div className="space-y-4">

                {/* Largo / Ancho / Alto + unidad medida */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">Dimensiones</span>
                    <select
                      value={v.medida_unidad}
                      onChange={(e) => onChange(i, "medida_unidad", e.target.value)}
                      className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 focus:outline-none focus:border-blue-400"
                    >
                      {MEDIDA_UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Largo">
                      <div className="relative">
                        <input
                          type="number" min="0" step="0.01"
                          value={v.largo}
                          onChange={(e) => onChange(i, "largo", e.target.value)}
                          placeholder="0"
                          className={`${inputSmallCls} pr-8`}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                          {v.medida_unidad}
                        </span>
                      </div>
                    </Field>
                    <Field label="Ancho">
                      <div className="relative">
                        <input
                          type="number" min="0" step="0.01"
                          value={v.ancho}
                          onChange={(e) => onChange(i, "ancho", e.target.value)}
                          placeholder="0"
                          className={`${inputSmallCls} pr-8`}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                          {v.medida_unidad}
                        </span>
                      </div>
                    </Field>
                    <Field label="Alto">
                      <div className="relative">
                        <input
                          type="number" min="0" step="0.01"
                          value={v.alto}
                          onChange={(e) => onChange(i, "alto", e.target.value)}
                          placeholder="0"
                          className={`${inputSmallCls} pr-8`}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                          {v.medida_unidad}
                        </span>
                      </div>
                    </Field>
                  </div>
                </div>

                {/* Peso + unidad peso */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600">Peso</span>
                    <select
                      value={v.peso_unidad}
                      onChange={(e) => onChange(i, "peso_unidad", e.target.value)}
                      className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 focus:outline-none focus:border-blue-400"
                    >
                      {PESO_UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/3">
                    <div className="relative">
                      <input
                        type="number" min="0" step="0.001"
                        value={v.peso}
                        onChange={(e) => onChange(i, "peso", e.target.value)}
                        placeholder="0"
                        className={`${inputSmallCls} pr-8`}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                        {v.peso_unidad}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!v.es_fisico && (
              <p className="text-sm text-slate-400 text-center py-3">
                Los productos digitales no requieren datos de envío.
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}