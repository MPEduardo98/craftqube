"use client";
// features/admin/settings/components/EnviosSettings.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/shared/context/AlertContext";
import { ESTADOS_MX } from "@/shared/data/estados-mx";
import { Modal } from "@/shared/components/ui/Modal";
import MX from "country-flag-icons/react/3x2/MX";

export interface ZonaForm {
  id?:          number;
  nombre:       string;
  activa:       boolean;
  estados:      string[];
  precio_guia:  string;
  flete_base:   string;
  flete_por_kg: string;
}
export interface CapsForm { peso_max_kg: string; volumen_max_m3: string; dim_max_cm: string; }

interface Props {
  initialCaps:  CapsForm;
  initialZonas: ZonaForm[];
}

const cardCls   = "rounded-xl border border-slate-200 bg-white p-5";
const inputCls  = "w-full rounded-lg px-3 py-2 text-sm bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";
const smallCls  = "w-full rounded-md px-2.5 py-1.5 text-sm bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400";
const labelCls  = "text-xs font-medium text-slate-600";
const linkBtn   = "text-xs font-medium text-indigo-600 hover:text-indigo-700";
const xBtn      = "shrink-0 w-7 h-7 rounded-md border border-slate-200 text-slate-400 hover:text-red-400 hover:border-red-200 transition flex items-center justify-center text-sm";

