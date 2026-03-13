// app/(main)/checkout/components/StepConfirmacion.tsx
"use client";

import Link                      from "next/link";
import { useState, useEffect }   from "react";
import { motion }                from "framer-motion";
import { useAuth }               from "@/app/global/context/AuthContext";
import { formatPrice }           from "@/app/global/lib/format";
import type { CheckoutFormData } from "../types";
import type { PaymentConfirmData, SpeiConfirmData, OxxoConfirmData } from "./StepPago";

interface Props {
  formData:     CheckoutFormData;
  orderNumber:  string;
  totalFinal:   number;
  pedidoId:     string | null;
  paymentData:  PaymentConfirmData | null;
  onClearCart:  () => void;
}

function formatFecha(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

/* ── Bloque SPEI ─────────────────────────────────────────── */
function BloqueSpei({ spei }: { spei: SpeiConfirmData }) {
  const [copied, setCopied] = useState<"clabe" | "ref" | null>(null);

  const copiar = async (text: string, field: "clabe" | "ref") => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2200);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="w-full rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.03)", maxWidth: 480 }}>

      <div className="px-5 py-3.5 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid rgba(37,99,235,0.12)", background: "rgba(37,99,235,0.06)" }}>
        <i className="fa-solid fa-building-columns" style={{ fontSize: "0.85rem", color: "var(--color-cq-accent)" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
          Datos para transferencia SPEI
        </span>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        {/* CLABE */}
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-cq-muted-2)", marginBottom: 4 }}>
            CLABE interbancaria
          </p>
          <div className="flex items-center justify-between gap-3">
            <code style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "0.06em" }}>
              {spei.clabe ?? "—"}
            </code>
            <button
              onClick={() => copiar(spei.clabe ?? "", "clabe")}
              disabled={!spei.clabe}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.06em",
                background: copied === "clabe" ? "rgba(34,197,94,0.1)" : "var(--color-cq-surface-2)",
                color: copied === "clabe" ? "#22C55E" : "var(--color-cq-accent)",
                border: "1px solid var(--color-cq-border)",
                cursor: spei.clabe ? "pointer" : "not-allowed",
                opacity: spei.clabe ? 1 : 0.5,
              }}>
              <i className={`fa-solid ${copied === "clabe" ? "fa-check" : "fa-copy"}`} style={{ fontSize: "0.7rem" }} />
              {copied === "clabe" ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>

        {/* Banco */}
        <div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-cq-muted-2)", marginBottom: 4 }}>
            Banco
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-cq-text)" }}>
            {spei.banco}
          </p>
        </div>

        {/* Referencia */}
        {spei.referencia && (
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-cq-muted-2)", marginBottom: 4 }}>
              Concepto / Referencia
            </p>
            <div className="flex items-center justify-between gap-3">
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-cq-text)" }}>
                {spei.referencia}
              </code>
              <button
                onClick={() => copiar(spei.referencia!, "ref")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.06em",
                  background: copied === "ref" ? "rgba(34,197,94,0.1)" : "var(--color-cq-surface-2)",
                  color: copied === "ref" ? "#22C55E" : "var(--color-cq-accent)",
                  border: "1px solid var(--color-cq-border)",
                  cursor: "pointer",
                }}>
                <i className={`fa-solid ${copied === "ref" ? "fa-check" : "fa-copy"}`} style={{ fontSize: "0.7rem" }} />
                {copied === "ref" ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        {/* Monto */}
        {spei.monto && (
          <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(37,99,235,0.12)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-cq-muted-2)" }}>
              Monto exacto a transferir
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, color: "var(--color-cq-accent)" }}>
              {formatPrice(spei.monto)}
            </span>
          </div>
        )}

        {/* Link instrucciones */}
        {spei.hostedInstructionsUrl && (
          <a href={spei.hostedInstructionsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 justify-center rounded-xl py-2.5 transition-all"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-cq-accent)",
              border: "1px solid rgba(37,99,235,0.2)",
              background: "rgba(37,99,235,0.04)",
              textDecoration: "none",
            }}>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.7rem" }} />
            Ver instrucciones completas
          </a>
        )}
      </div>
    </motion.div>
  );
}

