// app/admin/productos/components/sections/SeccionEnvio.tsx
"use client";

import { SectionCard, Field } from "../producto-form-ui";
import { inputSmallCls, type EnvioForm } from "../producto-form-types";

interface Props {
  envio:    EnvioForm;
  onChange: (k: keyof EnvioForm, v: string | boolean) => void;
}

const MEDIDA_UNITS = ["cm", "mm", "m", "in"];
const PESO_UNITS   = ["kg", "g", "lb", "oz"];

export function SeccionEnvio({ envio, onChange }: Props) {
  return (
    <SectionCard title="Envío">
      <p className="text-xs text-slate-400 mb-4">
        Las dimensiones y el peso aplican al producto completo (todas las variantes).
      </p>

      {/* Toggle físico / digital */}
      <div className="flex gap-2 mb-5">
        {[
          { label: "Producto físico",  value: true },
          { label: "Producto digital", value: false },
        ].map(({ label, value }) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => onChange("es_fisico", value)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
              envio.es_fisico === value
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {envio.es_fisico ? (
        <div className="space-y-4">
          {/* Largo / Ancho / Alto + unidad medida */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Dimensiones</span>
              <select
                value={envio.medida_unidad}
                onChange={(e) => onChange("medida_unidad", e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 focus:outline-none focus:border-blue-400"
              >
                {MEDIDA_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(["largo", "ancho", "alto"] as const).map((dim) => (
                <Field key={dim} label={dim[0].toUpperCase() + dim.slice(1)}>
                  <div className="relative">
                    <input
                      type="number" min="0" step="0.01"
                      value={envio[dim]}
                      onChange={(e) => onChange(dim, e.target.value)}
                      placeholder="0"
                      className={`${inputSmallCls} pr-8`}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                      {envio.medida_unidad}
                    </span>
                  </div>
                </Field>
              ))}
            </div>
          </div>

          {/* Peso + unidad peso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Peso</span>
              <select
                value={envio.peso_unidad}
                onChange={(e) => onChange("peso_unidad", e.target.value)}
                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-600 focus:outline-none focus:border-blue-400"
              >
                {PESO_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="w-1/3">
              <div className="relative">
                <input
                  type="number" min="0" step="0.001"
                  value={envio.peso}
                  onChange={(e) => onChange("peso", e.target.value)}
                  placeholder="0"
                  className={`${inputSmallCls} pr-8`}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  {envio.peso_unidad}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-3">
          Los productos digitales no requieren datos de envío.
        </p>
      )}
    </SectionCard>
  );
}
