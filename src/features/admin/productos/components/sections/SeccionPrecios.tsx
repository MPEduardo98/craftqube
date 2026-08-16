// app/admin/productos/components/sections/SeccionPrecios.tsx
"use client";

import { SectionCard, Field, InfoTooltip } from "../producto-form-ui";
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
  const final    = parseFloat(v.precio_final)    || 0;
  const original = parseFloat(v.precio_original) || 0;
  const costo    = parseFloat(v.costo)           || 0;
  const margen = final > 0 && costo > 0 ? ((final - costo) / final) * 100 : null;

  const hayDescuento  = original > 0 && original > final;
  const descuentoPct  = hayDescuento ? Math.round(((original - final) / original) * 100) : 0;
  // Original capturado pero por debajo del final: la tienda lo ignoraría en silencio.
  const originalInutil = original > 0 && original <= final;

  return (
    <SectionCard
      title="Precios"
      action={
        <InfoTooltip align="left">
          <span className="block mb-1.5">
            <span className="font-semibold text-white">Precio final</span> — lo que el cliente paga. Es el único obligatorio.
          </span>
          <span className="block mb-1.5">
            <span className="font-semibold text-white">Precio original</span> — precio de lista tachado en la tienda. Déjalo en 0 si no hay oferta; si lo pones mayor al final, se muestra tachado con el % de descuento.
          </span>
          <span className="block">
            <span className="font-semibold text-white">Costo</span> — uso interno. Nunca se muestra en la tienda; solo sirve para calcular tu margen aquí abajo.
          </span>
        </InfoTooltip>
      }
    >
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
          {hayDescuento && (
            <p className="text-[0.7rem] text-emerald-600 mt-1">
              Se mostrará −{descuentoPct}% en la tienda
            </p>
          )}
          {originalInutil && (
            <p className="text-[0.7rem] text-amber-600 mt-1">
              Debe ser mayor al precio final para mostrar descuento
            </p>
          )}
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
