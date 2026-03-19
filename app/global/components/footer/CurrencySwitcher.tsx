// app/global/components/footer/CurrencySwitcher.tsx
"use client";

import { useCurrency } from "@/app/global/context/CurrencyContext";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-1" style={{ background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "3px" }}>
      {(["MXN", "USD"] as const).map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          style={{
            padding:      "4px 10px",
            borderRadius: "6px",
            border:       "none",
            cursor:       "pointer",
            fontFamily:   "var(--font-jetbrains, monospace)",
            fontSize:     "0.65rem",
            letterSpacing:"0.1em",
            fontWeight:   600,
            transition:   "all 0.15s",
            background:   currency === c ? "rgba(255,255,255,0.15)" : "transparent",
            color:        currency === c ? "rgba(255,255,255,0.9)"  : "rgba(255,255,255,0.35)",
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}