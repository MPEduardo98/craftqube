// features/admin/cupones/components/ModalCupon.tsx
// ─────────────────────────────────────────────────────────────
// Modal de crear/editar cupón. Usa el Modal global y
// POST/PUT /api/admin/cupones.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useEffect } from "react";
import { Modal }      from "@/shared/components/ui/Modal";
import { Loader }     from "@/shared/components/ui/Loader";
import { Dropdown }   from "@/shared/components/ui/Dropdown";
import { useAlert }   from "@/shared/context/AlertContext";
import { inputCls, textareaCls } from "@/features/admin/productos/components/producto-form-types";
import { TIPO_LABEL, APLICA_LABEL, soportaAplicaEnvio, type CuponRow, type CuponTipo, type CuponAplica } from "../types";

interface Props {
  open:    boolean;
  onClose: () => void;
  onSaved: (cupon: CuponRow) => void;
  cupon?:  CuponRow | null;
}

const TIPO_OPTIONS = (Object.keys(TIPO_LABEL) as CuponTipo[])
  .map(v => ({ value: v, label: TIPO_LABEL[v] }));

const APLICA_OPTIONS = (Object.keys(APLICA_LABEL) as CuponAplica[])
  .map(v => ({ value: v, label: APLICA_LABEL[v] }));

/** DATETIME de MySQL → valor de un <input type="datetime-local">. */
function toInputDatetime(v: string | null): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Código aleatorio legible, sin caracteres ambiguos (0/O, 1/I). */
function codigoAleatorio(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += abc[Math.floor(Math.random() * abc.length)];
  return out;
}

