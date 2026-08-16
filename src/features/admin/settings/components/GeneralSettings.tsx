"use client";
// features/admin/settings/components/GeneralSettings.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/shared/context/AlertContext";

type Moneda = "MXN" | "USD";

interface Props {
  monedaCaptura: Moneda;
  monedaTienda:  Moneda;
  /** Tipo de cambio en vivo: MXN por 1 USD */
  usdMxn:        number;
}

const MONEDAS: { value: Moneda; label: string }[] = [
  { value: "MXN", label: "Peso mexicano (MXN)" },
  { value: "USD", label: "Dólar estadounidense (USD)" },
];

const fmt = (n: number, m: Moneda) =>
  new Intl.NumberFormat(m === "USD" ? "en-US" : "es-MX", { style: "currency", currency: m }).format(n);

const cardCls = "rounded-xl border border-slate-200 bg-white p-5";
const selectCls =
  "w-full rounded-lg px-3 py-2 text-sm bg-white border border-slate-200 text-slate-800 " +
  "focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

export function GeneralSettings({ monedaCaptura, monedaTienda, usdMxn }: Props) {
  const router = useRouter();
  const alert  = useAlert();

  const [captura, setCaptura] = useState<Moneda>(monedaCaptura);
  const [tienda,  setTienda]  = useState<Moneda>(monedaTienda);
  const [saving,  setSaving]  = useState(false);

  const dirty = captura !== monedaCaptura || tienda !== monedaTienda;

  // Factor captura → tienda
  const factor =
    captura === tienda ? 1 :
    captura === "USD" && tienda === "MXN" ? usdMxn :
    captura === "MXN" && tienda === "USD" ? 1 / usdMxn : 1;

  const ejemplo = 100; // en moneda de captura
  const convertido = ejemplo * factor;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/configuracion", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ monedaCaptura: captura, monedaTienda: tienda }),
      });
      const json = await res.json();
      if (json.success) {
        alert.success("Configuración guardada");
        router.refresh();
      } else {
        alert.error(json.error ?? "No se pudo guardar");
      }
    } catch {
      alert.error("Error de red al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Moneda */}
      <section className={cardCls}>
        <h2 className="text-base font-semibold text-slate-800 mb-1">Moneda</h2>
        <p className="text-sm text-slate-400 mb-5">
          Captura los precios en una moneda y muéstralos en otra. La conversión usa el tipo de cambio en vivo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Moneda de captura</label>
            <select value={captura} onChange={(e) => setCaptura(e.target.value as Moneda)} className={selectCls}>
              {MONEDAS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <span className="text-xs text-slate-400">En la que el admin escribe los precios de los productos.</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Moneda de la tienda</label>
            <select value={tienda} onChange={(e) => setTienda(e.target.value as Moneda)} className={selectCls}>
              {MONEDAS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <span className="text-xs text-slate-400">En la que se muestra y se cobra al cliente.</span>
          </div>
        </div>

        {/* Tipo de cambio + preview */}
        <div className="mt-5 rounded-lg bg-slate-50 border border-slate-100 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Tipo de cambio FIX · Banxico</span>
            <span className="text-sm font-semibold text-slate-700 font-mono">1 USD = {usdMxn.toFixed(4)} MXN</span>
          </div>

          {captura === tienda ? (
            <p className="text-sm text-slate-500">
              Captura y tienda usan la misma moneda: no se aplica conversión.
            </p>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-700">{fmt(ejemplo, captura)}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              <span className="font-semibold text-[#1238a0]">{fmt(convertido, tienda)}</span>
              <span className="text-xs text-slate-400 ml-1">(ejemplo)</span>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Nota: se usa el tipo de cambio FIX de Banxico (oficial, 1 vez por día hábil). El carrito y el pedido
          fijan el monto en {tienda} al momento de la compra.
        </p>
      </section>

      {/* Guardar */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
          style={{
            background: dirty && !saving ? "var(--color-cq-blue-900, #1238a0)" : "#cbd5e1",
            color:      "#fff",
            cursor:     dirty && !saving ? "pointer" : "not-allowed",
          }}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
