// app/(main)/checkout/components/StepPago.tsx
"use client";

import { useState, useEffect }     from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PayPalScriptProvider,
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields,
} from "@paypal/react-paypal-js";
import { useCart }        from "@/app/global/context/CartContext";
import type { DatosPago } from "../types";

/* ── tipos ──────────────────────────────────────────────── */
interface Props {
  data:     DatosPago;
  onChange: (data: DatosPago) => void;
  onNext:   (paypalOrderId?: string) => void;
  onBack:   () => void;
}

type Metodo = "tarjeta" | "transferencia" | "oxxo";

const METODOS: { id: Metodo; label: string; icon: string; desc: string }[] = [
  { id: "tarjeta",       label: "Tarjeta de crédito / débito", icon: "fa-solid fa-credit-card",      desc: "Visa, Mastercard, Amex · Procesado con PayPal" },
  { id: "transferencia", label: "Transferencia SPEI",          icon: "fa-solid fa-building-columns",  desc: "Pago bancario · Confirmación en 1–2 hrs" },
  { id: "oxxo",          label: "OXXO en efectivo",            icon: "fa-solid fa-store",             desc: "Paga en cualquier sucursal · Válido 72 horas" },
];

function formatMXN(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 0,
  }).format(n) + " MXN";
}

/* ── Estilos del iframe de PayPal ────────────────────────── */
const HF_STYLES = {
  input: {
    "font-size":   "0.875rem",
    "font-family": "system-ui, sans-serif",
    color:         "#111827",
    padding:       "0",
  },
  ":focus":   { color: "#111827" },
  ".invalid": { color: "#ef4444" },
};

/* ── Wrapper del input con label e icono ─────────────────── */
function FieldWrap({
  label, icon, required, focused, children,
}: {
  label: string; icon: string; required?: boolean;
  focused: boolean; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{
        fontFamily: "var(--font-mono)", fontSize: "0.64rem",
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
        fontWeight: 500, transition: "color .2s",
      }}>
        {label}
        {required && <span style={{ color: "var(--color-cq-accent)", marginLeft: 2 }}>*</span>}
      </label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        height: 46, padding: "0 14px", borderRadius: 10,
        background:  "var(--color-cq-surface-2)",
        border:      `1.5px solid ${focused ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
        boxShadow:   focused ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
        transition:  "border-color .2s, box-shadow .2s",
      }}>
        <i className={icon} style={{
          fontSize: "0.8rem", flexShrink: 0,
          color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
          transition: "color .2s",
        }} />
        {children}
      </div>
    </div>
  );
}

/* ── Input normal (nombre titular) ──────────────────────── */
function PlainInput({ label, icon, required, value, onChange, placeholder }: {
  label: string; icon: string; required?: boolean;
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <FieldWrap label={label} icon={icon} required={required} focused={focused}>
      <input
        type="text" value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          fontFamily: "var(--font-body)", fontSize: "0.875rem",
          color: "var(--color-cq-text)",
        }}
      />
    </FieldWrap>
  );
}

/* ── Textarea ────────────────────────────────────────────── */
function TextareaField({ label, value, onChange, placeholder }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{
        fontFamily: "var(--font-mono)", fontSize: "0.64rem",
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--color-cq-muted)", fontWeight: 500,
      }}>{label}</label>
      <textarea rows={2} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full resize-none"
        style={{
          background: "var(--color-cq-surface-2)", borderRadius: 10, padding: "10px 14px",
          border: `1.5px solid ${focused ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
          fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-text)",
          outline: "none", transition: "border-color .2s, box-shadow .2s",
        }} />
    </div>
  );
}

/* ── Spinner ─────────────────────────────────────────────── */
function Spinner() {
  return (
    <motion.div animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      className="rounded-full" style={{
        width: 16, height: 16, flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white",
      }} />
  );
}

