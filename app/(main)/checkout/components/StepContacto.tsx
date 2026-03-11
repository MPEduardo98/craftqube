// app/(main)/checkout/components/StepContacto.tsx
"use client";

import { useState, useEffect } from "react";
import Link                     from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth }              from "@/app/global/context/AuthContext";
import { FormField }            from "./FormField";
import type { DatosContacto }   from "../types";

interface Props {
  data:     DatosContacto;
  onChange: (data: DatosContacto) => void;
  onNext:   () => void;
}

export function StepContacto({ data, onChange, onNext }: Props) {
  const { usuario, autenticado, cargando } = useAuth();
  const [errors, setErrors] = useState<Partial<Record<keyof DatosContacto, string>>>({});
  const [authBannerVisible, setAuthBannerVisible] = useState(true);

  /* ── Pre-llenar con datos del usuario autenticado ── */
  useEffect(() => {
    if (autenticado && usuario && !cargando) {
      onChange({
        nombre:    usuario.nombre   || data.nombre,
        apellido:  usuario.apellido || data.apellido,
        email:     usuario.email    || data.email,
        telefono:  usuario.telefono || data.telefono,
        modoGuest: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autenticado, usuario, cargando]);

  /* ── Validación ── */
  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!data.nombre.trim())   e.nombre   = "El nombre es requerido";
    if (!data.apellido.trim()) e.apellido = "El apellido es requerido";
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      e.email = "Correo electrónico inválido";
    if (!data.telefono.trim() || data.telefono.replace(/\D/g, "").length < 10)
      e.telefono = "Teléfono de 10 dígitos requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key: keyof DatosContacto) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({ ...data, [key]: e.target.value });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
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
          <i className="fa-solid fa-user" style={{ fontSize: "0.85rem", color: "var(--color-cq-accent)" }} />
        </div>
        <div>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "1.45rem",
            fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "-0.01em",
          }}>
            Información de contacto
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", marginTop: 3 }}>
            {autenticado
              ? `Comprando como ${usuario?.nombre} ${usuario?.apellido}`
              : "Te enviaremos la confirmación de tu pedido por correo."}
          </p>
        </div>
      </div>

      {/* ── Banner invitado / usuario autenticado ── */}
      <AnimatePresence>
        {!autenticado && !cargando && authBannerVisible && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="flex items-start justify-between gap-3 rounded-xl px-4 py-3"
            style={{
              background: "rgba(37,99,235,0.05)",
              border: "1px solid rgba(37,99,235,0.18)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center rounded-lg mt-0.5 shrink-0"
                style={{ width: 28, height: 28, background: "rgba(37,99,235,0.12)" }}
              >
                <i className="fa-solid fa-bolt" style={{ fontSize: "0.7rem", color: "var(--color-cq-accent)" }} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 700, color: "var(--color-cq-text)", marginBottom: 2 }}>
                  ¿Tienes cuenta?{" "}
                  <Link
                    href={`/login?redirect=${encodeURIComponent("/checkout")}`}
                    style={{ color: "var(--color-cq-accent)", textDecoration: "none" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.textDecoration = "none")}
                  >
                    Inicia sesión
                  </Link>
                  {" "}para agilizar el proceso
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-cq-muted)" }}>
                  Usa tus direcciones guardadas y accede a tu historial de pedidos.
                </p>
              </div>
            </div>
            {/* Cerrar banner */}
            <button
              onClick={() => setAuthBannerVisible(false)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--color-cq-muted-2)", padding: 4, borderRadius: 6,
                flexShrink: 0,
              }}
              aria-label="Cerrar aviso"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </motion.div>
        )}

        {/* Banner usuario autenticado */}
        {autenticado && usuario && (
          <motion.div
            key="auth-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 28, height: 28, background: "rgba(16,185,129,0.15)" }}
            >
              {usuario.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={usuario.avatar_url}
                  alt={usuario.nombre}
                  style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <i className="fa-solid fa-circle-check" style={{ fontSize: "0.8rem", color: "#10b981" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", fontWeight: 700, color: "#10b981" }}>
                Sesión activa
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-cq-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {usuario.email}
              </p>
            </div>
            <Link
              href="/perfil"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-cq-muted)", textDecoration: "none", letterSpacing: "0.06em", flexShrink: 0 }}
            >
              Ver perfil →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Campos del formulario ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Nombre" required placeholder="Ej. Juan"
          value={data.nombre}
          onChange={set("nombre")}
          error={errors.nombre}
          disabled={autenticado}
        />
        <FormField
          label="Apellido" required placeholder="Ej. García"
          value={data.apellido}
          onChange={set("apellido")}
          error={errors.apellido}
          disabled={autenticado}
        />
        <FormField
          label="Correo electrónico" required type="email"
          placeholder="correo@ejemplo.com"
          value={data.email}
          onChange={set("email")}
          error={errors.email}
          className="sm:col-span-2"
          disabled={autenticado}
        />
        <FormField
          label="Teléfono" required type="tel"
          placeholder="55 1234 5678"
          value={data.telefono}
          onChange={set("telefono")}
          error={errors.telefono}
          className="sm:col-span-2"
        />
      </div>

      {/* Nota datos bloqueados */}
      {autenticado && (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-cq-muted-2)" }}>
          <i className="fa-solid fa-lock" style={{ marginRight: 4, fontSize: "0.65rem" }} />
          Nombre y correo tomados de tu cuenta.{" "}
          <Link href="/perfil/editar" style={{ color: "var(--color-cq-accent)", textDecoration: "none" }}>
            Editar en perfil →
          </Link>
        </p>
      )}

      {/* ── SSL badge ── */}
      <div
        className="flex items-center gap-3 py-3 px-4 rounded-xl"
        style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.12)" }}
      >
        <i className="fa-solid fa-shield-halved" style={{ fontSize: "0.9rem", color: "var(--color-cq-accent)", flexShrink: 0 }} />
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted)" }}>
          Tu información está protegida con encriptación SSL de 256-bit
        </p>
      </div>

      {/* ── CTA ── */}
      <motion.button
        onClick={() => { if (validate()) onNext(); }}
        whileHover={{ scale: 1.01, boxShadow: "0 8px 28px rgba(29,78,216,0.35)" }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 rounded-xl"
        style={{
          height: 52, background: "var(--color-cq-primary)", color: "white",
          fontFamily: "var(--font-display)", fontSize: "0.875rem",
          letterSpacing: "0.1em", textTransform: "uppercase",
          border: "none", cursor: "pointer", fontWeight: 700,
          boxShadow: "0 4px 20px rgba(29,78,216,0.25)",
        }}
      >
        Continuar con envío
        <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.8rem" }} />
      </motion.button>

      {/* Comprar como invitado (solo para no autenticados) */}
      {!autenticado && (
        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted-2)" }}>
          <i className="fa-regular fa-user" style={{ marginRight: 4, fontSize: "0.72rem" }} />
          Estás comprando como{" "}
          <strong style={{ color: "var(--color-cq-muted)", fontWeight: 600 }}>invitado</strong>.
          {" "}No necesitas cuenta para completar tu compra.
        </p>
      )}
    </motion.div>
  );
}