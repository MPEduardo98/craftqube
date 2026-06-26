// app/admin/productos/components/sections/SeccionSEO.tsx
"use client";

import { useEffect } from "react";
import { SectionCard } from "../producto-form-ui";
import { inputCls, textareaCls } from "../producto-form-types";

interface Props {
  slug:                string;
  meta_titulo:         string;
  meta_descripcion:    string;
  precio?:             string;
  tituloFallback:      string;
  descripcionFallback: string;
  onMetaTitulo:        (v: string) => void;
  onMetaDescripcion:   (v: string) => void;
}

export function SeccionSEO({
  slug,
  meta_titulo,
  meta_descripcion,
  precio,
  tituloFallback,
  descripcionFallback,
  onMetaTitulo,
  onMetaDescripcion,
}: Props) {

  useEffect(() => {
    if (!meta_titulo && tituloFallback) onMetaTitulo(tituloFallback);
  }, [tituloFallback]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!meta_descripcion && descripcionFallback) {
      const texto = descripcionFallback.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      onMetaDescripcion(texto.slice(0, 160));
    }
  }, [descripcionFallback]); // eslint-disable-line react-hooks/exhaustive-deps

  const tituloDisplay      = meta_titulo      || tituloFallback || "";
  const descripcionDisplay = meta_descripcion || "";

  return (
    <SectionCard title="SEO">
      <div className="space-y-5">

        {/* Meta título */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Meta título</label>
          <input
            type="text"
            value={meta_titulo}
            onChange={(e) => onMetaTitulo(e.target.value)}
            placeholder={tituloFallback || "Meta título del producto"}
            className={inputCls}
            maxLength={100}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Recomendado: menos de 60 caracteres</span>
            <span className={`text-xs tabular-nums ${meta_titulo.length > 60 ? "text-amber-500 font-medium" : "text-slate-400"}`}>
              {meta_titulo.length}/60
            </span>
          </div>
        </div>

        {/* Meta descripción */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Meta descripción</label>
          <textarea
            value={meta_descripcion}
            onChange={(e) => onMetaDescripcion(e.target.value)}
            rows={4}
            placeholder="Descripción breve para motores de búsqueda…"
            className={textareaCls}
            maxLength={160}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Recomendado: entre 120 y 160 caracteres</span>
            <span className={`text-xs tabular-nums ${
              meta_descripcion.length > 160 ? "text-red-500 font-medium" :
              meta_descripcion.length >= 120 ? "text-emerald-600 font-medium" :
              "text-slate-400"
            }`}>
              {meta_descripcion.length}/160
            </span>
          </div>
        </div>

        {/* Slug (solo lectura) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Slug (URL)</label>
          <div className="relative">
            <input
              type="text"
              value={slug}
              readOnly
              tabIndex={-1}
              placeholder="se-genera-automaticamente"
              className={`${inputCls} bg-slate-50 text-slate-400 cursor-not-allowed pr-9`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
          </div>
          <p className="text-xs text-slate-400">/productos/{slug || "tu-slug-aqui"}</p>
        </div>

        {/* Preview Google */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-600 mb-3">Publicación en motores de búsqueda</p>
          <div className="space-y-0.5">
            <p className="text-sm text-slate-700">CraftQube México</p>
            <p className="text-xs text-[#006621] truncate">
              https://craftqube.mx › productos › {slug || "tu-slug-aqui"}
            </p>
            <p className="text-xl text-[#1a0dab] leading-snug line-clamp-1 pt-0.5">
              {tituloDisplay || <span className="text-slate-300">Meta título del producto</span>}
            </p>
            <p className="text-sm text-[#545454] leading-snug line-clamp-2 pt-0.5">
              {descripcionDisplay || <span className="text-slate-300">Meta descripción del producto…</span>}
            </p>
            {precio && Number(precio) > 0 && (
              <p className="text-sm text-[#545454] pt-0.5">
                {Number(precio).toLocaleString("es-MX", { style: "currency", currency: "MXN" })} MXN
              </p>
            )}
          </div>
        </div>

      </div>
    </SectionCard>
  );
}