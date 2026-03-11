// app/(main)/checkout/components/StepEnvio.tsx
"use client";

import { useState } from "react";
import { motion }   from "framer-motion";
import { useAuth }  from "@/app/global/context/AuthContext";
import { FormField } from "./FormField";
import type { DatosEnvio } from "../types";
import { ESTADOS_MX }      from "../types";

interface Props {
  data:     DatosEnvio;
  onChange: (data: DatosEnvio) => void;
  onNext:   () => void;
  onBack:   () => void;
}

export function StepEnvio({ data, onChange, onNext, onBack }: Props) {
  const { autenticado } = useAuth();
  const [errors, setErrors] = useState<Partial<Record<keyof DatosEnvio, string>>>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!data.calle.trim())        e.calle        = "La calle es requerida";
    if (!data.numeroExt.trim())    e.numeroExt    = "El número exterior es requerido";
    if (!data.colonia.trim())      e.colonia      = "La colonia es requerida";
    if (!data.ciudad.trim())       e.ciudad       = "La ciudad es requerida";
    if (!data.estado)              e.estado       = "Selecciona un estado";
    if (!data.codigoPostal.trim() || data.codigoPostal.replace(/\D/g, "").length !== 5)
      e.codigoPostal = "Código postal de 5 dígitos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key: keyof DatosEnvio) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    onChange({ ...data, [key]: e.target.value });
    if (errors[key as keyof typeof errors]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      {/* ── Título ── */}
      <div className="flex items-start gap-3">
        <div
          className="flex items-center justify-center rounded-xl mt-0.5"
          style={{ width: 36, height: 36, background: "rgba(37,99,235,0.08)", flexShrink: 0 }}
        >
          <i className="fa-solid fa-location-dot" style={{ fontSize: "0.9rem", color: "var(--color-cq-accent)" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "-0.01em" }}>
            Dirección de envío
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", marginTop: 3 }}>
            ¿A dónde enviamos tu pedido?
          </p>
        </div>
      </div>

      {/* ── Campos ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Empresa (opcional) */}
        <FormField
          label="Empresa" placeholder="Nombre de empresa (opcional)"
          value={data.empresa}
          onChange={set("empresa")}
          className="sm:col-span-2"
        />

        {/* Calle */}
        <FormField
          label="Calle" required placeholder="Av. Reforma"
          value={data.calle}
          onChange={set("calle")}
          error={errors.calle}
          className="sm:col-span-2"
        />

        {/* Número ext / int */}
        <FormField
          label="Número exterior" required placeholder="123"
          value={data.numeroExt}
          onChange={set("numeroExt")}
          error={errors.numeroExt}
        />
        <FormField
          label="Número interior" placeholder="Depto 4B (opcional)"
          value={data.numeroInt}
          onChange={set("numeroInt")}
        />

        {/* Colonia */}
        <FormField
          label="Colonia" required placeholder="Centro"
          value={data.colonia}
          onChange={set("colonia")}
          error={errors.colonia}
          className="sm:col-span-2"
        />

        {/* Ciudad / Municipio */}
        <FormField
          label="Ciudad" required placeholder="Ciudad de México"
          value={data.ciudad}
          onChange={set("ciudad")}
          error={errors.ciudad}
        />
        <FormField
          label="Municipio / Alcaldía" placeholder="Cuauhtémoc (opcional)"
          value={data.municipio}
          onChange={set("municipio")}
        />

        {/* Estado */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
            Estado <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            value={data.estado}
            onChange={set("estado")}
            style={{
              height: 44, padding: "0 12px",
              background: "var(--color-cq-surface)",
              border: `1px solid ${errors.estado ? "#ef4444" : "var(--color-cq-border)"}`,
              borderRadius: 10, color: data.estado ? "var(--color-cq-text)" : "var(--color-cq-muted-2)",
              fontFamily: "var(--font-body)", fontSize: "0.875rem",
              outline: "none", cursor: "pointer", width: "100%",
            }}
          >
            <option value="">Selecciona un estado</option>
            {ESTADOS_MX.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          {errors.estado && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "#ef4444", marginTop: 2 }}>
              {errors.estado}
            </p>
          )}
        </div>

        {/* CP */}
        <FormField
          label="Código postal" required placeholder="06600"
          value={data.codigoPostal}
          onChange={set("codigoPostal")}
          error={errors.codigoPostal}
          maxLength={5}
        />

        {/* País */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
            País
          </label>
          <div
            style={{
              height: 44, padding: "0 12px",
              background: "var(--color-cq-surface-2)",
              border: "1px solid var(--color-cq-border)",
              borderRadius: 10, color: "var(--color-cq-muted)",
              fontFamily: "var(--font-body)", fontSize: "0.875rem",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <span>🇲🇽</span>
            <span>México</span>
          </div>
        </div>

        {/* Referencias */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
            Referencias / Indicaciones
          </label>
          <textarea
            placeholder="Entre calles, color de fachada, indicaciones para el repartidor..."
            value={data.referencias}
            onChange={set("referencias")}
            rows={2}
            style={{
              padding: "10px 12px",
              background: "var(--color-cq-surface)",
              border: "1px solid var(--color-cq-border)",
              borderRadius: 10, color: "var(--color-cq-text)",
              fontFamily: "var(--font-body)", fontSize: "0.875rem",
              outline: "none", resize: "vertical", width: "100%",
              lineHeight: 1.5,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-cq-accent)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-cq-border)")}
          />
        </div>
      </div>

      {/* ── Toggle guardar dirección (solo autenticados) ── */}
      {autenticado && (
        <motion.label
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 cursor-pointer py-3 px-4 rounded-xl"
          style={{
            background: data.guardarDireccion ? "rgba(37,99,235,0.06)" : "var(--color-cq-surface-2)",
            border: `1px solid ${data.guardarDireccion ? "rgba(37,99,235,0.2)" : "var(--color-cq-border)"}`,
            transition: "all 0.2s ease",
          }}
        >
          {/* Custom checkbox */}
          <div
            onClick={() => onChange({ ...data, guardarDireccion: !data.guardarDireccion })}
            className="flex items-center justify-center rounded-md shrink-0"
            style={{
              width: 20, height: 20,
              background: data.guardarDireccion ? "var(--color-cq-primary)" : "transparent",
              border: `2px solid ${data.guardarDireccion ? "var(--color-cq-primary)" : "var(--color-cq-border)"}`,
              transition: "all 0.18s ease",
            }}
          >
            {data.guardarDireccion && (
              <i className="fa-solid fa-check" style={{ fontSize: "0.55rem", color: "white" }} />
            )}
          </div>
          <div onClick={() => onChange({ ...data, guardarDireccion: !data.guardarDireccion })}>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 600, color: "var(--color-cq-text)" }}>
              Guardar esta dirección en mi cuenta
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-cq-muted)", marginTop: 2 }}>
              Disponible en tu próxima compra para agilizar el proceso.
            </p>
          </div>
        </motion.label>
      )}

      {/* ── Botones ── */}
      <div className="flex gap-3">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 rounded-xl shrink-0"
          style={{
            height: 52, padding: "0 20px",
            background: "var(--color-cq-surface-2)",
            border: "1px solid var(--color-cq-border)",
            color: "var(--color-cq-muted)", cursor: "pointer",
            fontFamily: "var(--font-display)", fontSize: "0.82rem",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}
        >
          <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} />
          Atrás
        </motion.button>

        <motion.button
          onClick={() => { if (validate()) onNext(); }}
          whileHover={{ scale: 1.01, boxShadow: "0 8px 28px rgba(29,78,216,0.35)" }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl"
          style={{
            height: 52, background: "var(--color-cq-primary)", color: "white",
            fontFamily: "var(--font-display)", fontSize: "0.875rem",
            letterSpacing: "0.1em", textTransform: "uppercase",
            border: "none", cursor: "pointer", fontWeight: 700,
            boxShadow: "0 4px 20px rgba(29,78,216,0.25)",
          }}
        >
          Continuar al pago
          <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.8rem" }} />
        </motion.button>
      </div>
    </motion.div>
  );
}