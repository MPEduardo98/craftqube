// app/(main)/checkout/components/StepEnvio.tsx
"use client";

import { useState, useEffect }        from "react";
import { motion, AnimatePresence }    from "framer-motion";
import { useAuth }                    from "@/app/global/context/AuthContext";
import { FormField }                  from "./FormField";
import type { DatosEnvio }            from "../types";
import { ESTADOS_MX }                 from "../types";

interface DireccionGuardada {
  id:               number;
  alias:            string | null;
  nombre:           string;
  apellido:         string;
  calle:            string;
  numero_ext:       string;
  numero_int:       string | null;
  colonia:          string;
  ciudad:           string;
  municipio:        string | null;
  estado:           string;
  codigo_postal:    string;
  pais:             string;
  referencias:      string | null;
  empresa:          string | null;
  es_predeterminada: boolean;
}

interface Props {
  data:              DatosEnvio;
  onChange:          (data: DatosEnvio) => void;
  onNext:            () => void;
  onBack:            () => void;
  contactoNombre?:   string;
  contactoApellido?: string;
}

export function StepEnvio({ data, onChange, onNext, onBack }: Props) {
  const { autenticado } = useAuth();
  const [errors, setErrors]           = useState<Partial<Record<keyof DatosEnvio, string>>>({});
  const [direcciones, setDirecciones] = useState<DireccionGuardada[]>([]);
  const [cargandoDir, setCargandoDir] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [dirSeleccionada, setDirSel]  = useState<number | null>(null);

  /* ── Cargar direcciones guardadas ── */
  useEffect(() => {
    if (!autenticado) { setMostrarForm(true); return; }
    setCargandoDir(true);
    fetch("/api/users/addresses", { credentials: "include" })
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data?.length > 0) {
          setDirecciones(j.data);
          const pred = j.data.find((d: DireccionGuardada) => d.es_predeterminada) ?? j.data[0];
          aplicarDireccion(pred);
          setDirSel(pred.id);
          setMostrarForm(false);
        } else {
          setMostrarForm(true);
        }
      })
      .catch(() => setMostrarForm(true))
      .finally(() => setCargandoDir(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  const aplicarDireccion = (dir: DireccionGuardada) => {
    onChange({
      ...data,
      calle:        dir.calle,
      numeroExt:    dir.numero_ext,
      numeroInt:    dir.numero_int ?? "",
      colonia:      dir.colonia,
      ciudad:       dir.ciudad,
      municipio:    dir.municipio ?? "",
      estado:       dir.estado,
      codigoPostal: dir.codigo_postal,
      pais:         dir.pais,
      referencias:  dir.referencias ?? "",
      empresa:      dir.empresa ?? "",
      guardarDireccion: false,
    });
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!data.calle.trim())     e.calle        = "La calle es requerida";
    if (!data.numeroExt.trim()) e.numeroExt    = "El número exterior es requerido";
    if (!data.colonia.trim())   e.colonia      = "La colonia es requerida";
    if (!data.ciudad.trim())    e.ciudad       = "La ciudad es requerida";
    if (!data.estado)           e.estado       = "Selecciona un estado";
    if (!data.codigoPostal.trim() || data.codigoPostal.replace(/\D/g, "").length !== 5)
      e.codigoPostal = "Código postal de 5 dígitos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key: keyof DatosEnvio) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      onChange({ ...data, [key]: e.target.value });
      if (errors[key as keyof typeof errors]) setErrors((p) => ({ ...p, [key]: undefined }));
    };

  const handleNext = () => { if (validate()) onNext(); };

  /* ── Loader ── */
  if (cargandoDir) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, background: "rgba(37,99,235,0.08)", flexShrink: 0 }}>
            <i className="fa-solid fa-location-dot" style={{ fontSize: "0.9rem", color: "var(--color-cq-accent)" }} />
          </div>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700,
              color: "var(--color-cq-text)", letterSpacing: "-0.01em" }}>
              Dirección de envío
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl animate-pulse"
              style={{ height: 80, background: "var(--color-cq-surface-2)",
                border: "1px solid var(--color-cq-border)" }} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      {/* Título */}
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center rounded-xl mt-0.5"
          style={{ width: 36, height: 36, background: "rgba(37,99,235,0.08)", flexShrink: 0 }}>
          <i className="fa-solid fa-location-dot" style={{ fontSize: "0.9rem", color: "var(--color-cq-accent)" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700,
            color: "var(--color-cq-text)", letterSpacing: "-0.01em" }}>
            Dirección de envío
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", marginTop: 3 }}>
            {autenticado && direcciones.length > 0
              ? "Elige una dirección o agrega una nueva"
              : "¿A dónde enviamos tu pedido?"}
          </p>
        </div>
      </div>

      {/* ── Tarjetas de direcciones guardadas ── */}
      {autenticado && direcciones.length > 0 && (
        <div className="flex flex-col gap-3">
          {direcciones.map((dir) => {
            const activa = dirSeleccionada === dir.id;
            return (
              <motion.button
                key={dir.id}
                type="button"
                onClick={() => { setDirSel(dir.id); aplicarDireccion(dir); setMostrarForm(false); }}
                whileTap={{ scale: 0.99 }}
                className="w-full text-left rounded-xl p-4"
                style={{
                  background: activa ? "rgba(37,99,235,0.06)" : "var(--color-cq-surface-2)",
                  border: activa ? "1.5px solid rgba(37,99,235,0.4)" : "1.5px solid var(--color-cq-border)",
                  cursor: "pointer",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      width: 18, height: 18,
                      border: activa ? "5px solid var(--color-cq-accent)" : "2px solid var(--color-cq-border)",
                      background: "var(--color-cq-surface)",
                      transition: "all 0.2s",
                    }} />
                  <div>
                    <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.88rem",
                      color: "var(--color-cq-text)", marginBottom: 2 }}>
                      {dir.alias ?? `${dir.nombre} ${dir.apellido}`}
                      {dir.es_predeterminada && (
                        <span className="ml-2 inline-flex items-center rounded-full px-2 py-0.5"
                          style={{ fontSize: "0.6rem", background: "rgba(37,99,235,0.1)",
                            color: "var(--color-cq-accent)", fontFamily: "var(--font-mono)",
                            letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}>
                          Predeterminada
                        </span>
                      )}
                    </p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem",
                      color: "var(--color-cq-muted)", lineHeight: 1.6 }}>
                      {dir.calle} {dir.numero_ext}{dir.numero_int ? ` Int. ${dir.numero_int}` : ""},
                      {" "}{dir.colonia}, {dir.ciudad}, {dir.estado} C.P. {dir.codigo_postal}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}

          <button
            type="button"
            onClick={() => { setDirSel(null); setMostrarForm(!mostrarForm); }}
            className="flex items-center gap-2"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--color-cq-accent)", fontFamily: "var(--font-body)",
              fontSize: "0.82rem", fontWeight: 600, padding: "4px 0",
            }}
          >
            <i className={`fa-solid ${mostrarForm ? "fa-chevron-up" : "fa-plus"}`}
              style={{ fontSize: "0.65rem" }} />
            {mostrarForm ? "Cancelar" : "Usar otra dirección"}
          </button>
        </div>
      )}

      {/* ── Formulario de dirección ── */}
      <AnimatePresence>
        {(mostrarForm || !autenticado || direcciones.length === 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 pt-1">

              {/* Empresa — texto helper debajo */}
              <div className="flex flex-col gap-1">
                <FormField
                  label="Empresa / Razón social"
                  value={data.empresa}
                  onChange={set("empresa")}
                  placeholder="Opcional"
                />
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                  color: "var(--color-cq-muted-2)", letterSpacing: "0.04em", marginTop: 2 }}>
                  Solo si es envío a empresa
                </p>
              </div>

              <FormField
                label="Calle"
                value={data.calle}
                onChange={set("calle")}
                error={errors.calle}
                placeholder="Av. Insurgentes"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Núm. exterior"
                  value={data.numeroExt}
                  onChange={set("numeroExt")}
                  error={errors.numeroExt}
                  placeholder="123"
                  required
                />
                <FormField
                  label="Núm. interior"
                  value={data.numeroInt}
                  onChange={set("numeroInt")}
                  placeholder="4B"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  label="Colonia"
                  value={data.colonia}
                  onChange={set("colonia")}
                  error={errors.colonia}
                  placeholder="Del Valle"
                  required
                />
                <FormField
                  label="Código postal"
                  value={data.codigoPostal}
                  onChange={set("codigoPostal")}
                  error={errors.codigoPostal}
                  placeholder="06600"
                  maxLength={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  label="Ciudad"
                  value={data.ciudad}
                  onChange={set("ciudad")}
                  error={errors.ciudad}
                  placeholder="Ciudad de México"
                  required
                />
                <FormField
                  label="Municipio / Alcaldía"
                  value={data.municipio}
                  onChange={set("municipio")}
                  placeholder="Benito Juárez"
                />
              </div>

              {/* Estado */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                  fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--color-cq-muted)" }}>
                  Estado <span style={{ color: "var(--color-cq-accent)" }}>*</span>
                </label>
                <select
                  value={data.estado}
                  onChange={set("estado")}
                  className="rounded-xl w-full"
                  style={{
                    height: 44, padding: "0 14px",
                    fontFamily: "var(--font-body)", fontSize: "0.88rem",
                    color: data.estado ? "var(--color-cq-text)" : "var(--color-cq-muted)",
                    background: "var(--color-cq-surface-2)",
                    border: errors.estado
                      ? "1.5px solid #ef4444"
                      : "1.5px solid var(--color-cq-border)",
                    outline: "none", cursor: "pointer",
                  }}
                >
                  <option value="">Selecciona un estado</option>
                  {ESTADOS_MX.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                {errors.estado && (
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem",
                    color: "#ef4444", marginTop: 2 }}>
                    {errors.estado}
                  </p>
                )}
              </div>

              {/* Referencias */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                  fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--color-cq-muted)" }}>
                  Referencias
                </label>
                <textarea
                  value={data.referencias}
                  onChange={set("referencias")}
                  rows={2}
                  placeholder="Entre calles, color de la fachada, edificio…"
                  className="rounded-xl resize-none w-full"
                  style={{
                    padding: "10px 14px",
                    fontFamily: "var(--font-body)", fontSize: "0.88rem",
                    color: "var(--color-cq-text)",
                    background: "var(--color-cq-surface-2)",
                    border: "1.5px solid var(--color-cq-border)",
                    outline: "none",
                  }}
                />
              </div>

              {/* Guardar dirección */}
              {autenticado && (
                <label
                  className="flex items-center gap-3 cursor-pointer select-none"
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem",
                    color: "var(--color-cq-muted)" }}
                >
                  <div className="relative flex-shrink-0"
                    onClick={() => onChange({ ...data, guardarDireccion: !data.guardarDireccion })}>
                    <motion.div
                      className="flex items-center justify-center rounded-md"
                      animate={{
                        background: data.guardarDireccion
                          ? "var(--color-cq-accent)"
                          : "var(--color-cq-surface-2)",
                        borderColor: data.guardarDireccion
                          ? "var(--color-cq-accent)"
                          : "var(--color-cq-border)",
                      }}
                      style={{ width: 20, height: 20, border: "1.5px solid", borderRadius: 6,
                        cursor: "pointer" }}
                    >
                      <AnimatePresence>
                        {data.guardarDireccion && (
                          <motion.i
                            className="fa-solid fa-check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            style={{ fontSize: "0.55rem", color: "white" }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  <span>
                    <strong style={{ color: "var(--color-cq-text)" }}>
                      Guardar esta dirección
                    </strong>{" "}
                    en mi cuenta para futuras compras
                  </span>
                </label>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navegación */}
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2"
          style={{ background: "transparent", border: "none", cursor: "pointer",
            fontFamily: "var(--font-body)", fontSize: "0.85rem",
            fontWeight: 600, color: "var(--color-cq-muted)", padding: 0 }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.7rem" }} />
          Volver
        </button>

        <motion.button
          type="button"
          onClick={handleNext}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 rounded-xl font-semibold"
          style={{
            height: 48, padding: "0 28px",
            background: "var(--color-cq-accent)", color: "white",
            border: "none", cursor: "pointer",
            fontFamily: "var(--font-body)", fontSize: "0.92rem",
          }}
        >
          Continuar con el pago
          <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.75rem" }} />
        </motion.button>
      </div>
    </motion.div>
  );
}