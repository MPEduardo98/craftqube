"use client";
// features/admin/settings/components/GeneralSettings.tsx
// ─────────────────────────────────────────────────────────────
// Ajustes generales: identidad de la tienda, tema del panel y
// moneda. Es la pantalla que hace que el mismo panel sirva a
// cualquier tienda — lo que se guarda aquí es lo que el código
// ya no trae escrito a mano.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/shared/context/AlertContext";

type Moneda = "MXN" | "USD";

interface Props {
  nombre:        string;
  descripcion:   string;
  logoUrl:       string;
  email:         string;
  telefono:      string;
  colorPrimario: string;
  colorAcento:   string;
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
const inputCls = selectCls;

const esColorValido = (v: string) => /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());

export function GeneralSettings(props: Props) {
  const router = useRouter();
  const alert  = useAlert();

  // ── Identidad ──────────────────────────────────────────────
  const [nombre,      setNombre]      = useState(props.nombre);
  const [descripcion, setDescripcion] = useState(props.descripcion);
  const [logoUrl,     setLogoUrl]     = useState(props.logoUrl);
  const [email,       setEmail]       = useState(props.email);
  const [telefono,    setTelefono]    = useState(props.telefono);

  // ── Tema ───────────────────────────────────────────────────
  const [colorPrimario, setColorPrimario] = useState(props.colorPrimario);
  const [colorAcento,   setColorAcento]   = useState(props.colorAcento);

  // ── Moneda ─────────────────────────────────────────────────
  const [captura, setCaptura] = useState<Moneda>(props.monedaCaptura);
  const [tienda,  setTienda]  = useState<Moneda>(props.monedaTienda);

  const [saving, setSaving] = useState(false);

  const dirty =
    nombre        !== props.nombre        ||
    descripcion   !== props.descripcion   ||
    logoUrl       !== props.logoUrl       ||
    email         !== props.email         ||
    telefono      !== props.telefono      ||
    colorPrimario !== props.colorPrimario ||
    colorAcento   !== props.colorAcento   ||
    captura       !== props.monedaCaptura ||
    tienda        !== props.monedaTienda;

  // Factor captura → tienda
  const factor =
    captura === tienda ? 1 :
    captura === "USD" && tienda === "MXN" ? props.usdMxn :
    captura === "MXN" && tienda === "USD" ? 1 / props.usdMxn : 1;

  const ejemplo = 100; // en moneda de captura
  const convertido = ejemplo * factor;

  const handleSave = async () => {
    // El nombre rotula el panel entero: vacío dejaría la tienda sin marca.
    if (!nombre.trim()) {
      alert.error("El nombre de la tienda no puede quedar vacío");
      return;
    }
    if (!esColorValido(colorPrimario) || !esColorValido(colorAcento)) {
      alert.error("Los colores deben ser hexadecimales, por ejemplo #1238a0");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/configuracion", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          nombre, descripcion, logoUrl, email, telefono,
          colorPrimario, colorAcento,
          monedaCaptura: captura, monedaTienda: tienda,
        }),
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
      {/* ── Identidad ───────────────────────────────────────── */}
      <section className={cardCls}>
        <h2 className="text-base font-semibold text-slate-800 mb-1">Identidad de la tienda</h2>
        <p className="text-sm text-slate-400 mb-5">
          Aparece en el panel, en los correos y en los metadatos del sitio.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">Nombre</label>
            <input
              type="text" value={nombre} maxLength={100}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Mi Tienda" className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">Descripción corta</label>
            <input
              type="text" value={descripcion} maxLength={200}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="A qué se dedica la tienda" className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">Logo</label>
            <input
              type="text" value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="/Logo.png o https://…" className={inputCls}
            />
            <span className="text-xs text-slate-400">
              Ruta o URL de la imagen. Si se deja vacío, el panel muestra el nombre en texto.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Correo de contacto</label>
            <input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hola@mitienda.mx" className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Teléfono</label>
            <input
              type="tel" value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="55 1234 5678" className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* ── Tema ────────────────────────────────────────────── */}
      <section className={cardCls}>
        <h2 className="text-base font-semibold text-slate-800 mb-1">Tema del panel</h2>
        <p className="text-sm text-slate-400 mb-5">
          Los cambios se ven al guardar y recargar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { label: "Color primario", hint: "Barra lateral y botones principales.", value: colorPrimario, set: setColorPrimario },
            { label: "Color de acento", hint: "Enlaces, estados activos y resaltes.", value: colorAcento,   set: setColorAcento   },
          ] as const).map(({ label, hint, value, set }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={esColorValido(value) ? value : "#000000"}
                  onChange={(e) => set(e.target.value)}
                  className="h-9 w-12 shrink-0 rounded border border-slate-200 bg-white p-1 cursor-pointer"
                  aria-label={label}
                />
                <input
                  type="text" value={value} maxLength={7}
                  onChange={(e) => set(e.target.value)}
                  placeholder="#1238a0"
                  className={`${inputCls} font-mono ${esColorValido(value) ? "" : "border-red-300"}`}
                />
              </div>
              <span className="text-xs text-slate-400">{hint}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Moneda ──────────────────────────────────────────── */}
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
            <span className="text-sm font-semibold text-slate-700 font-mono">1 USD = {props.usdMxn.toFixed(4)} MXN</span>
          </div>

          {captura === tienda ? (
            <p className="text-sm text-slate-500">
              Captura y tienda usan la misma moneda: no se aplica conversión.
            </p>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-700">{fmt(ejemplo, captura)}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              <span className="font-semibold" style={{ color: "var(--color-cq-blue-900, #1238a0)" }}>{fmt(convertido, tienda)}</span>
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
