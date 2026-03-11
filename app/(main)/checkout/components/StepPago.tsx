// app/(main)/checkout/components/StepConfirmacion.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CheckoutFormData } from "../types";

interface Props {
  formData:    CheckoutFormData;
  orderNumber: string;
  totalFinal:  number;
  pedidoId:    string | null;
  onClearCart: () => void;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 0,
  }).format(n) + " MXN";
}

export function StepConfirmacion({ formData, orderNumber, totalFinal, pedidoId, onClearCart }: Props) {
  useEffect(() => { onClearCart(); }, []); // eslint-disable-line

  const metodoPago = formData.pago.metodo === "tarjeta"
    ? "PayPal · Tarjeta"
    : formData.pago.metodo === "transferencia"
    ? "Transferencia SPEI"
    : "OXXO";

  const details = [
    { label: "Pedido",  value: `#${orderNumber}`,                                                                              icon: "fa-solid fa-hashtag"              },
    { label: "Cliente", value: `${formData.contacto.nombre} ${formData.contacto.apellido}`,                                    icon: "fa-solid fa-user"                 },
    { label: "Correo",  value: formData.contacto.email,                                                                        icon: "fa-solid fa-envelope"             },
    { label: "Envío",   value: `${formData.envio.calle} ${formData.envio.numeroExt}, ${formData.envio.colonia}, ${formData.envio.ciudad}`, icon: "fa-solid fa-location-dot" },
    { label: "Pago",    value: metodoPago,                                                                                     icon: "fa-solid fa-credit-card"          },
    ...(pedidoId ? [{ label: "Ref. pago", value: pedidoId, icon: "fa-brands fa-paypal" }] : []),
    { label: "Total",   value: formatPrice(totalFinal),                                                                        icon: "fa-solid fa-circle-dollar-to-slot"},
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-7 py-2"
    >
      {/* Ícono de éxito */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 80, height: 80,
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            boxShadow: "0 8px 32px rgba(34,197,94,0.3)",
          }}>
          <motion.i
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="fa-solid fa-check"
            style={{ fontSize: "1.8rem", color: "white" }}
          />
        </motion.div>
        {/* Pulse ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ delay: 0.15, duration: 0.9 }}
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(34,197,94,0.2)" }}
        />
      </div>

      {/* Texto */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem,4vw,2rem)",
            fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "-0.02em",
          }}>
          ¡Pedido confirmado!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "var(--font-body)", fontSize: "0.875rem",
            color: "var(--color-cq-muted)", marginTop: 8, maxWidth: 360,
          }}>
          Enviamos confirmación a{" "}
          <strong style={{ color: "var(--color-cq-accent)" }}>{formData.contacto.email}</strong>
        </motion.p>
      </div>

      {/* Resumen */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--color-cq-border)" }}>
        <div className="px-5 py-3.5 flex items-center gap-2"
          style={{ background: "var(--color-cq-surface-2)", borderBottom: "1px solid var(--color-cq-border)" }}>
          <i className="fa-solid fa-receipt" style={{ fontSize: "0.75rem", color: "var(--color-cq-accent)" }} />
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: "0.63rem",
            letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted)",
          }}>
            Resumen del pedido
          </p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3" style={{ background: "var(--color-cq-surface)" }}>
          {details.map(({ label, value, icon }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <i className={icon} style={{ fontSize: "0.68rem", color: "var(--color-cq-muted-2)", width: 14, textAlign: "center" }} />
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.65rem",
                  letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-cq-muted-2)",
                }}>
                  {label}
                </span>
              </div>
              <span style={{
                fontFamily: "var(--font-body)", fontSize: "0.82rem",
                color: "var(--color-cq-text)", textAlign: "right",
                fontWeight: label === "Total" ? 700 : 400,
                wordBreak: "break-all",
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Próximos pasos */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
        className="w-full flex flex-col gap-2.5">
        {[
          { step: "01", text: "Recibirás un correo con los detalles de tu pedido.", icon: "fa-solid fa-envelope"   },
          { step: "02", text: "Procesaremos tu pedido en 1-2 días hábiles.",        icon: "fa-solid fa-gears"      },
          { step: "03", text: "Te notificaremos cuando tu paquete sea enviado.",     icon: "fa-solid fa-truck-fast" },
        ].map(({ step, text, icon }) => (
          <div key={step} className="flex items-start gap-3">
            <i className={icon} style={{
              fontSize: "0.8rem", color: "var(--color-cq-accent)",
              marginTop: 2, flexShrink: 0, width: 16, textAlign: "center",
            }} />
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)" }}>
              {text}
            </p>
          </div>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.52 }}
        className="w-full flex flex-col gap-3">
        <Link href="/catalogo" className="w-full flex items-center justify-center gap-2 rounded-xl"
          style={{
            height: 52, background: "var(--color-cq-primary)", color: "white",
            textDecoration: "none", fontFamily: "var(--font-display)", fontSize: "0.875rem",
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            boxShadow: "0 4px 20px rgba(29,78,216,0.25)",
          }}>
          <i className="fa-solid fa-bags-shopping" style={{ fontSize: "0.85rem" }} />
          Seguir comprando
        </Link>
        <Link href="/" className="w-full flex items-center justify-center rounded-xl"
          style={{
            height: 42, background: "transparent", color: "var(--color-cq-muted)",
            textDecoration: "none", fontFamily: "var(--font-mono)", fontSize: "0.65rem",
            letterSpacing: "0.08em", textTransform: "uppercase",
            border: "1px solid var(--color-cq-border)",
          }}>
          <i className="fa-solid fa-house" style={{ marginRight: 6, fontSize: "0.7rem" }} />
          Ir al inicio
        </Link>
      </motion.div>
    </motion.div>
  );
}