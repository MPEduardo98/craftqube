// app/(main)/checkout/components/StepPago.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence }           from "framer-motion";
import {
  loadStripe,
  type Stripe as StripeInstance,
  type StripeElements,
  type StripeCardNumberElement,
} from "@stripe/stripe-js";
import { useCart }      from "@/app/global/context/CartContext";
import type { DatosPago, DatosEnvio } from "../types";
import { formatPrice } from "@/app/global/lib/format";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function Spinner({ light = false }: { light?: boolean }) {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      style={{ width: 16, height: 16, flexShrink: 0, borderRadius: "50%",
        border: `2px solid ${light ? "rgba(255,255,255,0.35)" : "var(--color-cq-border)"}`,
        borderTopColor: light ? "white" : "var(--color-cq-accent)" }} />
  );
}

function FieldLabel({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em",
      textTransform: "uppercase", color: focused ? "var(--color-cq-accent)" : "var(--color-cq-muted)", transition: "color .2s" }}>
      {children}
    </span>
  );
}

/* ── Tipos de datos de pago para la confirmación ─────────── */
export interface SpeiConfirmData {
  clabe:                 string | null;
  banco:                 string;
  referencia:            string | null;
  monto:                 number;
  hostedInstructionsUrl: string | null;
}

export interface OxxoConfirmData {
  numero:           string;
  expira:           number;
  hostedVoucherUrl: string | null;
}

export interface PaymentConfirmData {
  spei?: SpeiConfirmData;
  oxxo?: OxxoConfirmData;
}

/* ── Helper email (non-blocking) ─────────────────────────── */
async function enviarEmailConfirmacion(payload: {
  orderNumber: string;
  email:       string;
  nombre:      string;
  total:       number;
  items:       ReturnType<typeof useCart>["items"];
  envio:       DatosEnvio;
  metodo:      "tarjeta" | "transferencia" | "oxxo";
  spei?:       SpeiConfirmData;
  oxxo?:       OxxoConfirmData;
}) {
  try {
    const res = await fetch("/api/orders/send-confirmation", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      console.error("[email] Respuesta no-JSON:", res.status);
      return;
    }
    const json = await res.json();
    if (!res.ok) console.error("[email] Error:", json.error);
    else console.log("[email] ✓ Enviado");
  } catch (err) {
    console.error("[email] Fetch falló:", err);
  }
}

/* ══════════════════════════════════════════════════════════ */
/* Props                                                      */
/* ══════════════════════════════════════════════════════════ */
interface Props {
  data:           DatosPago;
  onChange:       (data: DatosPago) => void;
  /** piId + datos opcionales de SPEI/OXXO para mostrar en confirmación */
  onNext:         (stripePaymentIntentId?: string, paymentData?: PaymentConfirmData) => void;
  onBack:         () => void;
  contactoEmail:  string;
  contactoNombre: string;
  orderNumber:    string;
  envioData:      DatosEnvio;
}

type Metodo = "tarjeta" | "transferencia" | "oxxo";

const METODOS: { id: Metodo; label: string; icon: string; desc: string }[] = [
  { id: "tarjeta",       label: "Tarjeta de crédito / débito", icon: "fa-solid fa-credit-card",     desc: "Visa, Mastercard, Amex · Procesado con Stripe" },
  { id: "transferencia", label: "Transferencia SPEI",          icon: "fa-solid fa-building-columns", desc: "Pago bancario · Confirmación en 1–2 hrs" },
  { id: "oxxo",          label: "OXXO en efectivo",            icon: "fa-solid fa-store",            desc: "Paga en cualquier sucursal · Válido 72 horas" },
];

