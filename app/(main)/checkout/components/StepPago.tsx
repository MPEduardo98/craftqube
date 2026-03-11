// app/(main)/checkout/components/StepPago.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence }                   from "framer-motion";
import Script                                        from "next/script";
import { useCart }                                   from "@/app/global/context/CartContext";
import type { DatosPago }                            from "../types";

/* ── tipos del SDK vanilla de PayPal ─────────────────────── */
declare global {
  interface Window {
    paypal?: {
      HostedFields: {
        isEligible: () => boolean;
        render: (opts: {
          createOrder: () => Promise<string>;
          styles:      Record<string, unknown>;
          fields: {
            number:         { selector: string; placeholder?: string };
            expirationDate: { selector: string; placeholder?: string };
            cvv:            { selector: string; placeholder?: string };
          };
        }) => Promise<{
          submit: (data: { cardholderName: string; billingAddress: { countryCode: string } }) => Promise<{ orderId: string }>;
          teardown: (cb?: () => void) => void;
        }>;
      };
    };
  }
}

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

/* ── Spinner ─────────────────────────────────────────────── */
function Spinner() {
  return (
    <motion.div animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      style={{ width: 16, height: 16, flexShrink: 0, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white" }} />
  );
}

/* ── Textarea ────────────────────────────────────────────── */
function TextareaField({ label, value, onChange, placeholder }: {
  label: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  const [f, setF] = useState(false);
  return (
    <div>
      <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", letterSpacing: "0.08em",
        textTransform: "uppercase", color: "var(--color-cq-muted)", fontWeight: 500,
        display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <textarea rows={2} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setF(true)} onBlur={() => setF(false)} className="w-full resize-none"
        style={{ background: "var(--color-cq-surface-2)", borderRadius: 10, padding: "10px 14px",
          border: `1.5px solid ${f ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
          boxShadow: f ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
          fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-text)",
          outline: "none", transition: "border-color .2s, box-shadow .2s" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CardPanel — carga el SDK vanilla y renderiza Hosted Fields
   ══════════════════════════════════════════════════════════ */
function CardPanel({ total, onSuccess, onError }: {
  total:     number;
  onSuccess: (id: string) => void;
  onError:   (msg: string) => void;
}) {
  const hostedFieldsRef = useRef<Awaited<ReturnType<typeof window.paypal.HostedFields.render>> | null>(null);
  const [cardName,    setCardName]    = useState("");
  const [sdkReady,    setSdkReady]    = useState(false);
  const [hfReady,     setHfReady]     = useState(false);
  const [hfLoading,   setHfLoading]   = useState(false);
  const [payLoading,  setPayLoading]  = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  /* Inicializar Hosted Fields cuando el SDK está listo y el DOM montado */
  const initHostedFields = useCallback(async () => {
    if (!window.paypal?.HostedFields) return;
    if (!window.paypal.HostedFields.isEligible()) {
      onError("Pagos con tarjeta no disponibles en este momento."); return;
    }
    if (hostedFieldsRef.current) return; // ya inicializado

    setHfLoading(true);
    try {
      const hf = await window.paypal.HostedFields.render({
        createOrder: async () => {
          const res  = await fetch("/api/paypal/create-order", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ amount: total, currency: "MXN" }),
          });
          const { id } = await res.json();
          return id as string;
        },
        styles: {
          input: {
            "font-size":    "14px",
            "font-family":  "system-ui, -apple-system, sans-serif",
            color:          "#111827",
          },
          ":focus":    { color: "#111827" },
          ".invalid":  { color: "#ef4444" },
          ".valid":    { color: "#111827" },
        },
        fields: {
          number:         { selector: "#pp-number",  placeholder: "1234  5678  9012  3456" },
          expirationDate: { selector: "#pp-expiry",  placeholder: "MM / AA" },
          cvv:            { selector: "#pp-cvv",     placeholder: "123" },
        },
      });
      hostedFieldsRef.current = hf;
      setHfReady(true);
    } catch (err) {
      console.error("[HF] render error:", err);
      onError("No se pudo cargar el formulario de pago. Recarga la página.");
    } finally {
      setHfLoading(false);
    }
  }, [total, onError]);

  /* Teardown al desmontar */
  useEffect(() => {
    return () => {
      hostedFieldsRef.current?.teardown();
      hostedFieldsRef.current = null;
    };
  }, []);

  /* Cuando sdkReady cambia a true, inicializar */
  useEffect(() => {
    if (sdkReady) initHostedFields();
  }, [sdkReady, initHostedFields]);

  /* Si el SDK ya estaba cargado (segunda vez que se monta el panel) */
  useEffect(() => {
    if (window.paypal?.HostedFields) setSdkReady(true);
  }, []);

  const handlePay = async () => {
    if (!hostedFieldsRef.current) { onError("El formulario de pago no está listo."); return; }
    if (!cardName.trim())          { onError("Ingresa el nombre del titular.");       return; }

    setPayLoading(true);
    try {
      const { orderId } = await hostedFieldsRef.current.submit({
        cardholderName: cardName,
        billingAddress: { countryCode: "MX" },
      });

      const res    = await fetch("/api/paypal/capture-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderID: orderId }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error ?? "Error al capturar el pago");
      onSuccess(result.orderID);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Error inesperado. Intenta de nuevo.");
    } finally {
      setPayLoading(false);
    }
  };

  /* Estilos del contenedor del hosted field */
  const fieldBox = (id: string): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8,
    height: 46, padding: "0 12px", borderRadius: 10,
    background:  "var(--color-cq-surface-2)",
    border:      `1.5px solid ${focusedField === id ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
    boxShadow:   focusedField === id ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
    transition:  "border-color .2s, box-shadow .2s",
  });

  const labelColor = (id: string) =>
    focusedField === id ? "var(--color-cq-accent)" : "var(--color-cq-muted)";

  return (
    <>
      {/* SDK de PayPal — se carga una sola vez */}
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=MXN&locale=es_MX&components=hosted-fields`}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => onError("No se pudo cargar el SDK de PayPal.")}
      />

      <div className="flex flex-col gap-4">

        {/* Loader mientras inicializa */}
        {(hfLoading || (!hfReady && !sdkReady)) && (
          <div className="flex items-center justify-center gap-3 py-8">
            <motion.div animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              style={{ width: 20, height: 20, borderRadius: "50%",
                border: "2px solid var(--color-cq-border)", borderTopColor: "var(--color-cq-accent)" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)" }}>
              Cargando formulario de pago…
            </span>
          </div>
        )}

        {/* Formulario — siempre en DOM para que PayPal encuentre los selectors */}
        <div style={{ display: hfLoading ? "none" : "flex", flexDirection: "column", gap: 16 }}>

          {/* Número */}
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", letterSpacing: "0.08em",
              textTransform: "uppercase", color: labelColor("number"), fontWeight: 500,
              display: "block", marginBottom: 6, transition: "color .2s" }}>
              Número de tarjeta <span style={{ color: "var(--color-cq-accent)" }}>*</span>
            </label>
            <div style={fieldBox("number")}>
              <i className="fa-solid fa-credit-card" style={{
                fontSize: "0.8rem", flexShrink: 0, transition: "color .2s",
                color: focusedField === "number" ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
              }} />
              {/* El SDK inyecta el iframe aquí */}
              <div id="pp-number" style={{ flex: 1, height: 24 }}
                onFocus={() => setFocusedField("number")}
                onBlur={() => setFocusedField(null)} />
              <div className="flex items-center gap-1 shrink-0">
                <i className="fa-brands fa-cc-visa"       style={{ fontSize: "1.1rem", color: "#1a1f71" }} />
                <i className="fa-brands fa-cc-mastercard" style={{ fontSize: "1.1rem", color: "#eb001b" }} />
                <i className="fa-brands fa-cc-amex"       style={{ fontSize: "1.1rem", color: "#007bc1" }} />
              </div>
            </div>
          </div>

          {/* Titular */}
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", letterSpacing: "0.08em",
              textTransform: "uppercase", color: labelColor("name"), fontWeight: 500,
              display: "block", marginBottom: 6, transition: "color .2s" }}>
              Nombre del titular <span style={{ color: "var(--color-cq-accent)" }}>*</span>
            </label>
            <div style={{ ...fieldBox("name"), borderColor: focusedField === "name" ? "var(--color-cq-accent)" : "var(--color-cq-border)" }}>
              <i className="fa-solid fa-user" style={{
                fontSize: "0.8rem", flexShrink: 0, transition: "color .2s",
                color: focusedField === "name" ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
              }} />
              <input type="text" value={cardName} placeholder="Como aparece en la tarjeta"
                onChange={(e) => setCardName(e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                  fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-text)" }} />
            </div>
          </div>

          {/* Expiración + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", letterSpacing: "0.08em",
                textTransform: "uppercase", color: labelColor("expiry"), fontWeight: 500,
                display: "block", marginBottom: 6, transition: "color .2s" }}>
                Expiración <span style={{ color: "var(--color-cq-accent)" }}>*</span>
              </label>
              <div style={fieldBox("expiry")}>
                <i className="fa-solid fa-calendar-days" style={{
                  fontSize: "0.8rem", flexShrink: 0, transition: "color .2s",
                  color: focusedField === "expiry" ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
                }} />
                <div id="pp-expiry" style={{ flex: 1, height: 24 }}
                  onFocus={() => setFocusedField("expiry")}
                  onBlur={() => setFocusedField(null)} />
              </div>
            </div>

            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", letterSpacing: "0.08em",
                textTransform: "uppercase", color: labelColor("cvv"), fontWeight: 500,
                display: "block", marginBottom: 6, transition: "color .2s" }}>
                CVV <span style={{ color: "var(--color-cq-accent)" }}>*</span>
              </label>
              <div style={fieldBox("cvv")}>
                <i className="fa-solid fa-lock" style={{
                  fontSize: "0.8rem", flexShrink: 0, transition: "color .2s",
                  color: focusedField === "cvv" ? "var(--color-cq-accent)" : "var(--color-cq-muted-2)",
                }} />
                <div id="pp-cvv" style={{ flex: 1, height: 24 }}
                  onFocus={() => setFocusedField("cvv")}
                  onBlur={() => setFocusedField(null)} />
              </div>
            </div>
          </div>

          {/* Botón */}
          <motion.button type="button" onClick={handlePay}
            disabled={payLoading || !hfReady}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ height: 50, borderRadius: 12, fontSize: "0.92rem", fontWeight: 700,
              opacity: hfReady ? 1 : 0.6, transition: "opacity .2s" }}>
            {payLoading
              ? <><Spinner /> Procesando pago…</>
              : <><i className="fa-solid fa-lock" style={{ fontSize: "0.8rem" }} /> Pagar {formatMXN(total)}</>
            }
          </motion.button>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-2"
            style={{ color: "var(--color-cq-muted-2)" }}>
            <i className="fa-solid fa-shield-halved" style={{ fontSize: "0.7rem" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem",
              letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Cifrado SSL 256-bit · Procesado por PayPal
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════ */
export function StepPago({ data, onChange, onNext, onBack }: Props) {
  const { totalPrecio } = useCart();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const setMetodo = (metodo: Metodo) => { onChange({ ...data, metodo }); setError(null); };

  const handleOffline = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    onNext(undefined);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col gap-6">

      {/* Título */}
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

      {/* Selector de método */}
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
                cursor: "pointer", outline: "none", transition: "border-color .2s, background .2s",
              }}>
              <div className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 18, height: 18,
                  border:     `2px solid ${active ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
                  background: active ? "var(--color-cq-accent)" : "transparent", transition: "all .2s" }}>
                {active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />
                )}
              </div>
              <div className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 34, height: 34,
                  background: active ? "var(--color-cq-accent)" : "var(--color-cq-border)",
                  transition: "background .2s" }}>
                <i className={m.icon} style={{ fontSize: "0.85rem", color: active ? "white" : "var(--color-cq-muted)" }} />
              </div>
              <div className="flex flex-col min-w-0">
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem",
                  fontWeight: 700, color: "var(--color-cq-text)" }}>{m.label}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem",
                  color: "var(--color-cq-muted)", lineHeight: 1.4 }}>{m.desc}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "0.8rem", color: "#ef4444", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "#ef4444" }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TARJETA ─ siempre montado en DOM pero ocultado si no está activo */}
      {/* CardPanel se monta una vez y permanece en el DOM para que los iframes de PayPal sean estables */}
      <div style={{ display: data.metodo === "tarjeta" ? "block" : "none" }}>
        <CardPanel
          total={totalPrecio}
          onSuccess={(id) => onNext(id)}
          onError={(msg) => setError(msg)}
        />
      </div>

      {/* ── TRANSFERENCIA */}
      {data.metodo === "transferencia" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }} className="flex flex-col gap-4">
          <div className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.15)" }}>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle-info" style={{ fontSize: "0.8rem", color: "var(--color-cq-accent)" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem",
                fontWeight: 700, color: "var(--color-cq-text)" }}>Datos bancarios</span>
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
                  fontWeight: 600, color: "var(--color-cq-text)" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <TextareaField label="Notas adicionales (opcional)"
            placeholder="Referencia de comprobante, horario de contacto…"
            value={data.notas}
            onChange={(e) => onChange({ ...data, notas: e.target.value })} />
          <motion.button type="button" onClick={handleOffline} disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full flex items-center justify-center gap-2"
            style={{ height: 50, borderRadius: 12, fontSize: "0.92rem", fontWeight: 700 }}>
            {loading ? <><Spinner /> Confirmando…</> : <><i className="fa-solid fa-check" /> Confirmar pedido · {formatMXN(totalPrecio)}</>}
          </motion.button>
        </motion.div>
      )}

      {/* ── OXXO */}
      {data.metodo === "oxxo" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }} className="flex flex-col gap-4">
          <div className="rounded-xl p-5 flex flex-col gap-3"
            style={{ background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.25)" }}>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-store" style={{ fontSize: "0.85rem", color: "#ca8a04" }} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem",
                fontWeight: 700, color: "var(--color-cq-text)" }}>Pago en OXXO</span>
            </div>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem",
              color: "var(--color-cq-muted)", lineHeight: 1.55 }}>
              Al confirmar recibirás por correo una referencia válida por{" "}
              <strong style={{ color: "var(--color-cq-text)" }}>72 horas</strong>.
              Preséntala en cualquier sucursal OXXO y paga en efectivo.
            </p>
            <div className="flex items-center pt-1" style={{ borderTop: "1px solid rgba(234,179,8,0.15)" }}>
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

      {/* Volver */}
      <motion.button type="button" onClick={onBack} whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 self-start"
        style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem",
          color: "var(--color-cq-muted)", background: "none",
          border: "none", cursor: "pointer", padding: 0, marginTop: -4 }}>
        <i className="fa-solid fa-arrow-left" style={{ fontSize: "0.75rem" }} />
        Volver a envío
      </motion.button>
    </motion.div>
  );
}