/* ── Bloque OXXO ─────────────────────────────────────────── */
function BloqueOxxo({ oxxo, totalFinal }: { oxxo: OxxoConfirmData; totalFinal: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="w-full rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(234,88,12,0.2)", background: "rgba(234,88,12,0.03)", maxWidth: 480 }}>

      <div className="px-5 py-3.5 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid rgba(234,88,12,0.12)", background: "rgba(234,88,12,0.06)" }}>
        <i className="fa-solid fa-store" style={{ fontSize: "0.85rem", color: "#EA580C" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
          Paga en OXXO
        </span>
      </div>

      <div className="px-5 py-4 flex flex-col items-center gap-3 text-center">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-cq-muted)", lineHeight: 1.6 }}>
          Presenta este número de referencia en cualquier tienda OXXO para completar tu pago.
        </p>
        <div className="flex flex-col items-center gap-2 py-4 px-5 rounded-xl"
          style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-cq-muted-2)" }}>
            Número de referencia
          </span>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 800, color: "var(--color-cq-text)", letterSpacing: "0.08em" }}>
            {oxxo.numero}
          </code>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "#EA580C" }}>
            {formatPrice(totalFinal)}
          </span>
        </div>
        {oxxo.expira && (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-cq-muted-2)" }}>
            <i className="fa-solid fa-clock" style={{ marginRight: 6, fontSize: "0.7rem" }} />
            Válido hasta: {formatFecha(oxxo.expira)}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* ── Componente principal ────────────────────────────────── */
export function StepConfirmacion({ formData, orderNumber, totalFinal, pedidoId, paymentData, onClearCart }: Props) {
  const { usuario, autenticado } = useAuth();
  const { contacto, envio, pago } = formData;
  const metodoLabel =
    pago.metodo === "tarjeta"       ? "Tarjeta de crédito / débito" :
    pago.metodo === "transferencia" ? "Transferencia SPEI" :
    pago.metodo === "oxxo"          ? "OXXO en efectivo" : pago.metodo;

  useEffect(() => {
    onClearCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-7 py-4"
    >
      {/* Ícono de éxito */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 80, height: 80, background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 12px 32px rgba(34,197,94,0.3)" }}>
        <i className="fa-solid fa-check" style={{ fontSize: "2rem", color: "white" }} />
      </motion.div>

      {/* Textos */}
      <div className="text-center" style={{ maxWidth: 420 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#22c55e", marginBottom: 8 }}>
          Pedido confirmado
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: "var(--color-cq-text)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 12 }}>
          ¡Gracias por tu compra!
        </h2>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)", lineHeight: 1.6 }}>
          {pago.metodo === "tarjeta"
            ? "Tu pago fue procesado exitosamente. Te enviaremos actualizaciones a "
            : "Hemos registrado tu pedido. Te enviamos los datos de pago a "}
          <strong style={{ color: "var(--color-cq-text)" }}>{contacto.email}</strong>.
        </p>
      </div>

      {/* Número de pedido */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-1.5 px-6 py-4 rounded-2xl"
        style={{ border: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface-2)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-cq-muted-2)" }}>
          Número de pedido
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 800, color: "var(--color-cq-text)", letterSpacing: "0.06em" }}>
          {orderNumber}
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-cq-accent)" }}>
          {formatPrice(totalFinal)}
        </span>
      </motion.div>

      {/* Bloque de pago específico */}
      {paymentData?.spei && (
        <BloqueSpei spei={paymentData.spei} />
      )}
      {paymentData?.oxxo && (
        <BloqueOxxo oxxo={paymentData.oxxo} totalFinal={totalFinal} />
      )}

      {/* Resumen del pedido */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface)", maxWidth: 480 }}>

        {/* Dirección */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-location-dot" style={{ fontSize: "0.75rem", color: "var(--color-cq-accent)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
              Dirección de envío
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-text)", lineHeight: 1.7 }}>
            {contacto.nombre} {contacto.apellido}<br />
            {envio.calle} {envio.numeroExt}{envio.numeroInt ? ` Int. ${envio.numeroInt}` : ""}<br />
            {envio.colonia}, {envio.ciudad}{envio.municipio ? `, ${envio.municipio}` : ""}<br />
            {envio.estado}, C.P. {envio.codigoPostal}
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

      {/* CTA crear cuenta si es guest */}
      {!autenticado && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="w-full rounded-2xl p-5 flex flex-col gap-3"
          style={{ border: "1px solid var(--color-cq-border)", background: "var(--color-cq-surface)", maxWidth: 480 }}>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, color: "var(--color-cq-text)", marginBottom: 4 }}>
              ¿Quieres rastrear tu pedido?
            </p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-cq-muted)" }}>
              Crea una cuenta gratis y accede a tu historial de pedidos en cualquier momento.
            </p>
          </div>
          <Link href={`/register?email=${encodeURIComponent(contacto.email)}`}
            className="flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.875rem",
              background: "var(--color-cq-accent)",
              color: "white",
              textDecoration: "none",
            }}>
            <i className="fa-solid fa-user-plus" style={{ fontSize: "0.8rem" }} />
            Crear cuenta
          </Link>
        </motion.div>
      )}

      {/* CTA volver al catálogo */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="flex flex-col items-center gap-3">
        <Link href="/catalogo"
          className="flex items-center gap-2 rounded-xl px-6 py-3 transition-all"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "0.9rem",
            border: "1px solid var(--color-cq-border)",
            color: "var(--color-cq-text)",
            background: "var(--color-cq-surface)",
            textDecoration: "none",
          }}>
          <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.8rem" }} />
          Seguir comprando
        </Link>
        {autenticado && (
          <Link href="/cuenta/pedidos"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              color: "var(--color-cq-muted)",
              textDecoration: "underline",
            }}>
            Ver mis pedidos
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}