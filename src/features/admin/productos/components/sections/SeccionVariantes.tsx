// app/admin/productos/components/sections/SeccionVariantes.tsx
"use client";

import { useState } from "react";
import { SectionCard } from "../producto-form-ui";
import { inputSmallCls, type VarianteForm } from "../producto-form-types";

interface Props {
  variantes: VarianteForm[];
  onAdd:     () => void;
  onRemove:  (i: number) => void;
  onChange:  (i: number, k: keyof VarianteForm, v: string | boolean) => void;
}

const esSoloDefault = (variantes: VarianteForm[]) =>
  variantes.length === 1 && variantes[0].es_default;

function VarianteLabel({ v, i }: { v: VarianteForm; i: number }) {
  const label = v.nombre?.trim() || v.sku?.trim() || `Variante ${i + 1}`;
  return <span className="text-sm font-medium text-slate-700">{label}</span>;
}

export function SeccionVariantes({ variantes, onAdd, onRemove, onChange }: Props) {
  const soloDefault = esSoloDefault(variantes);
  const [editingNombre, setEditingNombre] = useState<number | null>(null);

  return (
    <SectionCard title="Variantes">

      {soloDefault ? (
        /* ── Estado sin variantes adicionales ── */
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">Sin variantes adicionales</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Este producto es único. Agrega variantes si existe en diferentes opciones (talla, color, material…).
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-indigo-300 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar variante
          </button>
        </div>
      ) : (
        /* ── Tabla de variantes ── */
        <div className="flex flex-col gap-1">

          {/* Header tabla */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Variante</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-20 text-center">Principal</span>
            <span className="w-8" />
          </div>

          {/* Filas */}
          {variantes.map((v, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                v.es_default ? "bg-indigo-50/60" : "hover:bg-slate-50"
              }`}
            >
              {/* Nombre editable inline */}
              <div className="flex items-center gap-2 min-w-0">
                {v.es_default && (
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium">
                    Base
                  </span>
                )}
                {editingNombre === i ? (
                  <input
                    autoFocus
                    type="text"
                    value={v.nombre}
                    onChange={(e) => onChange(i, "nombre", e.target.value)}
                    onBlur={() => setEditingNombre(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") setEditingNombre(null);
                    }}
                    placeholder="Ej: Aluminio, Talla M, Rojo…"
                    className={`${inputSmallCls} max-w-[220px]`}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingNombre(i)}
                    className="flex items-center gap-1.5 text-left group min-w-0"
                    title="Clic para editar nombre"
                  >
                    <VarianteLabel v={v} i={i} />
                    <svg
                      className="w-3 h-3 text-slate-300 group-hover:text-slate-500 shrink-0 transition"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.83a4 4 0 01-1.897 1.06l-2.685.671.671-2.686a4 4 0 011.06-1.897z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Radio "principal" */}
              <div className="w-20 flex justify-center">
                <button
                  type="button"
                  onClick={() => onChange(i, "es_default", true)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    v.es_default
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-300 hover:border-indigo-300"
                  }`}
                >
                  {v.es_default && <span className="w-2 h-2 rounded-full bg-white" />}
                </button>
              </div>

              {/* Eliminar (deshabilitado para la base/default) */}
              <div className="w-8 flex justify-center">
                {!v.es_default ? (
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
                ) : (
                  <span className="w-8" />
                )}
              </div>
            </div>
          ))}

          {/* Agregar nueva variante */}
          <button
            type="button"
            onClick={onAdd}
            className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition self-start"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar variante
          </button>
        </div>
      )}
    </SectionCard>
  );
}