// app/admin/productos/components/sections/SeccionVariantes.tsx
"use client";

import { useState } from "react";
import { SectionCard, Field } from "../producto-form-ui";
import { inputSmallCls, type VarianteForm } from "../producto-form-types";
import type { PricingHint } from "./SeccionPrecios";
import { resolveImageUrl } from "@/features/media/lib/resolveImageUrl";
import { ModalMediaLibrary } from "../modals/ModalMediaLibrary";

interface Props {
  variantes:   VarianteForm[];
  productoId?: number;
  onAdd:     () => void;
  onRemove:  (i: number) => void;
  onChange:  (i: number, k: keyof VarianteForm, v: string | boolean) => void;
  pricing?:  PricingHint;
  // Atributos por variante
  onAddAtributo:    (i: number) => void;
  onRemoveAtributo: (i: number, ai: number) => void;
  onChangeAtributo: (i: number, ai: number, k: "nombre" | "valor", v: string) => void;
  // Metacampos por variante
  onAddMetacampo:    (i: number) => void;
  onRemoveMetacampo: (i: number, mi: number) => void;
  onChangeMetacampo: (i: number, mi: number, k: "llave" | "valor", v: string) => void;
}

function VarianteLabel({ v, i }: { v: VarianteForm; i: number }) {
  const label = v.nombre?.trim() || v.sku?.trim() || `Variante ${i + 1}`;
  return <span className="text-sm font-medium text-slate-700 truncate">{label}</span>;
}

const removeBtnCls =
  "shrink-0 w-7 h-7 rounded-md border border-slate-200 text-slate-400 hover:text-red-400 hover:border-red-200 transition flex items-center justify-center text-sm";

const subTitleCls = "text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500";

