// app/(main)/checkout/components/StepConfirmacion.tsx
"use client";

import Link                                      from "next/link";
import { useState, useEffect }                   from "react";
import { motion }                                from "framer-motion";
import { useAuth }                               from "@/app/global/context/AuthContext";
import type { CheckoutFormData }                 from "../types";
import type { PaymentConfirmData, SpeiConfirmData, OxxoConfirmData } from "./StepPago";

interface Props {
  formData:     CheckoutFormData;
  orderNumber:  string;
  totalFinal:   number;
  pedidoId:     string | null;
  paymentData:  PaymentConfirmData | null;
  onClearCart:  () => void;
}

function formatPrice(n: number) {
  return (
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n) + " MXN"
  );
}

function formatFecha(unix: number) {
  return new Date(unix * 1000).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function formatMXN(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n) + " MXN";
}

/* ── Bloque SPEI ─────────────────────────────────────────── */
function BloqueSpei({ spei }: { spei: SpeiConfirmData }) {
  const [copied, setCopied] = useState<"clabe" | "ref" | null>(null);

  const copiar = async (text: string, field: "clabe" | "ref") => {
    await navigator.clipboard.writeText(text);
    setCopied(field); setTimeout(() => setCopied(null), 2200);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="w-full rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.03)", maxWidth: 480 }}>

      {/* Header */}
      <div className="px-5 py-3.5 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid rgba(37,99,235,0.12)", background: "rgba(37,99,235,0.06)" }}>
        <i className="fa-solid fa-building-columns" style={{ fontSize: "0.85rem", color: "var(--color-cq-accent)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.14em",
          textTransform: "uppercase", color: "var(--color-cq-accent)", fontWeight: 600 }}>
          Datos para tu transferencia SPEI
        </span>
      </div>

      <div className="flex flex-col gap-0">
        {/* CLABE */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(37,99,235,0.1)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--color-cq-muted)", display: "block", marginBottom: 6 }}>
            CLABE interbancaria
          </span>
          <div className="flex items-center gap-3">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700,
              color: "var(--color-cq-text)", letterSpacing: "0.06em", flex: 1, wordBreak: "break-all" }}>
              {spei.clabe ?? "—"}
            </span>
            {spei.clabe && (
              <motion.button type="button" whileTap={{ scale: 0.94 }}
                onClick={() => copiar(spei.clabe!, "clabe")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 shrink-0"
                style={{ background: copied === "clabe" ? "rgba(34,197,94,0.1)" : "var(--color-cq-surface-2)",
                  border: `1px solid ${copied === "clabe" ? "rgba(34,197,94,0.3)" : "var(--color-cq-border)"}`,
                  cursor: "pointer", transition: "all .2s" }}>
                <i className={`fa-solid ${copied === "clabe" ? "fa-check" : "fa-copy"}`}
                  style={{ fontSize: "0.72rem", color: copied === "clabe" ? "#22c55e" : "var(--color-cq-muted)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", textTransform: "uppercase",
                  letterSpacing: "0.08em", color: copied === "clabe" ? "#22c55e" : "var(--color-cq-muted)" }}>
                  {copied === "clabe" ? "Copiado" : "Copiar"}
                </span>
              </motion.button>
            )}
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted)", display: "block", marginTop: 4 }}>
            Banco: <strong style={{ color: "var(--color-cq-text)" }}>{spei.banco}</strong>
          </span>
        </div>

        {/* Referencia */}
        {spei.referencia && (
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(37,99,235,0.1)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em",
              textTransform: "uppercase", color: "var(--color-cq-muted)", display: "block", marginBottom: 6 }}>
              Referencia
            </span>
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700,
                color: "var(--color-cq-text)", flex: 1 }}>
                {spei.referencia}
              </span>
              <motion.button type="button" whileTap={{ scale: 0.94 }}
                onClick={() => copiar(spei.referencia!, "ref")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 shrink-0"
                style={{ background: copied === "ref" ? "rgba(34,197,94,0.1)" : "var(--color-cq-surface-2)",
                  border: `1px solid ${copied === "ref" ? "rgba(34,197,94,0.3)" : "var(--color-cq-border)"}`,
                  cursor: "pointer", transition: "all .2s" }}>
                <i className={`fa-solid ${copied === "ref" ? "fa-check" : "fa-copy"}`}
                  style={{ fontSize: "0.72rem", color: copied === "ref" ? "#22c55e" : "var(--color-cq-muted)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", textTransform: "uppercase",
                  letterSpacing: "0.08em", color: copied === "ref" ? "#22c55e" : "var(--color-cq-muted)" }}>
                  {copied === "ref" ? "Copiado" : "Copiar"}
                </span>
              </motion.button>
            </div>
          </div>
        )}

        {/* Monto */}
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: spei.hostedInstructionsUrl ? "1px solid rgba(37,99,235,0.1)" : "none" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)" }}>
            Monto exacto a transferir
          </span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 800, color: "var(--color-cq-accent)" }}>
            {formatMXN(spei.monto)}
          </span>
        </div>

        {/* Link instrucciones */}
        {spei.hostedInstructionsUrl && (
          <div className="px-5 py-3">
            <a href={spei.hostedInstructionsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl"
              style={{ height: 40, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)",
                textDecoration: "none", fontFamily: "var(--font-body)", fontSize: "0.82rem",
                fontWeight: 500, color: "var(--color-cq-text)" }}>
              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "0.72rem", color: "var(--color-cq-accent)" }} />
              Ver instrucciones completas
            </a>
          </div>
        )}
      </div>

      {/* Aviso exactitud */}
      <div className="px-5 pb-4">
        <div className="flex items-start gap-2 rounded-xl p-3"
          style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.15)" }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: "0.78rem", color: "#f97316", marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-cq-muted)", lineHeight: 1.55 }}>
            Transfiere el monto <strong style={{ color: "var(--color-cq-text)" }}>exacto</strong>. Diferencias en centavos pueden retrasar la confirmación.
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Bloque OXXO ─────────────────────────────────────────── */
function BloqueOxxo({ oxxo }: { oxxo: OxxoConfirmData }) {
  const [copied, setCopied] = useState(false);

  const copiar = async () => {
    await navigator.clipboard.writeText(oxxo.numero);
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="w-full rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.03)", maxWidth: 480 }}>

      {/* Header */}
      <div className="px-5 py-3.5 flex items-center gap-2.5"
        style={{ borderBottom: "1px solid rgba(37,99,235,0.12)", background: "rgba(37,99,235,0.06)" }}>
        <i className="fa-solid fa-store" style={{ fontSize: "0.85rem", color: "var(--color-cq-accent)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.14em",
          textTransform: "uppercase", color: "var(--color-cq-accent)", fontWeight: 600 }}>
          Código de pago OXXO
        </span>
      </div>

      {/* Número de referencia */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(37,99,235,0.1)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em",
          textTransform: "uppercase", color: "var(--color-cq-muted)", display: "block", marginBottom: 6 }}>
          Número de referencia
        </span>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700,
            color: "var(--color-cq-text)", letterSpacing: "0.06em", flex: 1, wordBreak: "break-all" }}>
            {oxxo.numero}
          </span>
          <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={copiar}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 shrink-0"
            style={{ background: copied ? "rgba(34,197,94,0.1)" : "var(--color-cq-surface-2)",
              border: `1px solid ${copied ? "rgba(34,197,94,0.3)" : "var(--color-cq-border)"}`,
              cursor: "pointer", transition: "all .2s" }}>
            <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`}
              style={{ fontSize: "0.72rem", color: copied ? "#22c55e" : "var(--color-cq-muted)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", textTransform: "uppercase",
              letterSpacing: "0.08em", color: copied ? "#22c55e" : "var(--color-cq-muted)" }}>
              {copied ? "Copiado" : "Copiar"}
            </span>
          </motion.button>
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "#ef4444", fontWeight: 600, display: "block", marginTop: 4 }}>
          Válido hasta: {formatFecha(oxxo.expira)}
        </span>
      </div>

      {/* Instrucciones rápidas */}
      <div className="px-5 py-4 flex flex-col gap-2.5" style={{ borderBottom: oxxo.hostedVoucherUrl ? "1px solid rgba(37,99,235,0.1)" : "none" }}>
        {[
          "Ve a cualquier tienda OXXO en México.",
          "Indica al cajero el número de referencia.",
          "Guarda tu ticket como comprobante.",
        ].map((text, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <div className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 20, height: 20, background: "rgba(37,99,235,0.1)",
                fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700, color: "var(--color-cq-accent)" }}>
              {i + 1}
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-cq-muted)", lineHeight: 1.5, paddingTop: 2 }}>
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* PDF voucher */}
      {oxxo.hostedVoucherUrl && (
        <div className="px-5 py-3">
          <a href={oxxo.hostedVoucherUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl"
            style={{ height: 40, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)",
              textDecoration: "none", fontFamily: "var(--font-body)", fontSize: "0.82rem",
              fontWeight: 500, color: "var(--color-cq-text)" }}>
            <i className="fa-solid fa-file-pdf" style={{ fontSize: "0.75rem", color: "var(--color-cq-accent)" }} />
            Ver / descargar voucher
          </a>
        </div>
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* StepConfirmacion                                           */
/* ══════════════════════════════════════════════════════════ */
const METODO_LABELS: Record<string, string> = {
  tarjeta:       "Tarjeta bancaria",
  transferencia: "Transferencia SPEI",
  oxxo:          "OXXO en efectivo",
};

export function StepConfirmacion({ formData, orderNumber, totalFinal, pedidoId, paymentData, onClearCart }: Props) {
  const { autenticado } = useAuth();

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
      className="flex flex-col items-center gap-7 py-4"
    >
      {/* Ícono */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 80, height: 80, background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 12px 32px rgba(34,197,94,0.3)" }}>
        <i className="fa-solid fa-check" style={{ fontSize: "2rem", color: "white" }} />
      </motion.div>

      {/* Textos */}
      <div className="text-center" style={{ maxWidth: 420 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#22c55e", marginBottom: 8 }}>
          Pedido confirmado
        </p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800,
          color: "var(--color-cq-text)", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 12 }}>
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex flex-col items-center gap-2 py-4 px-8 rounded-2xl w-full"
        style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)", maxWidth: 360 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.16em",
          textTransform: "uppercase", color: "var(--color-cq-muted-2)" }}>
          Número de pedido
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800,
          color: "var(--color-cq-text)", letterSpacing: "0.04em" }}>
          {orderNumber}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-cq-accent)" }}>
          {formatPrice(totalFinal)}
        </span>
      </motion.div>

      {/* Bloque SPEI o OXXO según el método */}
      {paymentData?.spei && <BloqueSpei spei={paymentData.spei} />}
      {paymentData?.oxxo && <BloqueOxxo oxxo={paymentData.oxxo} />}

      {/* Resumen de datos */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ border: "1px solid var(--color-cq-border)", maxWidth: 480 }}>
        {/* Dirección */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-cq-border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-location-dot" style={{ fontSize: "0.75rem", color: "var(--color-cq-accent)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
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
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
              Método de pago
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-text)" }}>
            {metodoLabel}
          </p>
        </div>
      </motion.div>

      {/* CTA crear cuenta (solo guest) */}
      {!autenticado && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="w-full rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.14)", maxWidth: 480 }}>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)", textAlign: "center" }}>
            Crea una cuenta para rastrear tu pedido y guardar tus datos para próximas compras.
          </p>
          <Link href={`/registro?email=${encodeURIComponent(contacto.email)}`}
            className="flex items-center justify-center gap-2 rounded-xl"
            style={{ height: 42, background: "var(--color-cq-accent)", color: "white",
              textDecoration: "none", fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600 }}>
            <i className="fa-solid fa-user-plus" style={{ fontSize: "0.78rem" }} />
            Crear cuenta gratis
          </Link>
        </motion.div>
      )}

      {/* Acciones */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="flex flex-col gap-3 w-full" style={{ maxWidth: 480 }}>
        <Link href="/mi-cuenta/pedidos"
          className="flex items-center justify-center gap-2 rounded-xl"
          style={{ height: 44, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)",
            textDecoration: "none", fontFamily: "var(--font-body)", fontSize: "0.85rem",
            fontWeight: 500, color: "var(--color-cq-text)" }}>
          <i className="fa-solid fa-bag-shopping" style={{ fontSize: "0.8rem", color: "var(--color-cq-accent)" }} />
          Ver estado de mi pedido
        </Link>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/catalogo"
            className="flex items-center justify-center gap-2 rounded-xl"
            style={{ height: 44, background: "var(--color-cq-accent)", color: "white",
              textDecoration: "none", fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 600 }}>
            <i className="fa-solid fa-lock" style={{ fontSize: "0.75rem" }} />
            Seguir comprando
          </Link>
          <Link href="/"
            className="flex items-center justify-center rounded-xl"
            style={{ height: 44, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)",
              textDecoration: "none", fontFamily: "var(--font-body)", fontSize: "0.85rem",
              color: "var(--color-cq-muted)" }}>
            Ir al inicio
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}