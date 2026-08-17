"use client";
// shared/components/ui/Dropdown.tsx
// ─────────────────────────────────────────────────────────────
// Dropdown genérico (componente global de select del panel admin).
// Reemplaza al <select> nativo en formularios y tablas del admin.
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useEffect } from "react";

export interface DropdownOption { value: string; label: string; }

interface DropdownProps {
  value:             string;
  onChange:          (v: string) => void;
  options:           DropdownOption[];
  icon?:             React.ReactNode;
  placeholder?:      string;
  align?:            "left" | "right";
  width?:            number;
  disabled?:         boolean;
  triggerStyle?:     React.CSSProperties;
  triggerClassName?: string;
}

export function Dropdown({
  value, onChange, options, icon, placeholder, align = "right", width = 176, disabled = false,
  triggerStyle, triggerClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <style>{`
        .cq-dd-option:hover {
          background: var(--color-cq-surface-2, #f1f5f9) !important;
        }
        .cq-dd-option.is-selected:hover {
          background: var(--color-cq-accent-glow-2, rgba(37,99,235,0.12)) !important;
        }
        .cq-dd-trigger:not(:disabled):hover {
          filter: brightness(0.96);
        }
      `}</style>
      <button
        type="button"
        onClick={() => !disabled && setOpen(v => !v)}
        disabled={disabled}
        className={`cq-dd-trigger ${triggerClassName ?? "flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors"}`}
        style={{
          border:     "1px solid var(--color-cq-border, #e2e8f0)",
          background: open ? "var(--color-cq-surface-2, #f1f5f9)" : "var(--color-cq-surface, #fff)",
          color:      "var(--color-cq-muted, #64748b)",
          fontFamily: "var(--font-mono, monospace)",
          cursor:     disabled ? "not-allowed" : "pointer",
          opacity:    disabled ? 0.6 : 1,
          ...triggerStyle,
        }}
      >
        {icon}
        {current?.label ?? placeholder ?? "Seleccionar"}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-1.5 rounded-xl overflow-hidden z-30 py-1`}
          style={{ width, background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
        >
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`cq-dd-option${o.value === value ? " is-selected" : ""} w-full text-left px-4 py-2 text-[12px] transition-colors flex items-center gap-2`}
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color:      o.value === value ? "var(--color-cq-accent, #2563eb)" : "var(--color-cq-text, #0f172a)",
                background: o.value === value ? "var(--color-cq-accent-glow, rgba(37,99,235,0.06))" : "transparent",
                cursor:     "pointer",
              }}
            >
              {o.value === value && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              <span style={{ marginLeft: o.value === value ? 0 : 14 }}>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
