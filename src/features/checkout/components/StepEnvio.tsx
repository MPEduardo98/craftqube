// app/(main)/checkout/components/StepEnvio.tsx
"use client";

import { useState, useEffect }        from "react";
import { motion, AnimatePresence }    from "framer-motion";
import { useAuth }                    from "@mpeduardo98/commerce-core/auth/AuthContext";
import { FormField }                  from "./FormField";
import { validarEnvio }               from "@mpeduardo98/commerce-core/checkout/lib/validaciones";
import type { DatosEnvio }            from "@mpeduardo98/commerce-core/checkout/types";
import { ESTADOS_MX }                 from "@mpeduardo98/commerce-core/checkout/types";
import {
  precargarDirecciones, direccionesListas, type DireccionGuardada,
} from "../lib/direcciones";

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
  /* Si el marco ya trajo las direcciones (lo normal: se piden mientras
     se llena el contacto), el paso arranca con ellas y sin esqueleto. */
  const [previas]                     = useState(() => (autenticado ? direccionesListas() : null));
  const [direcciones, setDirecciones] = useState<DireccionGuardada[]>(previas ?? []);
  const [recibidas, setRecibidas]     = useState(previas !== null);
  const cargandoDir = autenticado && !recibidas;
  const [mostrarForm, setMostrarForm] = useState(!autenticado || (previas !== null && previas.length === 0));
  const [dirSeleccionada, setDirSel]  = useState<number | null>(() => {
    if (!previas?.length) return null;
    return (previas.find((d) => d.es_predeterminada) ?? previas[0]).id;
  });

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

  const elegirPredeterminada = (lista: DireccionGuardada[]) => {
    if (lista.length > 0) {
      setDirecciones(lista);
      const pred = lista.find((d) => d.es_predeterminada) ?? lista[0];
      aplicarDireccion(pred);
      setDirSel(pred.id);
      setMostrarForm(false);
    } else {
      setDirecciones([]);
      setMostrarForm(true);
    }
  };

  /* ── Direcciones guardadas ── */
  useEffect(() => {
    // Sin sesión el formulario ya arranca abierto.
    if (!autenticado) return;
    // Con caché el estado local ya nació listo: sólo se vuelca la
    // predeterminada a los datos de envío.
    if (previas !== null) {
      if (previas.length > 0) aplicarDireccion(previas.find((d) => d.es_predeterminada) ?? previas[0]);
      return;
    }
    let vivo = true;
    precargarDirecciones()
      .then((lista) => { if (vivo) { elegirPredeterminada(lista); setRecibidas(true); } });
    return () => { vivo = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado]);

  /* Mismo criterio que el guard de /checkout/pago: si esto pasa,
     aquel deja entrar. Ver lib/validaciones. */
  const validate = (): boolean => {
    const e = validarEnvio(data);
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
      <div className="flex flex-col gap-6">
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
              Elige una dirección o agrega una nueva
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl animate-pulse"
              style={{ height: 80, background: "var(--color-cq-surface-2)",
                border: "1px solid var(--color-cq-border)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={previas !== null || !autenticado ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
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
      <AnimatePresence initial={false}>
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