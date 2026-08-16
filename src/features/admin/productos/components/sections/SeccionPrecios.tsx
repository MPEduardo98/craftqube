// app/admin/productos/components/sections/SeccionPrecios.tsx
"use client";

import { SectionCard, Field } from "../producto-form-ui";
import { inputSmallCls, type VarianteForm } from "../producto-form-types";

export interface PricingHint {
  monedaCaptura: "MXN" | "USD";
  monedaTienda:  "MXN" | "USD";
  /** Factor captura → tienda */
  factor:        number;
}

interface Props {
  variante: VarianteForm;
  onChange: (k: keyof VarianteForm, v: string | boolean) => void;
  pricing?: PricingHint;
}

const fmtMoneda = (n: number, m: "MXN" | "USD") =>
  new Intl.NumberFormat(m === "USD" ? "en-US" : "es-MX", { style: "currency", currency: m }).format(n);

export function SeccionPrecios({ variante: v, onChange, pricing }: Props) {
  const convierte = !!pricing && pricing.monedaCaptura !== pricing.monedaTienda;
  const final = parseFloat(v.precio_final) || 0;
  const costo = parseFloat(v.costo) || 0;
  const margen = final > 0 && costo > 0 ? ((final - costo) / final) * 100 : null;

  return (
    <SectionCard title="Precios">
      {pricing && (
        <p className="text-xs text-slate-500 mb-3">
          Capturando en{" "}
          <span className="font-semibold text-slate-700">{pricing.monedaCaptura}</span>
          {convierte && (
            <> · se mostrará en{" "}
              <span className="font-semibold text-slate-700">{pricing.monedaTienda}</span>{" "}
              <span className="text-slate-400">(1 USD = {(pricing.monedaCaptura === "USD" ? pricing.factor : 1 / pricing.factor).toFixed(2)} MXN)</span>
            </>
          )}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Field label="Precio original">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
            <input
              type="number" min="0" step="0.01"
              value={v.precio_original}
              onChange={(e) => onChange("precio_original", e.target.value)}
              className={`${inputSmallCls} pl-6`}
            />
          </div>
        </Field>

        <Field label="Precio final" required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
            <input
              type="number" min="0" step="0.01"
              value={v.precio_final}
              onChange={(e) => onChange("precio_final", e.target.value)}
              className={`${inputSmallCls} pl-6`}
            />
          </div>
          {convierte && pricing && final > 0 && (
            <p className="text-[0.7rem] text-slate-400 mt-1">
              ≈ {fmtMoneda(final * pricing.factor, pricing.monedaTienda)} en tienda
            </p>
          )}
        </Field>

        <Field label="Costo">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
            <input
              type="number" min="0" step="0.01"
              value={v.costo}
              onChange={(e) => onChange("costo", e.target.value)}
              className={`${inputSmallCls} pl-6`}
            />
          </div>
        </Field>
      </div>

      {margen !== null && (
        <p className="text-xs text-slate-400 mt-3">
          Margen:{" "}
          <span className={margen < 0 ? "text-red-500" : "text-emerald-600"}>
            {margen.toFixed(1)}%
          </span>
        </p>
      )}
    </SectionCard>
  );
}
