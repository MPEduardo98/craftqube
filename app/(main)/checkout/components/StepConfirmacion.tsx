// app/(main)/checkout/components/StepConfirmacion.tsx
"use client";

import Link                      from "next/link";
import { useEffect }             from "react";
import { motion }                from "framer-motion";
import { useAuth }               from "@/app/global/context/AuthContext";
import type { CheckoutFormData } from "../types";

interface Props {
  formData:    CheckoutFormData;
  orderNumber: string;
  totalFinal:  number;
  pedidoId:    string | null;   // Stripe PaymentIntent ID (pi_xxx) o null
  onClearCart: () => void;
}

function formatPrice(n: number) {
  return (
    new Intl.NumberFormat("es-MX", {
      style: "currency", currency: "MXN", maximumFractionDigits: 0,
    }).format(n) + " MXN"
  );
}

const METODO_LABELS: Record<string, string> = {
  tarjeta:       "Tarjeta bancaria",
  transferencia: "Transferencia SPEI",
  oxxo:          "OXXO en efectivo",
};

export function StepConfirmacion({ formData, orderNumber, totalFinal, pedidoId, onClearCart }: Props) {
  const { autenticado, usuario } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onClearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { contacto, envio, pago } = formData;
  const metodoLabel = METODO_LABELS[pago.metodo] ?? pago.metodo;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-8 py-4"
    >
      {/* ── Ícono de éxito ── */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: 80, height: 80,
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          boxShadow: "0 12px 32px rgba(34,197,94,0.3)",
        }}
      >
        <i className="fa-solid fa-check" style={{ fontSize: "2rem", color: "white" }} />
      </motion.div>

      {/* ── Textos ── */}
      <div className="text-center" style={{ maxWidth: 420 }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.62rem",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#22c55e", marginBottom: 8,
        }}>
          Pedido confirmado
        </p>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800,
          color: "var(--color-cq-text)", letterSpacing: "-0.02em",
          lineHeight: 1.1, marginBottom: 12,
        }}>
          ¡Gracias por tu compra!
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)", lineHeight: 1.6 }}>
          Hemos recibido tu pedido y lo estamos procesando.{" "}
          Te enviaremos la confirmación a{" "}
          <strong style={{ color: "var(--color-cq-text)" }}>{contacto.email}</strong>.
        </p>
      </div>

      {/* ── Número de pedido ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-2 py-4 px-8 rounded-2xl w-full"
        style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)", maxWidth: 360 }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-cq-muted-2)" }}>
          Número de pedido
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, color: "var(--color-cq-text)", letterSpacing: "0.04em" }}>
          {orderNumber}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-cq-accent)" }}>
          {formatPrice(totalFinal)}
        </span>
      </motion.div>

      {/* ── Resumen de datos ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--color-cq-border)", maxWidth: 480 }}
      >
        {/* Dirección */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-location-dot" style={{ fontSize: "0.75rem", color: "var(--color-cq-accent)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
              Dirección de envío
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-text)", lineHeight: 1.6 }}>
            {contacto.nombre} {contacto.apellido}<br />
            {envio.calle} {envio.numeroExt}{envio.numeroInt ? ` Int. ${envio.numeroInt}` : ""}<br />
            {envio.colonia}, {envio.ciudad}{envio.municipio ? `, ${envio.municipio}` : ""}<br />
            {envio.estado}, C.P. {envio.codigoPostal}<br />
            {envio.pais}
          </p>
        </div>

        {/* Método de pago */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-credit-card" style={{ fontSize: "0.75rem", color: "var(--color-cq-accent)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
              Método de pago
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-text)" }}>
            {metodoLabel}
          </p>
        </div>
      </motion.div>

      {/* ── CTA: crear cuenta (guest) ── */}
      {!autenticado && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="w-full rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.14)", maxWidth: 480 }}
        >
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)", textAlign: "center" }}>
            Crea una cuenta para rastrear tu pedido y guardar tus datos para próximas compras.
          </p>
          <Link
            href={`/registro?email=${encodeURIComponent(contacto.email)}`}
            className="flex items-center gap-2 justify-center rounded-xl"
            style={{
              height: 44, background: "var(--color-cq-accent)", color: "white",
              fontFamily: "var(--font-display)", fontSize: "0.8rem",
              letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none", fontWeight: 700,
            }}
          >
            Crear cuenta gratuita
            <i className="fa-solid fa-arrow-right" style={{ fontSize: "0.72rem" }} />
          </Link>
        </motion.div>
      )}

      {/* ── Ver pedido (usuarios autenticados) ── */}
      {autenticado && pedidoId && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Link
            href="/cuenta/pedidos"
            className="flex items-center gap-2 justify-center rounded-xl px-6"
            style={{
              height: 44,
              background: "var(--color-cq-surface-2)",
              border: "1px solid var(--color-cq-border)",
              color: "var(--color-cq-muted)",
              fontFamily: "var(--font-display)", fontSize: "0.78rem",
              letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none", fontWeight: 600,
            }}
          >
            <i className="fa-solid fa-box" style={{ fontSize: "0.75rem" }} />
            Ver estado de mi pedido
          </Link>
        </motion.div>
      )}

      {/* ── CTAs ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 w-full"
        style={{ maxWidth: 480 }}
      >
        <Link href="/catalogo"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl"
          style={{
            height: 48, background: "var(--color-cq-surface-2)",
            border: "1px solid var(--color-cq-border)",
            color: "var(--color-cq-text)", fontFamily: "var(--font-body)",
            fontSize: "0.875rem", fontWeight: 600, textDecoration: "none",
          }}
        >
          <i className="fa-solid fa-bag-shopping" style={{ fontSize: "0.8rem" }} />
          Seguir comprando
        </Link>
        <Link href="/"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl"
          style={{
            height: 48, background: "var(--color-cq-surface-2)",
            border: "1px solid var(--color-cq-border)",
            color: "var(--color-cq-muted)", fontFamily: "var(--font-body)",
            fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
          }}
        >
          Ir al inicio
        </Link>
      </motion.div>
    </motion.div>
  );
}