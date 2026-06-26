// app/global/components/ui/ModalUnsavedChanges.tsx
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  onConfirm: () => void;
  onCancel:  () => void;
}

export function ModalUnsavedChanges({ onConfirm, onCancel }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter")  onConfirm();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onConfirm, onCancel]);

  const modal = (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background: "var(--color-cq-surface)",
          border:     "1px solid var(--color-cq-border)",
          boxShadow:  "0 24px 64px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)" }}
        >
          <i className="fa-solid fa-triangle-exclamation" style={{ color: "#ca8a04", fontSize: "1rem" }} />
        </div>

        {/* Texto */}
        <div className="flex flex-col gap-1.5">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize:   "1rem",
              fontWeight: 700,
              color:      "var(--color-cq-text)",
              margin:     0,
            }}
          >
            Cambios sin guardar
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize:   "0.83rem",
              color:      "var(--color-cq-muted)",
              lineHeight: 1.55,
              margin:     0,
            }}
          >
            Tienes cambios que no se han guardado. Si sales ahora los perderás.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: "transparent",
              border:     "1px solid var(--color-cq-border)",
              color:      "var(--color-cq-muted)",
              cursor:     "pointer",
            }}
          >
            Seguir editando
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: "#ef4444",
              border:     "none",
              color:      "#fff",
              cursor:     "pointer",
            }}
          >
            Salir sin guardar
          </button>
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}