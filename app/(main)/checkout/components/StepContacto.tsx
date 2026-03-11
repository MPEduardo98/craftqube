// app/(main)/checkout/components/StepContacto.tsx
"use client";

import { useState, useEffect }          from "react";
import Link                              from "next/link";
import { motion, AnimatePresence }       from "framer-motion";
import { useAuth }                       from "@/app/global/context/AuthContext";
import { FormField }                     from "./FormField";
import type { DatosContacto }            from "../types";

interface Props {
  data:     DatosContacto;
  onChange: (data: DatosContacto) => void;
  onNext:   () => void;
}

export function StepContacto({ data, onChange, onNext }: Props) {
  const { usuario, autenticado, cargando } = useAuth();
  const [errors, setErrors]               = useState<Partial<Record<keyof DatosContacto, string>>>({});
  const [authBannerVisible, setAuthBannerVisible] = useState(true);

  /* ── Pre-llenar con datos del usuario autenticado ── */
  useEffect(() => {
    if (autenticado && usuario && !cargando) {
      onChange({
        nombre:    usuario.nombre    || data.nombre,
        apellido:  usuario.apellido  || data.apellido,
        email:     usuario.email     || data.email,
        telefono:  usuario.telefono  || data.telefono,
        modoGuest: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado, usuario, cargando]);

  /* ── ¿Mostrar banner de guardar teléfono? ── */
  const mostrarBannerTelefono =
    autenticado &&
    !usuario?.telefono &&
    data.telefono?.trim().length > 0;

  /* ── Validación ── */
  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!data.nombre.trim())   e.nombre   = "El nombre es requerido";
    if (!data.apellido.trim()) e.apellido = "El apellido es requerido";
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = "Correo electrónico inválido";
    if (!data.modoGuest && data.telefono && data.telefono.replace(/\D/g, "").length < 10)
      e.telefono = "Teléfono de 10 dígitos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key: keyof DatosContacto) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ ...data, [key]: e.target.value });
      if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    };

  const handleNext = () => { if (validate()) onNext(); };

  /* ── Render ── */
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
        <div
          className="flex items-center justify-center rounded-xl mt-0.5"
          style={{ width: 36, height: 36, background: "rgba(37,99,235,0.08)", flexShrink: 0 }}
        >
          <i className="fa-solid fa-user" style={{ fontSize: "0.9rem", color: "var(--color-cq-accent)" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700,
            color: "var(--color-cq-text)", letterSpacing: "-0.01em" }}>
            Información de contacto
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", marginTop: 3 }}>
            {autenticado ? `Hola, ${usuario?.nombre} 👋 Confirma tus datos` : "¿A quién le enviamos la confirmación?"}
          </p>
        </div>
      </div>

      {/* Banner: no autenticado */}
      <AnimatePresence>
        {!autenticado && !cargando && authBannerVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-xl p-4 relative"
            style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.14)" }}
          >
            <i className="fa-solid fa-circle-info"
              style={{ color: "var(--color-cq-accent)", fontSize: "0.85rem", marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)", lineHeight: 1.7 }}>
              ¿Ya tienes cuenta?{" "}
              <Link href="/login?redirect=/checkout"
                style={{ color: "var(--color-cq-accent)", fontWeight: 600, textDecoration: "none" }}>
                Inicia sesión
              </Link>{" "}
              para rellenar tus datos automáticamente y guardar tus pedidos.
            </p>
            <button onClick={() => setAuthBannerVisible(false)}
              className="absolute top-3 right-3 flex items-center justify-center rounded-lg"
              style={{ width: 24, height: 24, background: "transparent", border: "none",
                cursor: "pointer", color: "var(--color-cq-muted-2)" }}>
              <i className="fa-solid fa-xmark" style={{ fontSize: "0.7rem" }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner: guardar teléfono nuevo */}
      <AnimatePresence>
        {mostrarBannerTelefono && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-xl p-4"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <i className="fa-solid fa-circle-check"
              style={{ color: "#10b981", fontSize: "0.85rem", marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--color-cq-text)" }}>Guardaremos tu número</strong> en tu perfil para futuras compras.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Nombre"
          value={data.nombre}
          onChange={set("nombre")}
          error={errors.nombre}
          placeholder="María"
          required
          disabled={autenticado && !!usuario?.nombre}
        />
        <FormField
          label="Apellido"
          value={data.apellido}
          onChange={set("apellido")}
          error={errors.apellido}
          placeholder="García"
          required
          disabled={autenticado && !!usuario?.apellido}
        />
      </div>

      <FormField
        label="Correo electrónico"
        value={data.email}
        onChange={set("email")}
        error={errors.email}
        type="email"
        placeholder="tu@correo.com"
        required
        disabled={autenticado && !!usuario?.email}
      />

      <div className="flex flex-col gap-1.5">
        <FormField
          label={
            autenticado && !usuario?.telefono
              ? "Teléfono (lo guardaremos en tu perfil)"
              : "Teléfono"
          }
          value={data.telefono ?? ""}
          onChange={set("telefono")}
          error={errors.telefono}
          type="tel"
          placeholder="55 1234 5678"
          disabled={autenticado && !!usuario?.telefono}
        />
        {!autenticado && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem",
            color: "var(--color-cq-muted-2)", letterSpacing: "0.04em" }}>
            Opcional · Para notificarte sobre tu envío
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-end pt-2">
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
          Continuar con el envío
          <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.75rem" }} />
        </motion.button>
      </div>
    </motion.div>
  );
}