// app/(main)/checkout/components/StepEnvio.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FormField } from "./FormField";
import type { DatosEnvio } from "../types";
import { ESTADOS_MX } from "../types";

interface Props {
  data:     DatosEnvio;
  onChange: (data: DatosEnvio) => void;
  onNext:   () => void;
  onBack:   () => void;
}

export function StepEnvio({ data, onChange, onNext, onBack }: Props) {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => onChange({ ...data, [key]: e.target.value });

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
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "-0.01em" }}>
            Dirección de envío
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", marginTop: 3 }}>
            ¿A dónde enviamos tu pedido?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Calle" required placeholder="Av. Insurgentes Sur"
          value={data.calle} onChange={set("calle")} error={errors.calle} className="sm:col-span-2" />
        <FormField label="Número exterior" required placeholder="123"
          value={data.numeroExt} onChange={set("numeroExt")} error={errors.numeroExt} />
        <FormField label="Número interior" placeholder="Depto 4B"
          value={data.numeroInt} onChange={set("numeroInt")} />
        <FormField label="Colonia / Fraccionamiento" required placeholder="Del Valle"
          value={data.colonia} onChange={set("colonia")} error={errors.colonia} className="sm:col-span-2" />
        <FormField label="Ciudad / Municipio" required placeholder="Ciudad de México"
          value={data.ciudad} onChange={set("ciudad")} error={errors.ciudad} />
        <FormField as="select" label="Estado" required
          options={ESTADOS_MX} placeholder="Selecciona estado"
          value={data.estado} onChange={set("estado")} error={errors.estado} />
        <FormField label="Código postal" required placeholder="01100"
          value={data.codigoPostal} onChange={set("codigoPostal")} error={errors.codigoPostal} maxLength={5} />
        <FormField label="Referencias" placeholder="Entre calles, color de fachada..."
          value={data.referencias} onChange={set("referencias")} />
      </div>

      {/* Nota envío */}
      <div className="flex items-start gap-3 py-3 px-4 rounded-xl"
        style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.12)" }}>
        <i className="fa-solid fa-truck" style={{ fontSize: "0.85rem", color: "var(--color-cq-accent)", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted)" }}>
          El costo de envío se calculará automáticamente basado en tu ubicación antes de confirmar el pedido.
        </p>
      </div>

      <div className="flex gap-3">
        <motion.button onClick={onBack}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 rounded-xl"
          style={{
            height: 52, flex: "0 0 auto", padding: "0 22px",
            background: "transparent", color: "var(--color-cq-muted)",
            fontFamily: "var(--font-mono)", fontSize: "0.7rem",
            letterSpacing: "0.08em", textTransform: "uppercase",
            border: "1.5px solid var(--color-cq-border)", cursor: "pointer",
          }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} />
          Volver
        </motion.button>
        <motion.button
          onClick={() => { if (validate()) onNext(); }}
          whileHover={{ scale: 1.01, boxShadow: "0 8px 28px rgba(29,78,216,0.35)" }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl"
          style={{
            height: 52, background: "var(--color-cq-primary)", color: "white",
            fontFamily: "var(--font-display)", fontSize: "0.875rem", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            border: "none", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(29,78,216,0.25)",
          }}>
          Continuar con pago
          <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.8rem" }} />
        </motion.button>
      </div>
    </motion.div>
  );
}