/* ── Botón submit (debe ir DENTRO de HostedFieldsProvider) ── */
function SubmitButton({ totalPrecio, cardName, onSuccess, onError }: {
  totalPrecio: number; cardName: string;
  onSuccess: (id: string) => void; onError: (msg: string) => void;
}) {
  const hostedFields = usePayPalHostedFields();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!hostedFields?.cardFields) {
      onError("PayPal no está listo, recarga la página."); return;
    }
    if (!cardName.trim()) { onError("Ingresa el nombre del titular."); return; }

    setLoading(true);
    try {
      const { orderId } = await hostedFields.cardFields.submit({
        cardholderName:  cardName,
        billingAddress:  { countryCode: "MX" },
      });

      const res = await fetch("/api/paypal/capture-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body:   JSON.stringify({ orderID: orderId }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error ?? "Error al capturar pago");
      onSuccess(result.orderID);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button type="button" onClick={handlePay} disabled={loading}
      whileTap={{ scale: 0.98 }}
      className="btn-primary w-full flex items-center justify-center gap-2"
      style={{ height: 50, borderRadius: 12, fontSize: "0.92rem", fontWeight: 700 }}>
      {loading
        ? <><Spinner /> Procesando pago…</>
        : <><i className="fa-solid fa-lock" style={{ fontSize: "0.8rem" }} /> Pagar {formatMXN(totalPrecio)}</>
      }
    </motion.button>
  );
}