/* ── Panel expandible: todos los campos de una variante ── */
function VarianteDetalle({ v, i, p, productoId, onPick }: {
  v: VarianteForm; i: number; p: Props; productoId?: number; onPick: (i: number) => void;
}) {
  const { onChange } = p;
  const final  = parseFloat(v.precio_final) || 0;
  const costo  = parseFloat(v.costo) || 0;
  const margen = final > 0 && costo > 0 ? ((final - costo) / final) * 100 : null;
  const imgSrc = v.imagen ? resolveImageUrl(v.imagen, productoId) : null;

  return (
    <div className="mt-1 mb-2 mx-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4 flex flex-col gap-5">

      {/* Imagen de la variante */}
      <div className="flex flex-col gap-2">
        <span className={subTitleCls}>Imagen de la variante</span>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
            {imgSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgSrc} alt={v.nombre || "Variante"} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <button type="button" onClick={() => onPick(i)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 self-start">
              {v.imagen ? "Cambiar imagen" : "Elegir imagen"}
            </button>
            {v.imagen && (
              <button type="button" onClick={() => onChange(i, "imagen", "")}
                className="text-xs text-slate-400 hover:text-red-400 self-start">
                Quitar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Precios */}
      <div className="flex flex-col gap-2">
        <span className={subTitleCls}>Precio</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Precio original">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input type="number" min="0" step="0.01" value={v.precio_original}
                onChange={(e) => onChange(i, "precio_original", e.target.value)}
                className={`${inputSmallCls} pl-6`} />
            </div>
          </Field>
          <Field label="Costo">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input type="number" min="0" step="0.01" value={v.costo}
                onChange={(e) => onChange(i, "costo", e.target.value)}
                className={`${inputSmallCls} pl-6`} />
            </div>
          </Field>
          {margen !== null && (
            <div className="flex items-end pb-1.5">
              <p className="text-xs text-slate-400">
                Margen: <span className={margen < 0 ? "text-red-500" : "text-emerald-600"}>{margen.toFixed(1)}%</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Inventario */}
      <div className="flex flex-col gap-2">
        <span className={subTitleCls}>Inventario</span>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SKU">
            <input type="text" value={v.sku} onChange={(e) => onChange(i, "sku", e.target.value)}
              placeholder="SKU-001" className={inputSmallCls} />
          </Field>
          <Field label="Código de barras">
            <input type="text" value={v.codigo_barras} onChange={(e) => onChange(i, "codigo_barras", e.target.value)}
              placeholder="7501234567890" className={inputSmallCls} />
          </Field>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none mt-1">
          <input type="checkbox" checked={v.vender_sin_existencia}
            onChange={(e) => onChange(i, "vender_sin_existencia", e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500/20" />
          <span className="text-sm text-slate-600">Vender sin existencia</span>
        </label>
      </div>

      {/* Atributos */}
      <div className="flex flex-col gap-2">
        <span className={subTitleCls}>
          Atributos <span className="font-normal normal-case text-slate-400">(generan el selector en la tienda, p. ej. Color → Negro)</span>
        </span>
        {v.atributos.length === 0 && <p className="text-xs text-slate-400">Sin atributos.</p>}
        {v.atributos.map((a, ai) => (
          <div key={ai} className="flex gap-2 items-center">
            <input type="text" value={a.nombre} onChange={(e) => p.onChangeAtributo(i, ai, "nombre", e.target.value)}
              placeholder="Atributo (Color)" className={inputSmallCls} />
            <input type="text" value={a.valor} onChange={(e) => p.onChangeAtributo(i, ai, "valor", e.target.value)}
              placeholder="Valor (Negro)" className={inputSmallCls} />
            <button type="button" onClick={() => p.onRemoveAtributo(i, ai)} className={removeBtnCls} title="Quitar atributo">×</button>
          </div>
        ))}
        <button type="button" onClick={() => p.onAddAtributo(i)} className="self-start text-xs font-medium text-indigo-600 hover:text-indigo-700">
          + Agregar atributo
        </button>
      </div>

      {/* Metacampos de la variante */}
      <div className="flex flex-col gap-2">
        <span className={subTitleCls}>
          Especificaciones de la variante <span className="font-normal normal-case text-slate-400">(solo para esta variante)</span>
        </span>
        {v.metacampos.length === 0 && <p className="text-xs text-slate-400">Sin especificaciones propias.</p>}
        {v.metacampos.map((m, mi) => (
          <div key={mi} className="flex gap-2 items-center">
            <input type="text" value={m.llave} onChange={(e) => p.onChangeMetacampo(i, mi, "llave", e.target.value)}
              placeholder="Clave" className={inputSmallCls} />
            <input type="text" value={m.valor} onChange={(e) => p.onChangeMetacampo(i, mi, "valor", e.target.value)}
              placeholder="Valor" className={inputSmallCls} />
            <button type="button" onClick={() => p.onRemoveMetacampo(i, mi)} className={removeBtnCls} title="Quitar especificación">×</button>
          </div>
        ))}
        <button type="button" onClick={() => p.onAddMetacampo(i)} className="self-start text-xs font-medium text-indigo-600 hover:text-indigo-700">
          + Agregar especificación
        </button>
      </div>
    </div>
  );
}

const GRID = "grid grid-cols-[24px_minmax(0,1fr)_130px_90px_32px] items-center gap-3";

export function SeccionVariantes(props: Props) {
  const { variantes, productoId, onAdd, onRemove, onChange, pricing } = props;
  const [editingNombre,   setEditingNombre]   = useState<number | null>(null);
  const [expanded,        setExpanded]        = useState<Set<number>>(new Set());
  const [mediaForVariant, setMediaForVariant] = useState<number | null>(null);

  // La variante base se edita a nivel producto; la tabla muestra solo las adicionales.
  const baseIdx   = Math.max(0, variantes.findIndex((v) => v.es_default));
  const extras    = variantes.map((v, i) => ({ v, i })).filter(({ i }) => i !== baseIdx);
  const sinExtras = extras.length === 0;

  const monedaHint = pricing?.monedaCaptura ?? "";

  const toggleExpand = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });

  return (
    <SectionCard title="Variantes">

      {sinExtras ? (
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
              El precio e inventario principal se editan arriba. Agrega variantes si el producto existe en
              diferentes opciones (talla, color, material…).
            </p>
          </div>
          <button type="button" onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-indigo-300 text-indigo-600 text-sm font-medium hover:bg-indigo-50 transition">
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
          <div className={`${GRID} px-3 pb-2 border-b border-slate-100`}>
            <span className="w-6" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Variante</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide text-center">Precio</span>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide text-center">Disponible</span>
            <span className="w-8" />
          </div>

          {/* Filas (solo variantes adicionales, sin la base) */}
          {extras.map(({ v, i }) => (
            <div key={i}>
              <div className={`${GRID} px-3 py-2.5 rounded-lg transition hover:bg-slate-50`}>
                {/* Toggle expandir */}
                <button type="button" onClick={() => toggleExpand(i)}
                  className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
                  title="Más detalles de la variante">
                  <svg className={`w-4 h-4 transition-transform ${expanded.has(i) ? "rotate-90" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Nombre editable inline */}
                <div className="flex items-center gap-2 min-w-0">
                  {/* Miniatura de la variante */}
                  <button type="button" onClick={() => setMediaForVariant(i)}
                    className="shrink-0 w-8 h-8 rounded-md border border-slate-200 bg-white overflow-hidden flex items-center justify-center hover:border-indigo-300 transition"
                    title={v.imagen ? "Cambiar imagen" : "Elegir imagen"}>
                    {v.imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImageUrl(v.imagen, productoId) ?? ""} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 6h16v12H4z" />
                      </svg>
                    )}
                  </button>
                  {editingNombre === i ? (
                    <input autoFocus type="text" value={v.nombre}
                      onChange={(e) => onChange(i, "nombre", e.target.value)}
                      onBlur={() => setEditingNombre(null)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingNombre(null); }}
                      placeholder="Ej: Aluminio, Talla M, Rojo…"
                      className={`${inputSmallCls} max-w-[220px]`} />
                  ) : (
                    <button type="button" onClick={() => setEditingNombre(i)}
                      className="flex items-center gap-1.5 text-left group min-w-0" title="Clic para editar nombre">
                      <VarianteLabel v={v} i={i} />
                      <svg className="w-3 h-3 text-slate-300 group-hover:text-slate-500 shrink-0 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.83a4 4 0 01-1.897 1.06l-2.685.671.671-2.686a4 4 0 011.06-1.897z" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Precio inline (precio_final) */}
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input type="number" min="0" step="0.01" value={v.precio_final}
                    onChange={(e) => onChange(i, "precio_final", e.target.value)}
                    placeholder="0.00"
                    className={`${inputSmallCls} pl-5 ${monedaHint ? "pr-9" : ""}`} />
                  {monedaHint && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.6rem] text-slate-400 pointer-events-none">{monedaHint}</span>
                  )}
                </div>

                {/* Disponible inline (stock) */}
                <input type="number" min="0" step="1"
                  value={v.stock}
                  onChange={(e) => onChange(i, "stock", e.target.value)}
                  placeholder="0"
                  title={v.vender_sin_existencia ? "Se vende sin existencia" : undefined}
                  className={`${inputSmallCls} text-center ${v.vender_sin_existencia ? "text-slate-400" : ""}`} />

                {/* Eliminar */}
                <div className="flex justify-center">
                  <button type="button" onClick={() => onRemove(i)}
                    className="text-slate-300 hover:text-red-400 transition" title="Eliminar variante">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {expanded.has(i) && (
                <VarianteDetalle v={v} i={i} p={props} productoId={productoId} onPick={setMediaForVariant} />
              )}
            </div>
          ))}

          {/* Agregar nueva variante */}
          <button type="button" onClick={onAdd}
            className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-2 rounded-lg hover:bg-indigo-50 transition self-start">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar variante
          </button>
        </div>
      )}

      {mediaForVariant !== null && (
        <ModalMediaLibrary
          productoId={productoId}
          onSelect={(items) => {
            if (items[0]) onChange(mediaForVariant, "imagen", items[0].url);
            setMediaForVariant(null);
          }}
          onClose={() => setMediaForVariant(null)}
        />
      )}
    </SectionCard>
  );
}
