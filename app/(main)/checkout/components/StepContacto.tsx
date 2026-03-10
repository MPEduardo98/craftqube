// app/(main)/checkout/components/StepContacto.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FormField } from "./FormField";
import type { DatosContacto } from "../types";

interface Props {
  data:     DatosContacto;
  onChange: (data: DatosContacto) => void;
  onNext:   () => void;
}

export function StepContacto({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof DatosContacto, string>>>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!data.nombre.trim())   e.nombre   = "El nombre es requerido";
    if (!data.apellido.trim()) e.apellido  = "El apellido es requerido";
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = "Correo electrónico inválido";
    if (!data.telefono.trim() || data.telefono.replace(/\D/g, "").length < 10)
      e.telefono = "Teléfono de 10 dígitos requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key: keyof DatosContacto) => (
    e: React.ChangeEvent<HTMLInputElement>
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
          <i className="fa-solid fa-user" style={{ fontSize: "0.85rem", color: "var(--color-cq-accent)" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "-0.01em" }}>
            Información de contacto
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", marginTop: 3 }}>
            Te enviaremos la confirmación de tu pedido por correo.
          </p>
        </div>
      </div>

      {/* Campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Nombre" required placeholder="Ej. Juan"
          value={data.nombre} onChange={set("nombre")} error={errors.nombre} />
        <FormField label="Apellido" required placeholder="Ej. García"
          value={data.apellido} onChange={set("apellido")} error={errors.apellido} />
        <FormField label="Correo electrónico" required type="email"
          placeholder="correo@ejemplo.com"
          value={data.email} onChange={set("email")} error={errors.email} className="sm:col-span-2" />
        <FormField label="Teléfono" required type="tel"
          placeholder="55 1234 5678"
          value={data.telefono} onChange={set("telefono")} error={errors.telefono} className="sm:col-span-2" />
      </div>

      {/* SSL badge */}
      <div className="flex items-center gap-3 py-3 px-4 rounded-xl"
        style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.12)" }}>
        <i className="fa-solid fa-shield-halved" style={{ fontSize: "0.9rem", color: "var(--color-cq-accent)", flexShrink: 0 }} />
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted)" }}>
          Tu información está protegida con encriptación SSL de 256-bit
        </p>
      </div>

      {/* CTA */}
      <motion.button onClick={() => { if (validate()) onNext(); }}
        whileHover={{ scale: 1.01, boxShadow: "0 8px 28px rgba(29,78,216,0.35)" }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 rounded-xl"
        style={{
          height: 52, background: "var(--color-cq-primary)", color: "white",
          fontFamily: "var(--font-display)", fontSize: "0.875rem",
          letterSpacing: "0.1em", textTransform: "uppercase",
          border: "none", cursor: "pointer", fontWeight: 700,
          boxShadow: "0 4px 20px rgba(29,78,216,0.25)",
        }}>
        Continuar con envío
        <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.8rem" }} />
      </motion.button>
    </motion.div>
  );
}