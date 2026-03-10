// app/(main)/checkout/components/StepPago.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormField } from "./FormField";
import type { DatosPago } from "../types";

interface Props {
  data:      DatosPago;
  onChange:  (data: DatosPago) => void;
  onNext:    () => void;
  onBack:    () => void;
  isLoading: boolean;
}

const METODOS: { id: DatosPago["metodo"]; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "tarjeta",
    label: "Tarjeta de crédito / débito",
    desc: "Visa, Mastercard, American Express",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <rect x="1" y="4" width="22" height="16" rx="3" ry="3"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    id: "transferencia",
    label: "Transferencia bancaria",
    desc: "SPEI / Depósito bancario",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    id: "oxxo",
    label: "Pago en OXXO",
    desc: "Genera tu ficha y paga en tienda",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="2" ry="2"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="11" y2="16"/>
      </svg>
    ),
  },
];

export function StepPago({ data, onChange, onNext, onBack, isLoading }: Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof DatosPago, string>>>({});

  const validate = (): boolean => {
    if (data.metodo !== "tarjeta") return true;
    const e: typeof errors = {};
    const numLimpio = data.numeroTarjeta.replace(/\s/g, "");
    if (numLimpio.length < 16) e.numeroTarjeta = "Número de tarjeta inválido";
    if (!data.nombreTarjeta.trim()) e.nombreTarjeta = "Nombre en la tarjeta requerido";
    if (!data.expiracion.match(/^\d{2}\/\d{2}$/)) e.expiracion = "Formato MM/AA";
    if (data.cvv.length < 3) e.cvv = "CVV de 3 dígitos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 16);
    return cleaned.match(/.{1,4}/g)?.join(" ") ?? cleaned;
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length > 2) return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    return cleaned;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      <div>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--color-cq-text)",
          letterSpacing: "-0.01em",
        }}>
          Método de pago
        </h2>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          color: "var(--color-cq-muted)",
          marginTop: 4,
        }}>
          Elige cómo quieres pagar tu pedido.
        </p>
      </div>

      {/* Selector de método */}
      <div className="flex flex-col gap-2">
        {METODOS.map((m) => {
          const isSelected = data.metodo === m.id;
          return (
            <motion.button
              key={m.id}
              onClick={() => onChange({ ...data, metodo: m.id })}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              className="flex items-center gap-4 rounded-xl text-left"
              style={{
                padding: "14px 16px",
                background: isSelected ? "rgba(37,99,235,0.06)" : "var(--color-cq-surface)",
                border: `1.5px solid ${isSelected ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
                cursor: "pointer",
                transition: "border-color 0.2s ease, background 0.2s ease",
              }}
            >
              {/* Radio */}
              <div style={{
                width: 18, height: 18,
                borderRadius: "50%",
                border: `2px solid ${isSelected ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                transition: "border-color 0.2s ease",
              }}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: 8, height: 8,
                      borderRadius: "50%",
                      background: "var(--color-cq-accent)",
                    }}
                  />
                )}
              </div>
              {/* Icono */}
              <span style={{ color: isSelected ? "var(--color-cq-accent)" : "var(--color-cq-muted)" }}>
                {m.icon}
              </span>
              {/* Text */}
              <div>
                <p style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--color-cq-text)",
                }}>
                  {m.label}
                </p>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "var(--color-cq-muted-2)",
                  letterSpacing: "0.04em",
                }}>
                  {m.desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Formulario de tarjeta */}
      <AnimatePresence>
        {data.metodo === "tarjeta" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <FormField
                label="Número de tarjeta" required
                placeholder="0000 0000 0000 0000"
                value={data.numeroTarjeta}
                onChange={(e) => onChange({ ...data, numeroTarjeta: formatCardNumber(e.target.value) })}
                error={errors.numeroTarjeta}
                maxLength={19}
                className="sm:col-span-2"
              />
              <FormField
                label="Nombre en la tarjeta" required
                placeholder="JUAN GARCIA"
                value={data.nombreTarjeta}
                onChange={(e) => onChange({ ...data, nombreTarjeta: e.target.value.toUpperCase() })}
                error={errors.nombreTarjeta}
                className="sm:col-span-2"
              />
              <FormField
                label="Expiración" required
                placeholder="MM/AA"
                value={data.expiracion}
                onChange={(e) => onChange({ ...data, expiracion: formatExpiry(e.target.value) })}
                error={errors.expiracion}
                maxLength={5}
              />
              <FormField
                label="CVV" required
                placeholder="123"
                type="password"
                value={data.cvv}
                onChange={(e) => onChange({ ...data, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                error={errors.cvv}
                maxLength={4}
              />
            </div>
          </motion.div>
        )}

        {data.metodo === "transferencia" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}
          >
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
              Datos bancarios
            </p>
            {[
              { label: "Banco", value: "BBVA" },
              { label: "Titular", value: "Craftqube S.A. de C.V." },
              { label: "CLABE", value: "012 345 678 901 234 567" },
              { label: "Número de cuenta", value: "0123456789" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-cq-muted)" }}>{item.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--color-cq-text)", fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-cq-muted-2)", marginTop: 4 }}>
              Incluye tu número de pedido como referencia. Tu pedido se procesará al confirmar el pago.
            </p>
          </motion.div>
        )}

        {data.metodo === "oxxo" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl p-4"
            style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}
          >
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)" }}>
              Al confirmar tu pedido, recibirás una ficha de pago OXXO por correo electrónico.
              Tienes <strong style={{ color: "var(--color-cq-text)" }}>72 horas</strong> para realizar el pago.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seguridad */}
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14"
          style={{ color: "var(--color-cq-muted-2)" }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--color-cq-muted-2)", letterSpacing: "0.04em" }}>
          Pago seguro · SSL 256-bit · No almacenamos datos de tarjeta
        </span>
      </div>

      <div className="flex gap-3">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 rounded-xl"
          style={{
            height: 52, flex: "0 0 auto", padding: "0 24px",
            background: "transparent",
            color: "var(--color-cq-muted)",
            fontFamily: "var(--font-mono)", fontSize: "0.7rem",
            letterSpacing: "0.08em", textTransform: "uppercase",
            border: "1.5px solid var(--color-cq-border)",
            cursor: "pointer",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </motion.button>
        <motion.button
          onClick={() => { if (validate()) onNext(); }}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.01, boxShadow: "0 8px 28px rgba(29,78,216,0.35)" } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold"
          style={{
            height: 52,
            background: isLoading ? "var(--color-cq-surface-2)" : "var(--color-cq-primary)",
            color: isLoading ? "var(--color-cq-muted)" : "white",
            fontFamily: "var(--font-display)", fontSize: "0.875rem",
            letterSpacing: "0.1em", textTransform: "uppercase",
            border: "none", cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: isLoading ? "none" : "0 4px 20px rgba(29,78,216,0.25)",
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"
                style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Procesando...
            </>
          ) : (
            <>
              Confirmar pedido
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}