export function EnviosSettings({ initialCaps, initialZonas }: Props) {
  const router = useRouter();
  const alert  = useAlert();
  const [caps,  setCaps]  = useState<CapsForm>(initialCaps);
  const [zonas, setZonas] = useState<ZonaForm[]>(initialZonas);
  const [saving, setSaving] = useState(false);

  // Modal de estados (con buffer + búsqueda; confirma con "Listo")
  const [modalZona,   setModalZona]   = useState<number | null>(null);
  const [buffer,      setBuffer]      = useState<Set<string>>(new Set());
  const [buscar,      setBuscar]      = useState("");
  const [paisAbierto, setPaisAbierto] = useState(false);

  const setCap = (k: keyof CapsForm, v: string) => setCaps((p) => ({ ...p, [k]: v }));

  const updateZona = (i: number, patch: Partial<ZonaForm>) =>
    setZonas((zs) => zs.map((z, idx) => idx === i ? { ...z, ...patch } : z));

  const addZona = () =>
    setZonas((zs) => [...zs, { nombre: "", activa: true, estados: [], precio_guia: "", flete_base: "", flete_por_kg: "" }]);
  const removeZona = (i: number) => setZonas((zs) => zs.filter((_, idx) => idx !== i));

  const abrirModal = (zi: number) => { setBuffer(new Set(zonas[zi].estados)); setBuscar(""); setPaisAbierto(false); setModalZona(zi); };
  const cerrarModal = () => setModalZona(null);

  const toggleBuffer = (estado: string) =>
    setBuffer((prev) => {
      const n = new Set(prev);
      if (n.has(estado)) n.delete(estado); else n.add(estado);
      return n;
    });
  const toggleTodos = () =>
    setBuffer((prev) => prev.size === ESTADOS_MX.length ? new Set() : new Set(ESTADOS_MX));

  // Confirmar: asigna al zona actual y quita esos estados de las demás (exclusividad)
  const confirmarModal = () => {
    if (modalZona === null) return;
    const zi = modalZona;
    const sel = buffer;
    setZonas((zs) => zs.map((z, idx) =>
      idx === zi
        ? { ...z, estados: ESTADOS_MX.filter((e) => sel.has(e)) }
        : { ...z, estados: z.estados.filter((e) => !sel.has(e)) }
    ));
    setModalZona(null);
  };

  const handleSave = async () => {
    if (zonas.some((z) => !z.nombre.trim())) { alert.error("Toda zona necesita un nombre"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/envio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caps, zonas }),
      });
      const json = await res.json();
      if (json.success) { alert.success("Configuración de envíos guardada"); router.refresh(); }
      else alert.error(json.error ?? "No se pudo guardar");
    } catch {
      alert.error("Error de red al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Parámetros de guía */}
      <section className={cardCls}>
        <h2 className="text-base font-semibold text-slate-800 mb-1">Parámetros de guía</h2>
        <p className="text-sm text-slate-400 mb-4">
          Límites de una guía. Si un pedido los excede, se cobran más guías. Un artículo que supere la dimensión máxima usa flete.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Peso máximo por guía (kg)</label>
            <input type="number" min="0" step="0.1" value={caps.peso_max_kg} onChange={(e) => setCap("peso_max_kg", e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Volumen máximo por guía (m³)</label>
            <input type="number" min="0" step="0.0001" value={caps.volumen_max_m3} onChange={(e) => setCap("volumen_max_m3", e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Dimensión máxima por lado (cm)</label>
            <input type="number" min="0" step="1" value={caps.dim_max_cm} onChange={(e) => setCap("dim_max_cm", e.target.value)} className={inputCls} />
          </div>
        </div>
      </section>

      {/* Zonas */}
      <section className={cardCls}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-slate-800">Zonas y tarifas</h2>
          <button type="button" onClick={addZona} className={linkBtn}>+ Agregar zona</button>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Cada zona agrupa estados con su precio por guía y su flete (base + $/kg).
        </p>

        {zonas.length === 0 && (
          <p className="text-sm text-slate-400">Sin zonas. Agrega al menos una.</p>
        )}

        <div className="flex flex-col gap-4">
          {zonas.map((z, zi) => (
            <div key={z.id ?? `new-${zi}`} className="rounded-lg border border-slate-200 p-4 flex flex-col gap-4">
              {/* Encabezado zona */}
              <div className="flex items-center gap-3">
                <input
                  type="text" value={z.nombre} placeholder="Nombre de la zona (ej. Centro)"
                  onChange={(e) => updateZona(zi, { nombre: e.target.value })}
                  className={`${inputCls} font-medium`}
                />
                <label className="flex items-center gap-2 shrink-0 cursor-pointer select-none">
                  <input type="checkbox" checked={z.activa} onChange={(e) => updateZona(zi, { activa: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500/20" />
                  <span className="text-sm text-slate-600">Activa</span>
                </label>
                <button type="button" onClick={() => removeZona(zi)} className={xBtn} title="Eliminar zona">×</button>
              </div>

              {/* Tarifas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Precio por guía ($)</label>
                  <input type="number" min="0" step="0.01" value={z.precio_guia} onChange={(e) => updateZona(zi, { precio_guia: e.target.value })} className={smallCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Flete base ($)</label>
                  <input type="number" min="0" step="0.01" value={z.flete_base} onChange={(e) => updateZona(zi, { flete_base: e.target.value })} className={smallCls} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Flete por kg ($)</label>
                  <input type="number" min="0" step="0.01" value={z.flete_por_kg} onChange={(e) => updateZona(zi, { flete_por_kg: e.target.value })} className={smallCls} />
                </div>
              </div>

              {/* Estados */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className={labelCls}>Estados de esta zona ({z.estados.length})</span>
                  <button type="button" onClick={() => abrirModal(zi)} className={linkBtn}>Elegir estados</button>
                </div>
                {z.estados.length === 0 ? (
                  <p className="text-xs text-slate-400">Ningún estado asignado.</p>
                ) : z.estados.length === ESTADOS_MX.length ? (
                  <p className="text-xs text-slate-500">Todos los estados de México.</p>
                ) : (
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {[...z.estados].sort((a, b) => a.localeCompare(b)).join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guardar */}
      <div className="flex justify-end">
        <button
          type="button" onClick={handleSave} disabled={saving}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
          style={{ background: saving ? "#cbd5e1" : "var(--color-cq-blue-900, #1238a0)", color: "#fff", cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {/* Modal de selección de estados (estilo Shopify) */}
      <Modal
        open={modalZona !== null}
        onClose={cerrarModal}
        title="Editar regiones de la zona"
        maxWidth="34rem"
        footer={
          <>
            <button type="button" onClick={cerrarModal}
              className="rounded-lg px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="button" onClick={confirmarModal}
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: "var(--color-cq-blue-900, #1238a0)", color: "#fff" }}>
              Listo
            </button>
          </>
        }
      >
        {modalZona !== null && (() => {
          const q = buscar.trim().toLowerCase();
          const filtrados = ESTADOS_MX.filter((e) => e.toLowerCase().includes(q));
          const todosSel = buffer.size === ESTADOS_MX.length;
          // Estados que ya pertenecen a OTRA zona (se moverán si se eligen aquí)
          const enOtraZona = new Map<string, string>();
          zonas.forEach((z, idx) => {
            if (idx !== modalZona) z.estados.forEach((e) => enOtraZona.set(e, z.nombre.trim() || `Zona ${idx + 1}`));
          });
          return (
            <div className="flex flex-col gap-3">
              {/* Buscador */}
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
                <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar estado"
                  className="w-full rounded-lg pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
              </div>

              {/* Lista */}
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                {/* Encabezado país (desplegable) */}
                <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 border-b border-slate-100">
                  <input type="checkbox" checked={todosSel} onChange={toggleTodos}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500/20" />
                  <button type="button" onClick={() => setPaisAbierto((o) => !o)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <MX title="México" style={{ width: 22, height: 15, borderRadius: 2, flexShrink: 0 }} />
                    <span className="text-sm font-semibold text-slate-700 flex-1">México</span>
                    <span className="text-xs text-slate-400">{buffer.size} de {ESTADOS_MX.length} estados</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform ${(paisAbierto || q) ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {/* Estados (desglosados al abrir el país o al buscar) */}
                {(paisAbierto || q) && (
                  <div className="max-h-[320px] overflow-y-auto">
                    {filtrados.length === 0 ? (
                      <p className="text-sm text-slate-400 px-3 py-4 text-center">Sin resultados.</p>
                    ) : filtrados.map((estado) => (
                      <label key={estado} className="flex items-center gap-3 pl-9 pr-3 py-2 hover:bg-slate-50 cursor-pointer select-none border-b border-slate-50 last:border-b-0">
                        <input type="checkbox" checked={buffer.has(estado)} onChange={() => toggleBuffer(estado)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500/20" />
                        <span className="text-sm text-slate-700">{estado}</span>
                        {!buffer.has(estado) && enOtraZona.has(estado) && (
                          <span className="ml-auto text-xs text-amber-500" title={`Actualmente en ${enOtraZona.get(estado)}`}>
                            en {enOtraZona.get(estado)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Un estado pertenece a una sola zona: al confirmar, se quita de la zona donde estuviera.
              </p>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
