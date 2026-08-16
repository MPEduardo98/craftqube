"use client";
// app/admin/productos/components/producto-form-ui.tsx
// ─────────────────────────────────────────────────────────────
// Componentes UI reutilizables del formulario de productos.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { resolveImageUrl } from "@/features/media/lib/resolveImageUrl";

/* ── SectionCard ───────────────────────────────────────────── */
export function SectionCard({ title, children, action }: {
  title:    string;
  children: React.ReactNode;
  action?:  React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── InfoTooltip ───────────────────────────────────────────── */
// Icono "i" que revela un panel de ayuda al pasar el mouse (o al enfocar
// con teclado). El panel se ancla a la derecha por defecto para no salirse
// del contenedor cuando el icono está pegado al borde de la tarjeta.
export function InfoTooltip({ children, align = "right", width = 420 }: {
  children: React.ReactNode;
  align?:   "left" | "right";
  width?:   number;
}) {
  return (
    <span className="relative inline-flex group align-middle">
      <button
        type="button"
        aria-label="Más información"
        className="w-4 h-4 rounded-full border border-slate-300 text-slate-400 text-[0.6rem] font-semibold leading-none flex items-center justify-center cursor-help transition-colors hover:border-indigo-400 hover:text-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        onClick={(e) => e.preventDefault()}
      >
        i
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-30 top-full mt-1.5 ${align === "right" ? "left-0" : "right-0"} rounded-lg bg-slate-800 text-slate-100 px-3 py-2 text-[0.7rem] leading-relaxed font-normal normal-case tracking-normal text-left shadow-lg opacity-0 invisible translate-y-0.5 transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0`}
        style={{ width, maxWidth: "calc(100vw - 3rem)" }}
      >
        {children}
      </span>
    </span>
  );
}

/* ── Field ─────────────────────────────────────────────────── */
export function Field({ label, required, children, hint }: {
  label:     string;
  required?: boolean;
  children:  React.ReactNode;
  hint?:     string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/* ── ImagePreview ──────────────────────────────────────────── */
export function ImagePreview({ url }: { url: string }) {
  const [broken, setBroken] = useState(false);
  const src = resolveImageUrl(url, undefined) ?? undefined;

  if (!url || broken) {
    return (
      <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="w-14 h-14 rounded-lg border border-slate-200 object-cover shrink-0 bg-slate-50"
    />
  );
}