export function ModalCupon({ open, onClose, onSaved, cupon }: Props) {
  const alert  = useAlert();
  const isEdit = !!cupon;

  const [codigo,           setCodigo]           = useState("");
  const [descripcion,      setDescripcion]      = useState("");
  const [tipo,             setTipo]             = useState<CuponTipo>("porcentaje");
  const [valor,            setValor]            = useState("");
  const [minimoCompra,     setMinimoCompra]     = useState("");
  const [maximoDescuento,  setMaximoDescuento]  = useState("");
  const [usoMaximoTotal,   setUsoMaximoTotal]   = useState("");
  const [usoMaximoUsuario, setUsoMaximoUsuario] = useState("1");
  const [aplicaA,          setAplicaA]          = useState<CuponAplica>("todos");
  const [aplicaEnvio,      setAplicaEnvio]      = useState(false);
  const [activo,           setActivo]           = useState(true);
  const [validoDesde,      setValidoDesde]      = useState("");
  const [validoHasta,      setValidoHasta]      = useState("");
  const [saving,           setSaving]           = useState(false);

  useEffect(() => {
    if (!open) return;
    setCodigo(cupon?.codigo ?? "");
    setDescripcion(cupon?.descripcion ?? "");
    setTipo(cupon?.tipo ?? "porcentaje");
    setValor(cupon && cupon.valor != null ? String(cupon.valor) : "");
    setMinimoCompra(cupon?.minimo_compra != null ? String(cupon.minimo_compra) : "");
    setMaximoDescuento(cupon?.maximo_descuento != null ? String(cupon.maximo_descuento) : "");
    setUsoMaximoTotal(cupon?.uso_maximo_total != null ? String(cupon.uso_maximo_total) : "");
    setUsoMaximoUsuario(String(cupon?.uso_maximo_usuario ?? 1));
    setAplicaA(cupon?.aplica_a ?? "todos");
    setAplicaEnvio(Boolean(Number(cupon?.aplica_envio ?? 0)));
    setActivo(cupon ? Boolean(Number(cupon.activo)) : true);
    setValidoDesde(toInputDatetime(cupon?.valido_desde ?? null));
    setValidoHasta(toInputDatetime(cupon?.valido_hasta ?? null));
  }, [open, cupon]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  /* Envío gratis y 2x1 no tienen importe configurable. */
  const necesitaValor = tipo === "porcentaje" || tipo === "monto_fijo";
  /* Sólo esos dos tipos pueden descontar también sobre el envío. */
  const permiteEnvio  = soportaAplicaEnvio(tipo);
  const puedeGuardar  = codigo.trim().length > 0 && (!necesitaValor || Number(valor) > 0);

  const handleSave = async () => {
    const code = codigo.trim().toUpperCase();
    if (!code) return;

    if (tipo === "porcentaje" && (Number(valor) <= 0 || Number(valor) > 100)) {
      alert.error("El porcentaje debe estar entre 1 y 100");
      return;
    }
    if (tipo === "monto_fijo" && Number(valor) <= 0) {
      alert.error("El monto del descuento debe ser mayor a 0");
      return;
    }
    if (validoDesde && validoHasta && new Date(validoDesde) > new Date(validoHasta)) {
      alert.error("La fecha de inicio no puede ser posterior a la de fin");
      return;
    }

    setSaving(true);
    try {
      const url    = isEdit ? `/api/admin/cupones/${cupon!.id}` : "/api/admin/cupones";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo:             code,
          descripcion:        descripcion.trim(),
          tipo,
          valor:              necesitaValor ? Number(valor) : 0,
          minimo_compra:      minimoCompra    === "" ? null : Number(minimoCompra),
          maximo_descuento:   maximoDescuento === "" ? null : Number(maximoDescuento),
          uso_maximo_total:   usoMaximoTotal  === "" ? null : Number(usoMaximoTotal),
          uso_maximo_usuario: Number(usoMaximoUsuario) || 1,
          aplica_a:           aplicaA,
          aplica_envio:       permiteEnvio && aplicaEnvio,
          activo,
          valido_desde:       validoDesde || null,
          valido_hasta:       validoHasta || null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        alert.error(json.error ?? "Error al guardar el cupón");
        return;
      }
      onSaved(json.data as CuponRow);
      alert.success(isEdit ? "Cupón actualizado correctamente" : "Cupón creado correctamente");
      onClose();
    } catch {
      alert.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Editar cupón" : "Nuevo cupón"}
      maxWidth="34rem"
      closeOnBackdrop={!saving}
      footer={saving ? undefined : (
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ background: "transparent", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-muted)", cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!puedeGuardar}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: "var(--color-cq-accent)",
              border:     "none",
              color:      "#fff",
              cursor:     !puedeGuardar ? "not-allowed" : "pointer",
              opacity:    !puedeGuardar ? 0.6 : 1,
            }}
          >
            {isEdit ? "Guardar cambios" : "Crear cupón"}
          </button>
        </>
      )}
    >
      {saving ? (
        <div className="py-6">
          <Loader text={isEdit ? "Guardando cambios…" : "Creando cupón…"} />
        </div>
      ) : (
      <>
        {/* Código */}
        <label className="flex flex-col gap-1.5">
          <span className="cq-field-label">Código</span>
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
              placeholder="Ej. BIENVENIDO10"
              className={inputCls}
              style={{ fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.04em" }}
            />
            <button
              type="button"
              onClick={() => setCodigo(codigoAleatorio())}
              title="Generar código aleatorio"
              className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
              style={{ background: "transparent", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-muted)", cursor: "pointer", whiteSpace: "nowrap" }}
            >
              Generar
            </button>
          </div>
        </label>

        {/* Descripción */}
        <label className="flex flex-col gap-1.5">
          <span className="cq-field-label">Descripción</span>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Uso interno: para qué campaña es este cupón"
            rows={2}
            className={textareaCls}
          />
        </label>

        {/* Tipo + valor */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="cq-field-label">Tipo de descuento</span>
            <Dropdown
              value={tipo}
              onChange={(v) => setTipo(v as CuponTipo)}
              align="left"
              width={220}
              options={TIPO_OPTIONS}
              triggerClassName="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-normal transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="cq-field-label">
              {tipo === "porcentaje" ? "Porcentaje (%)" : "Monto (MXN)"}
            </span>
            <input
              type="number"
              min="0"
              max={tipo === "porcentaje" ? "100" : undefined}
              step={tipo === "porcentaje" ? "1" : "0.01"}
              value={necesitaValor ? valor : ""}
              onChange={(e) => setValor(e.target.value)}
              disabled={!necesitaValor}
              placeholder={necesitaValor ? (tipo === "porcentaje" ? "10" : "150.00") : "No aplica"}
              className={inputCls}
              style={{ opacity: necesitaValor ? 1 : 0.5, cursor: necesitaValor ? "auto" : "not-allowed" }}
            />
          </label>
        </div>

        {/* Condiciones de compra */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="cq-field-label">Compra mínima</span>
            <input
              type="number" min="0" step="0.01"
              value={minimoCompra}
              onChange={(e) => setMinimoCompra(e.target.value)}
              placeholder="Sin mínimo"
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="cq-field-label">Descuento máximo</span>
            <input
              type="number" min="0" step="0.01"
              value={maximoDescuento}
              onChange={(e) => setMaximoDescuento(e.target.value)}
              disabled={tipo !== "porcentaje"}
              placeholder={tipo === "porcentaje" ? "Sin tope" : "Sólo para porcentaje"}
              className={inputCls}
              style={{ opacity: tipo === "porcentaje" ? 1 : 0.5, cursor: tipo === "porcentaje" ? "auto" : "not-allowed" }}
            />
          </label>
        </div>

        {/* Límites de uso */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="cq-field-label">Usos totales</span>
            <input
              type="number" min="1" step="1"
              value={usoMaximoTotal}
              onChange={(e) => setUsoMaximoTotal(e.target.value)}
              placeholder="Ilimitado"
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="cq-field-label">Usos por cliente</span>
            <input
              type="number" min="1" step="1"
              value={usoMaximoUsuario}
              onChange={(e) => setUsoMaximoUsuario(e.target.value)}
              placeholder="1"
              className={inputCls}
            />
          </label>
        </div>

        {/* Vigencia */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="cq-field-label">Válido desde</span>
            <input
              type="datetime-local"
              value={validoDesde}
              onChange={(e) => setValidoDesde(e.target.value)}
              className={inputCls}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="cq-field-label">Válido hasta</span>
            <input
              type="datetime-local"
              value={validoHasta}
              onChange={(e) => setValidoHasta(e.target.value)}
              className={inputCls}
            />
          </label>
        </div>

        {/* Ámbito */}
        <label className="flex flex-col gap-1.5">
          <span className="cq-field-label">Aplica a</span>
          <Dropdown
            value={aplicaA}
            onChange={(v) => setAplicaA(v as CuponAplica)}
            align="left"
            width={460}
            options={APLICA_OPTIONS}
            triggerClassName="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-normal transition-colors"
          />
          {(aplicaA === "categoria" || aplicaA === "producto") && (
            <span className="text-[11px]" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
              La selección de {aplicaA === "categoria" ? "categorías" : "productos"} se configura después de crear el cupón.
            </span>
          )}
        </label>

        {/* Descuento sobre el envío */}
        <div className="flex flex-col gap-1.5">
          <label
            className="flex items-center gap-2.5"
            style={{ cursor: permiteEnvio ? "pointer" : "not-allowed", opacity: permiteEnvio ? 1 : 0.55 }}
          >
            <input
              type="checkbox"
              checked={permiteEnvio && aplicaEnvio}
              disabled={!permiteEnvio}
              onChange={(e) => setAplicaEnvio(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
              style={{ cursor: permiteEnvio ? "pointer" : "not-allowed" }}
            />
            <span className="text-[13px]" style={{ color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-body, sans-serif)" }}>
              El descuento también aplica al costo de envío
            </span>
          </label>
          <span className="text-[11px]" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)", lineHeight: 1.5, paddingLeft: 26 }}>
            {!permiteEnvio
              ? tipo === "envio_gratis"
                ? "Este cupón ya deja el envío en cero."
                : "El 2x1 descuenta por unidades de producto, no sobre el envío."
              : aplicaEnvio
                ? "El envío cotizado se suma a la base del descuento; el comprador ve la tarifa real de envío y el ahorro completo en el renglón de descuento."
                : "El descuento sólo muerde la mercancía; el envío se cobra completo."}
          </span>
        </div>

        {/* Activo */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-blue-600"
          />
          <span className="text-[13px]" style={{ color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-body, sans-serif)" }}>
            Cupón activo
          </span>
        </label>

        <style>{`
          .cq-field-label {
            font-family: var(--font-mono);
            font-size: 0.68rem;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--color-cq-muted);
          }
        `}</style>
      </>
      )}
    </Modal>
  );
}
