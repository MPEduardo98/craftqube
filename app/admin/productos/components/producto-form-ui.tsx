"use client";
// app/admin/productos/components/producto-form-ui.tsx
// ─────────────────────────────────────────────────────────────
// Componentes UI reutilizables del formulario de productos.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { resolveImageUrl } from "@/app/global/lib/resolveImageUrl";

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