/* ══════════════════════════════════════════════════════════ */
/* Panel Tarjeta                                              */
/* ══════════════════════════════════════════════════════════ */
function PanelTarjeta({ cardName, onCardNameChange, onSuccess, onError, orderNumber, email, nombre, envioData }: {
  cardName: string; onCardNameChange: (v: string) => void;
  onSuccess: (piId: string) => void; onError: (msg: string) => void;
  orderNumber: string; email: string; nombre: string; envioData: DatosEnvio;
}) {
  const { totalPrecio, items } = useCart();
  const [stripe,   setStripe]   = useState<StripeInstance | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [cardEl,   setCardEl]   = useState<StripeCardNumberElement | null>(null);
  const [mounting, setMounting] = useState(true);
  const [paying,   setPaying]   = useState(false);
  const [focused,  setFocused]  = useState("");

  const stripeStyle = {
    base: { fontSize: "14px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#111827", "::placeholder": { color: "#9ca3af" } },
    invalid: { color: "#ef4444" },
  };

  useEffect(() => {
    let mounted = true;
    stripePromise.then((s) => {
      if (!s || !mounted) return;
      const els    = s.elements();
      const number = els.create("cardNumber", { style: stripeStyle, placeholder: "1234  5678  9012  3456" });
      const expiry = els.create("cardExpiry",  { style: stripeStyle });
      const cvc    = els.create("cardCvc",     { style: stripeStyle });
      number.mount("#stripe-number"); expiry.mount("#stripe-expiry"); cvc.mount("#stripe-cvc");
      number.on("focus", () => setFocused("number")); number.on("blur", () => setFocused(""));
      expiry.on("focus", () => setFocused("expiry")); expiry.on("blur", () => setFocused(""));
      cvc.on("focus",    () => setFocused("cvc"));    cvc.on("blur",    () => setFocused(""));
      setStripe(s); setElements(els); setCardEl(number); setMounting(false);
    });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = useCallback(async () => {
    if (!stripe || !elements || !cardEl) { onError("El formulario no está listo."); return; }
    if (!cardName.trim()) { onError("Ingresa el nombre del titular."); return; }
    setPaying(true);
    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrecio, currency: "mxn" }),
      });
      const { clientSecret, error: serverError } = await res.json();
      if (serverError) throw new Error(serverError);
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardEl, billing_details: { name: cardName } },
      });
      if (error) throw new Error(error.message ?? "Error al procesar el pago.");
      if (paymentIntent?.status === "succeeded") {
        enviarEmailConfirmacion({ orderNumber, email, nombre, total: totalPrecio, items, envio: envioData, metodo: "tarjeta" });
        onSuccess(paymentIntent.id);
      } else {
        throw new Error("El pago no fue completado.");
      }
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Error inesperado.");
    } finally { setPaying(false); }
  }, [stripe, elements, cardEl, cardName, totalPrecio, items, orderNumber, email, nombre, envioData, onSuccess, onError]);

  const fieldBox = (id: string): React.CSSProperties => ({
    display: "flex", alignItems: "center", height: 46, padding: "0 12px", borderRadius: 10,
    background: "var(--color-cq-surface-2)",
    border: `1.5px solid ${focused === id ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
    boxShadow: focused === id ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
    transition: "border-color .2s, box-shadow .2s",
  });

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence>
        {mounting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-8">
            <Spinner /><span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)" }}>Cargando formulario…</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ opacity: mounting ? 0 : 1, transition: "opacity .3s", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="flex flex-col gap-1.5">
          <FieldLabel focused={focused === "name"}>Nombre del titular</FieldLabel>
          <input value={cardName} onChange={(e) => onCardNameChange(e.target.value)}
            onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
            placeholder="Como aparece en la tarjeta"
            style={{ height: 46, padding: "0 12px", borderRadius: 10, background: "var(--color-cq-surface-2)",
              border: `1.5px solid ${focused === "name" ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
              boxShadow: focused === "name" ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
              fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-text)",
              outline: "none", width: "100%", transition: "border-color .2s, box-shadow .2s" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel focused={focused === "number"}>Número de tarjeta</FieldLabel>
          <div style={fieldBox("number")}><div id="stripe-number" style={{ width: "100%" }} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel focused={focused === "expiry"}>Vencimiento</FieldLabel>
            <div style={fieldBox("expiry")}><div id="stripe-expiry" style={{ width: "100%" }} /></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel focused={focused === "cvc"}>CVC</FieldLabel>
            <div style={fieldBox("cvc")}><div id="stripe-cvc" style={{ width: "100%" }} /></div>
          </div>
        </div>
      </div>
      <motion.button type="button" onClick={handlePay} disabled={paying || mounting} whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2.5 w-full rounded-xl"
        style={{ height: 52, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem",
          background: "var(--color-cq-accent)", color: "white", border: "none",
          cursor: paying || mounting ? "not-allowed" : "pointer", opacity: paying || mounting ? 0.65 : 1 }}>
        {paying ? <><Spinner light /> Procesando…</> : <><i className="fa-solid fa-lock" style={{ fontSize: "0.8rem" }} /> Pagar {formatPrice(totalPrecio)}</>}
      </motion.button>
      <div className="flex items-center justify-center gap-2">
        <i className="fa-solid fa-shield-halved" style={{ fontSize: "0.7rem", color: "var(--color-cq-muted-2)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted-2)" }}>
          Cifrado SSL 256-bit · Procesado por Stripe
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* Panel OXXO                                                 */
/* Al generar el voucher → navega directamente a confirmación */
/* ══════════════════════════════════════════════════════════ */
function PanelOxxo({ email, nombre, onSuccess, onError, orderNumber, envioData }: {
  email: string; nombre: string;
  onSuccess: (piId: string, data: OxxoConfirmData) => void;
  onError: (msg: string) => void;
  orderNumber: string; envioData: DatosEnvio;
}) {
  const { totalPrecio, items } = useCart();
  const [loading, setLoading] = useState(false);

  const generarVoucher = async () => {
    if (!email) { onError("Necesitamos tu email para generar el voucher OXXO."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/create-oxxo-payment", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrecio, email, nombre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar voucher.");

      const oxxoData: OxxoConfirmData = {
        numero:           data.numero,
        expira:           data.expira,
        hostedVoucherUrl: data.hostedVoucherUrl,
      };

      // Email (non-blocking)
      enviarEmailConfirmacion({ orderNumber, email, nombre, total: totalPrecio, items, envio: envioData, metodo: "oxxo", oxxo: oxxoData });

      // Ir a confirmación inmediatamente con los datos
      onSuccess(data.paymentIntentId, oxxoData);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Error inesperado.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-xl p-4"
        style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)" }}>
        <i className="fa-solid fa-circle-info" style={{ color: "var(--color-cq-accent)", fontSize: "0.9rem", marginTop: 2 }} />
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)", lineHeight: 1.7 }}>
          <p>Generaremos un <strong style={{ color: "var(--color-cq-text)" }}>código de barras único</strong> para pagar en cualquier tienda OXXO.</p>
          <p style={{ marginTop: 6 }}>El voucher es válido por <strong style={{ color: "var(--color-cq-text)" }}>72 horas</strong>. El pedido se confirmará automáticamente al recibir el pago.</p>
        </div>
      </div>
      <motion.button type="button" onClick={generarVoucher} disabled={loading} whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2.5 w-full rounded-xl"
        style={{ height: 52, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem",
          background: "var(--color-cq-accent)", color: "white", border: "none",
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1 }}>
        {loading
          ? <><Spinner light /> Generando código…</>
          : <><i className="fa-solid fa-barcode" /> Generar código OXXO</>}
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* Panel SPEI                                                 */
/* Al generar la CLABE → navega directamente a confirmación  */
/* ══════════════════════════════════════════════════════════ */
function PanelSpei({ email, nombre, onSuccess, onError, orderNumber, envioData }: {
  email: string; nombre: string;
  onSuccess: (piId: string, data: SpeiConfirmData) => void;
  onError: (msg: string) => void;
  orderNumber: string; envioData: DatosEnvio;
}) {
  const { totalPrecio, items } = useCart();
  const [loading, setLoading] = useState(false);

  const generarClabe = async () => {
    if (!email) { onError("Necesitamos tu email para generar la CLABE SPEI."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/create-spei-payment", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrecio, email, nombre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar datos SPEI.");

      const speiData: SpeiConfirmData = {
        clabe:                 data.clabe,
        banco:                 data.banco,
        referencia:            data.referencia,
        monto:                 data.monto,
        hostedInstructionsUrl: data.hostedInstructionsUrl,
      };

      // Email (non-blocking)
      enviarEmailConfirmacion({ orderNumber, email, nombre, total: totalPrecio, items, envio: envioData, metodo: "transferencia", spei: speiData });

      // Ir a confirmación inmediatamente con los datos
      onSuccess(data.paymentIntentId, speiData);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : "Error inesperado.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-xl p-4"
        style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)" }}>
        <i className="fa-solid fa-circle-info" style={{ color: "var(--color-cq-accent)", fontSize: "0.9rem", marginTop: 2 }} />
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)", lineHeight: 1.7 }}>
          <p>Generaremos una <strong style={{ color: "var(--color-cq-text)" }}>CLABE única</strong> para que realices tu transferencia SPEI desde cualquier banco.</p>
          <p style={{ marginTop: 6 }}>El pedido se confirmará <strong style={{ color: "var(--color-cq-text)" }}>automáticamente</strong> al recibir el pago.</p>
        </div>
      </div>
      <motion.button type="button" onClick={generarClabe} disabled={loading} whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2.5 w-full rounded-xl"
        style={{ height: 52, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem",
          background: "var(--color-cq-accent)", color: "white", border: "none",
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1 }}>
        {loading
          ? <><Spinner light /> Generando CLABE…</>
          : <><i className="fa-solid fa-building-columns" style={{ fontSize: "0.9rem" }} /> Obtener datos de transferencia</>}
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* StepPago                                                   */
/* ══════════════════════════════════════════════════════════ */
export function StepPago({ data, onChange, onNext, onBack, contactoEmail, contactoNombre, orderNumber, envioData }: Props) {
  const [error,    setError]    = useState<string | null>(null);
  const [cardName, setCardName] = useState(data.nombreTarjeta ?? "");

  const setMetodo = (metodo: Metodo) => { onChange({ ...data, metodo }); setError(null); };

  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col gap-6">

      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center rounded-xl mt-0.5"
          style={{ width: 36, height: 36, background: "rgba(37,99,235,0.08)", flexShrink: 0 }}>
          <i className="fa-solid fa-lock" style={{ fontSize: "0.9rem", color: "var(--color-cq-accent)" }} />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "-0.01em" }}>
            Método de pago
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", marginTop: 3 }}>
            Tus datos están protegidos con cifrado SSL.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#dc2626", lineHeight: 1.55 }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector de método */}
      <div className="flex flex-col gap-2.5">
        {METODOS.map(({ id, label, icon, desc }) => {
          const active = data.metodo === id;
          return (
            <motion.button key={id} type="button" onClick={() => setMetodo(id)} whileTap={{ scale: 0.99 }}
              className="flex items-center gap-4 rounded-xl px-4 py-3.5 w-full text-left"
              style={{ background: active ? "rgba(37,99,235,0.04)" : "var(--color-cq-surface)",
                border: `1.5px solid ${active ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
                cursor: "pointer", transition: "all .2s" }}>
              <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ width: 36, height: 36, background: active ? "rgba(37,99,235,0.1)" : "var(--color-cq-surface-2)" }}>
                <i className={icon} style={{ fontSize: "0.95rem", color: active ? "var(--color-cq-accent)" : "var(--color-cq-muted)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 600,
                  color: active ? "var(--color-cq-text)" : "var(--color-cq-muted)", margin: 0 }}>{label}</p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.78rem", color: "var(--color-cq-muted-2)", margin: 0, marginTop: 2 }}>{desc}</p>
              </div>
              <div className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 18, height: 18, border: `2px solid ${active ? "var(--color-cq-accent)" : "var(--color-cq-border)"}` }}>
                {active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-cq-accent)" }} />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Panel activo */}
      <AnimatePresence mode="wait">
        {data.metodo === "tarjeta" && (
          <motion.div key="tarjeta" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
            className="rounded-xl p-5" style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
            <PanelTarjeta
              cardName={cardName}
              onCardNameChange={(v) => { setCardName(v); onChange({ ...data, nombreTarjeta: v }); }}
              onSuccess={(piId) => onNext(piId)}
              onError={(msg) => setError(msg)}
              orderNumber={orderNumber} email={contactoEmail} nombre={contactoNombre} envioData={envioData}
            />
          </motion.div>
        )}
        {data.metodo === "transferencia" && (
          <motion.div key="transferencia" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
            className="rounded-xl p-5" style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
            <PanelSpei
              email={contactoEmail} nombre={contactoNombre}
              onSuccess={(piId, spei) => onNext(piId, { spei })}
              onError={(msg) => setError(msg)}
              orderNumber={orderNumber} envioData={envioData}
            />
          </motion.div>
        )}
        {data.metodo === "oxxo" && (
          <motion.div key="oxxo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
            className="rounded-xl p-5" style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
            <PanelOxxo
              email={contactoEmail} nombre={contactoNombre}
              onSuccess={(piId, oxxo) => onNext(piId, { oxxo })}
              onError={(msg) => setError(msg)}
              orderNumber={orderNumber} envioData={envioData}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button type="button" onClick={onBack} whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 self-start"
        style={{ background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", padding: 0 }}>
        <i className="fa-solid fa-chevron-left" style={{ fontSize: "0.7rem" }} />
        Volver a envío
      </motion.button>
    </motion.div>
  );
}