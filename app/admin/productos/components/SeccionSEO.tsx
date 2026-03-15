"use client";
// app/admin/productos/components/SeccionSEO.tsx
// ─────────────────────────────────────────────────────────────
// Sección SEO: pre-popula desde titulo/descripcion/slug del
// producto pero permite editar libremente cada campo.
// ─────────────────────────────────────────────────────────────
import { useEffect } from "react";
import { SectionCard, Field } from "./producto-form-ui";
import { inputCls, textareaCls } from "./producto-form-types";

interface Props {
  slug:                 string;
  meta_titulo:          string;
  meta_descripcion:     string;
  precio?:              string;
  tituloFallback:       string;
  descripcionFallback:  string;
  onMetaTitulo:         (v: string) => void;
  onMetaDescripcion:    (v: string) => void;
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

  /* Pre-popular desde fallbacks solo si el campo está vacío */
  useEffect(() => {
    if (!meta_titulo && tituloFallback) onMetaTitulo(tituloFallback);
  }, [tituloFallback]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!meta_descripcion && descripcionFallback) {
      const texto = descripcionFallback.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      onMetaDescripcion(texto);
    }
  }, [descripcionFallback]); // eslint-disable-line react-hooks/exhaustive-deps

  const tituloDisplay      = meta_titulo      || tituloFallback      || "";
  const descripcionDisplay = meta_descripcion || "";

  return (
    <SectionCard title="SEO">
      <div className="space-y-4">

        {/* Meta título */}
        <Field label="Meta título" hint="Recomendado: menos de 60 caracteres">
          <input
            type="text"
            value={meta_titulo}
            onChange={(e) => onMetaTitulo(e.target.value)}
            placeholder={tituloFallback || "Meta título del producto"}
            className={inputCls}
            maxLength={100}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${meta_titulo.length > 60 ? "text-amber-500" : "text-slate-400"}`}>
              {meta_titulo.length}/60
            </span>
          </div>
        </Field>

        {/* Meta descripción */}
        <Field label="Meta descripción" hint="Recomendado: entre 120 y 160 caracteres">
          <textarea
            value={meta_descripcion}
            onChange={(e) => onMetaDescripcion(e.target.value)}
            rows={4}
            placeholder="Descripción breve del producto para motores de búsqueda. Máximo 160 caracteres."
            className={textareaCls}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${
              meta_descripcion.length > 160 ? "text-red-500" :
              meta_descripcion.length > 120 ? "text-emerald-500" : "text-slate-400"
            }`}>
              {meta_descripcion.length}/160
            </span>
          </div>
        </Field>

        {/* Slug */}
        <Field label="Slug (URL)" hint={`/productos/${slug || "tu-slug-aqui"}`}>
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
        </Field>

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
              {descripcionDisplay || <span className="text-slate-300">Meta descripción del producto para motores de búsqueda...</span>}
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