// shared/components/ui/Modal.tsx
// ─────────────────────────────────────────────────────────────
// Modal global reutilizable en todo el sitio.
//
// - Se renderiza vía portal sobre <body> (z-index alto).
// - Cierra con Escape, clic en el backdrop (configurable) y botón "×".
// - Bloquea el scroll del fondo mientras está abierto.
// - Estructura: cabecera (icono opcional + título + cerrar), cuerpo
//   (children) y pie opcional (footer).
//
// Ejemplo:
//   <Modal open={open} onClose={() => setOpen(false)} title="Nueva marca">
//     …contenido…
//   </Modal>
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open:             boolean;
  onClose:          () => void;
  title?:           string;
  icon?:            React.ReactNode;
  children:         React.ReactNode;
  footer?:          React.ReactNode;
  /** Ancho máximo del panel (px o cualquier valor CSS). Default 28rem. */
  maxWidth?:        number | string;
  /** Cerrar al hacer clic fuera del panel. Default true. */
  closeOnBackdrop?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = "28rem",
  closeOnBackdrop = true,
}: ModalProps) {
  // Escape para cerrar + bloqueo de scroll de fondo.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className="w-full rounded-2xl flex flex-col gap-5 p-6"
        style={{
          maxWidth,
          background: "var(--color-cq-surface)",
          border:     "1px solid var(--color-cq-border)",
          boxShadow:  "0 24px 64px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Cabecera */}
        {(title || icon) && (
          <div className="flex items-start gap-3">
            {icon}
            <h2
              className="flex-1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize:   "1rem",
                fontWeight: 700,
                color:      "var(--color-cq-text)",
                margin:     0,
              }}
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="shrink-0 flex items-center justify-center rounded-lg transition-colors"
              style={{
                width:      "28px",
                height:     "28px",
                border:     "1px solid var(--color-cq-border)",
                background: "transparent",
                color:      "var(--color-cq-muted)",
                cursor:     "pointer",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Cuerpo */}
        <div className="flex flex-col gap-4">{children}</div>

        {/* Pie */}
        {footer && (
          <div className="flex items-center gap-2 justify-end">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
