"use client";

import { useState } from "react";

export function CartButton() {
  const [count] = useState(0);

  return (
    <button
      className="relative p-2 rounded-sm transition-all duration-200"
      style={{
        background: "rgba(23, 53, 128, 0.15)",
        border: "1px solid var(--color-cq-800)",
        color: "var(--color-cq-200)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-600)";
        (e.currentTarget as HTMLElement).style.background = "rgba(23, 53, 128, 0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-800)";
        (e.currentTarget as HTMLElement).style.background = "rgba(23, 53, 128, 0.15)";
      }}
      aria-label={`Carrito (${count} artículos)`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold"
          style={{
            background: "var(--color-cq-accent)",
            color: "var(--color-cq-950)",
            fontSize: "0.6rem",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}