/* ── Panel tarjeta completo ──────────────────────────────── */
function CardPanel({ totalPrecio, onSuccess, onError, clientToken }: {
  totalPrecio:  number;
  onSuccess:    (id: string) => void;
  onError:      (msg: string) => void;
  clientToken:  string;
}) {
  const [cardName, setCardName] = useState("");
  const [focused,  setFocused]  = useState<string | null>(null);

  const createOrder = async (): Promise<string> => {
    const res = await fetch("/api/paypal/create-order", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ amount: totalPrecio, currency: "MXN" }),
    });
    const { id } = await res.json();
    return id;
  };

  const fw = (id: string): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 10,
    height: 46, padding: "0 14px", borderRadius: 10,
    background:  "var(--color-cq-surface-2)",
    border:      `1.5px solid ${focused === id ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
    boxShadow:   focused === id ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
    transition:  "border-color .2s, box-shadow .2s",
  });

  const iconColor = (id: string) =>
    focused === id ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)";

  return (
    <PayPalHostedFieldsProvider
      createOrder={createOrder}
      styles={HF_STYLES}
      notEligibleError={
        <p style={{ color: "#ef4444", fontFamily: "var(--font-body)", fontSize: "0.82rem" }}>
          Pagos con tarjeta no disponibles en este momento.
        </p>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Número */}
        <div className="flex flex-col gap-1.5">
          <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem",
            letterSpacing: "0.08em", textTransform: "uppercase",
            color: focused === "number" ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
            fontWeight: 500, transition: "color .2s" }}>
            Número de tarjeta <span style={{ color: "var(--color-cq-accent)" }}>*</span>
          </label>
          <div style={fw("number")}>
            <i className="fa-solid fa-credit-card"
              style={{ fontSize: "0.8rem", flexShrink: 0, color: iconColor("number"), transition: "color .2s" }} />
            <PayPalHostedField
              id="card-number"
              hostedFieldType="number"
              options={{ placeholder: "1234  5678  9012  3456" }}
              style={{ flex: 1, height: "100%", border: "none", outline: "none", background: "transparent" }}
              onFocus={() => setFocused("number")}
              onBlur={() => setFocused(null)}
            />
            {/* logos */}
            <div className="flex items-center gap-1 shrink-0">
              <i className="fa-brands fa-cc-visa"       style={{ fontSize: "1.1rem", color: "#1a1f71" }} />
              <i className="fa-brands fa-cc-mastercard" style={{ fontSize: "1.1rem", color: "#eb001b" }} />
              <i className="fa-brands fa-cc-amex"       style={{ fontSize: "1.1rem", color: "#007bc1" }} />
            </div>
          </div>
        </div>

        {/* Titular */}
        <PlainInput
          label="Nombre del titular" required
          icon="fa-solid fa-user"
          value={cardName}
          onChange={setCardName}
          placeholder="Como aparece en la tarjeta"
        />

        {/* Expiración + CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem",
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: focused === "expiry" ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
              fontWeight: 500, transition: "color .2s" }}>
              Expiración <span style={{ color: "var(--color-cq-accent)" }}>*</span>
            </label>
            <div style={fw("expiry")}>
              <i className="fa-solid fa-calendar-days"
                style={{ fontSize: "0.8rem", flexShrink: 0, color: iconColor("expiry"), transition: "color .2s" }} />
              <PayPalHostedField
                id="expiration-date"
                hostedFieldType="expirationDate"
                options={{ placeholder: "MM / AA" }}
                style={{ flex: 1, height: "100%", border: "none", outline: "none", background: "transparent" }}
                onFocus={() => setFocused("expiry")}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem",
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: focused === "cvv" ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
              fontWeight: 500, transition: "color .2s" }}>
              CVV <span style={{ color: "var(--color-cq-accent)" }}>*</span>
            </label>
            <div style={fw("cvv")}>
              <i className="fa-solid fa-lock"
                style={{ fontSize: "0.8rem", flexShrink: 0, color: iconColor("cvv"), transition: "color .2s" }} />
              <PayPalHostedField
                id="cvv"
                hostedFieldType="cvv"
                options={{ placeholder: "123", maskInput: true }}
                style={{ flex: 1, height: "100%", border: "none", outline: "none", background: "transparent" }}
                onFocus={() => setFocused("cvv")}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>
        </div>

        <SubmitButton
          totalPrecio={totalPrecio}
          cardName={cardName}
          onSuccess={onSuccess}
          onError={onError}
        />

        <div className="flex items-center justify-center gap-2" style={{ color: "var(--color-cq-muted-2)" }}>
          <i className="fa-solid fa-shield-halved" style={{ fontSize: "0.7rem" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem",
            letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Cifrado SSL 256-bit · Procesado por PayPal
          </span>
        </div>
      </div>
    </PayPalHostedFieldsProvider>
  );
}

/* ══════════════════════════════════════════════════════════ */
export function StepPago({ data, onChange, onNext, onBack }: Props) {
  const { totalPrecio }  = useCart();
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [clientToken,  setClientToken]  = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  const setMetodo = (metodo: Metodo) => { onChange({ ...data, metodo }); setError(null); };

  /* Carga el client-token cuando se selecciona tarjeta */
  useEffect(() => {
    if (data.metodo !== "tarjeta" || clientToken || tokenLoading) return;
    setTokenLoading(true);
    fetch("/api/paypal/client-token")
      .then((r) => r.json())
      .then((j) => {
        if (j.clientToken) setClientToken(j.clientToken);
        else setError("No se pudo inicializar el pago.");
      })
      .catch(() => setError("Error de conexión al cargar el formulario."))
      .finally(() => setTokenLoading(false));
  }, [data.metodo, clientToken, tokenLoading]);

  const handleOffline = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    onNext(undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col gap-6">

      {/* ── Título ── */}
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center rounded-xl mt-0.5"
          style={{ width: 36, height: 36, background: "rgba(37,99,235,0.08)", flexShrink: 0 }}>
          <i className="fa-solid fa-lock" style={{ fontSize: "0.9rem", color: "var(--color-cq-accent)" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700,
            color: "var(--color-cq-text)", letterSpacing: "-0.01em" }}>
            Método de pago
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem",
            color: "var(--color-cq-muted)", marginTop: 3 }}>
            Tus datos están protegidos con cifrado SSL.
          </p>
        </div>
      </div>

      {/* ── Selector ── */}
      <div className="flex flex-col gap-2">
        {METODOS.map((m) => {
          const active = data.metodo === m.id;
          return (
            <motion.button key={m.id} type="button" onClick={() => setMetodo(m.id)}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-4 w-full text-left rounded-xl px-4 py-3.5"
              style={{
                background: active ? "rgba(37,99,235,0.07)" : "var(--color-cq-surface-2)",
                border:     `1.5px solid ${active ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
                cursor: "pointer", outline: "none",
                transition: "border-color .2s, background .2s",
              }}>
              <div className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 18, height: 18,
                  border:     `2px solid ${active ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
                  background: active ? "var(--color-cq-accent)" : "transparent",
                  transition: "all .2s",
                }}>
                {active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="rounded-full" style={{ width: 6, height: 6, background: "white" }} />
                )}
              </div>
              <div className="flex items-center justify-center rounded-lg shrink-0"
                style={{
                  width: 34, height: 34,
                  background: active ? "var(--color-cq-accent)" : "var(--color-cq-border)",
                  transition: "background .2s",
                }}>
                <i className={m.icon} style={{ fontSize: "0.85rem", color: active ? "white" : "var(--color-cq-muted)" }} />
              </div>
              <div className="flex flex-col min-w-0">
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem",
                  fontWeight: 700, color: "var(--color-cq-text)" }}>
                  {m.label}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem",
                  color: "var(--color-cq-muted)", lineHeight: 1.4 }}>
                  {m.desc}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <i className="fa-solid fa-circle-exclamation"
              style={{ fontSize: "0.8rem", color: "#ef4444", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#ef4444" }}>
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Paneles ── */}
      <AnimatePresence mode="wait">

        {/* TARJETA */}
        {data.metodo === "tarjeta" && (
          <motion.div key="tarjeta"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>

            {tokenLoading || !clientToken ? (
              <div className="flex items-center justify-center gap-3 py-10">
                <motion.div animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  className="rounded-full"
                  style={{ width: 20, height: 20, border: "2px solid var(--color-cq-border)", borderTopColor: "var(--color-cq-accent)" }} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)" }}>
                  Cargando formulario…
                </span>
              </div>
            ) : (
              /* El PayPalScriptProvider va AQUÍ con el clientToken */
              <PayPalScriptProvider options={{
                clientId:        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
                currency:        "MXN",
                locale:          "es_MX",
                /* hosted-fields es el componente clave */
                components:      "hosted-fields",
                dataClientToken: clientToken,
              }}>
                <CardPanel
                  totalPrecio={totalPrecio}
                  clientToken={clientToken}
                  onSuccess={(id) => onNext(id)}
                  onError={(msg) => setError(msg)}
                />
              </PayPalScriptProvider>
            )}
          </motion.div>
        )}

        {/* TRANSFERENCIA */}
        {data.metodo === "transferencia" && (
          <motion.div key="transferencia"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
            className="flex flex-col gap-4">
            <div className="rounded-xl p-5 flex flex-col gap-3"
              style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.15)" }}>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-info" style={{ fontSize: "0.8rem", color: "var(--color-cq-accent)" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem",
                  fontWeight: 700, color: "var(--color-cq-text)" }}>
                  Datos bancarios
                </span>
              </div>
              {[
                { label: "Banco",   value: "BBVA México" },
                { label: "CLABE",   value: "012 180 000000000000 1" },
                { label: "Titular", value: "CraftQube S.A. de C.V." },
                { label: "Monto",   value: formatMXN(totalPrecio) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                    letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
                    {row.label}
                  </span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem",
                    fontWeight: 600, color: "var(--color-cq-text)" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <TextareaField
              label="Notas adicionales (opcional)"
              placeholder="Referencia de comprobante, horario de contacto…"
              value={data.notas}
              onChange={(e) => onChange({ ...data, notas: e.target.value })}
            />
            <motion.button type="button" onClick={handleOffline} disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{ height: 50, borderRadius: 12, fontSize: "0.92rem", fontWeight: 700 }}>
              {loading ? <><Spinner /> Confirmando…</> : <><i className="fa-solid fa-check" /> Confirmar pedido · {formatMXN(totalPrecio)}</>}
            </motion.button>
          </motion.div>
        )}

        {/* OXXO */}
        {data.metodo === "oxxo" && (
          <motion.div key="oxxo"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
            className="flex flex-col gap-4">
            <div className="rounded-xl p-5 flex flex-col gap-3"
              style={{ background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.25)" }}>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-store" style={{ fontSize: "0.85rem", color: "#ca8a04" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem",
                  fontWeight: 700, color: "var(--color-cq-text)" }}>
                  Pago en OXXO
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem",
                color: "var(--color-cq-muted)", lineHeight: 1.55 }}>
                Al confirmar recibirás por correo una referencia válida por{" "}
                <strong style={{ color: "var(--color-cq-text)" }}>72 horas</strong>.
                Preséntala en cualquier sucursal OXXO y paga en efectivo.
              </p>
              <div className="flex items-center pt-1"
                style={{ borderTop: "1px solid rgba(234,179,8,0.15)" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem",
                  letterSpacing: "0.1em", textTransform: "uppercase", color: "#ca8a04" }}>
                  Total a pagar
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem",
                  fontWeight: 800, color: "var(--color-cq-text)", marginLeft: "auto" }}>
                  {formatMXN(totalPrecio)}
                </span>
              </div>
            </div>
            <motion.button type="button" onClick={handleOffline} disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{ height: 50, borderRadius: 12, fontSize: "0.92rem", fontWeight: 700 }}>
              {loading ? <><Spinner /> Generando referencia…</> : <><i className="fa-solid fa-barcode" /> Generar referencia OXXO</>}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Volver ── */}
      <motion.button type="button" onClick={onBack} whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 self-start"
        style={{
          fontFamily: "var(--font-body)", fontSize: "0.82rem",
          color: "var(--color-cq-muted)", background: "none",
          border: "none", cursor: "pointer", padding: 0, marginTop: -4,
        }}>
        <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} />
        Volver a envío
      </motion.button>
    </motion.div>
  );
}