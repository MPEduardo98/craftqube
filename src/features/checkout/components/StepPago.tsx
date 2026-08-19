// features/checkout/components/StepPago.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import {
  loadStripe,
  type Stripe as StripeInstance,
  type StripeElements,
  type StripeCardNumberElement,
} from "@stripe/stripe-js";
import { useCart }        from "@/features/cart/context/CartContext";
import type { DatosPago, DatosEnvio, DatosContacto } from "../types";
import { formatMoneda }   from "@/shared/lib/format";

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

/** Lo que el checkout necesita saber cuando el pago sale bien. */
export interface ResultadoPago {
  pedidoId:        number;
  /** Número REAL de la BD (CQ-2026-000042), no uno inventado en el cliente. */
  numero:          string;
  total:           number;
  moneda:          string;
  paymentIntentId: string | null;
  paymentData:     PaymentConfirmData | null;
}

/** Respuesta de /api/checkout/pagar */
interface RespuestaPago {
  success:      boolean;
  error?:       string;
  pedido?:      { id: number; numero: string; total: number; moneda: string };
  metodo?:      Metodo;
  clientSecret?: string;
  oxxo?:        OxxoConfirmData;
  spei?:        SpeiConfirmData;
}

/* ── Helper email (non-blocking) ─────────────────────────── */
async function enviarEmailConfirmacion(payload: {
  orderNumber: string;
  nombre:      string;
  items:       ReturnType<typeof useCart>["items"];
  envio:       DatosEnvio;
  metodo:      Metodo;
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
  } catch (err) {
    console.error("[email] Fetch falló:", err);
  }
}

/* ══════════════════════════════════════════════════════════ */
/* Props                                                      */
/* ══════════════════════════════════════════════════════════ */
type Metodo = "tarjeta" | "transferencia" | "oxxo";

interface Props {
  data:      DatosPago;
  onChange:  (data: DatosPago) => void;
  onNext:    (resultado: ResultadoPago) => void;
  onBack:    () => void;
  contacto:  DatosContacto;
  envioData: DatosEnvio;
  /** Total autoritativo del servidor. null mientras se calcula. */
  totalServidor: number | null;
  moneda:        string;
  /**
   * Importe mínimo que la pasarela acepta cobrar. Por debajo de él no
   * se ofrece ningún método: Stripe devolvería `amount_too_small`.
   */
  montoMinimo?:  number | null;
  /**
   * Cupón aplicado y confirmado por el servidor. El campo para
   * escribirlo vive en la columna del resumen (`CuponCard`); aquí
   * sólo se reenvía al cobro.
   */
  cuponCodigo?:   string | null;
}

const METODOS: { id: Metodo; label: string; icon: string; desc: string }[] = [
  { id: "tarjeta",       label: "Tarjeta de crédito / débito", icon: "fa-solid fa-credit-card",     desc: "Visa, Mastercard, Amex · Procesado con Stripe" },
  { id: "transferencia", label: "Transferencia SPEI",          icon: "fa-solid fa-building-columns", desc: "Pago bancario · Confirmación en 1–2 hrs" },
  { id: "oxxo",          label: "OXXO en efectivo",            icon: "fa-solid fa-store",            desc: "Paga en cualquier sucursal · Válido 72 horas" },
];

/* ══════════════════════════════════════════════════════════ */
/* Panel Tarjeta                                              */
/* ══════════════════════════════════════════════════════════ */
function PanelTarjeta({ cardName, onCardNameChange, onIniciarPago, onCompletado, onError, total, moneda, deshabilitado }: {
  cardName: string;
  onCardNameChange: (v: string) => void;
  /** Crea pedido + PaymentIntent en el servidor y devuelve el clientSecret. */
  onIniciarPago: () => Promise<RespuestaPago>;
  /** El cobro quedó aceptado por Stripe. */
  onCompletado: (respuesta: RespuestaPago, paymentIntentId: string) => void;
  onError: (msg: string) => void;
  total: number | null;
  moneda: string;
  deshabilitado: boolean;
}) {
  const [stripe,   setStripe]   = useState<StripeInstance | null>(null);
  const [cardEl,   setCardEl]   = useState<StripeCardNumberElement | null>(null);
  const [mounting, setMounting] = useState(true);
  const [paying,   setPaying]   = useState(false);
  const [focused,  setFocused]  = useState("");

  useEffect(() => {
    let vivo = true;
    // Se guardan para destruirlos al desmontar: sin esto, cambiar de
    // método de pago dejaba los iframes de Stripe huérfanos y al volver
    // se creaba un juego nuevo sobre contenedores ya recreados.
    let creados: { destroy: () => void }[] = [];
    let elements: StripeElements | null = null;

    const estilo = {
      base: {
        fontSize: "14px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#111827",
        "::placeholder": { color: "#9ca3af" },
      },
      invalid: { color: "#ef4444" },
    };

    stripePromise
      .then((s) => {
        if (!s || !vivo) return;
        elements = s.elements();
        const number = elements.create("cardNumber", { style: estilo, placeholder: "1234  5678  9012  3456" });
        const expiry = elements.create("cardExpiry", { style: estilo });
        const cvc    = elements.create("cardCvc",    { style: estilo });
        creados = [number, expiry, cvc];

        // Comprobación final: el desmontaje puede haber ocurrido
        // mientras se resolvía la promesa de Stripe.
        if (!vivo) { creados.forEach((e) => e.destroy()); return; }

        number.mount("#stripe-number");
        expiry.mount("#stripe-expiry");
        cvc.mount("#stripe-cvc");

        number.on("focus", () => setFocused("number")); number.on("blur", () => setFocused(""));
        expiry.on("focus", () => setFocused("expiry")); expiry.on("blur", () => setFocused(""));
        cvc.on("focus",    () => setFocused("cvc"));    cvc.on("blur",    () => setFocused(""));

        setStripe(s);
        setCardEl(number);
        setMounting(false);
      })
      .catch((err) => {
        console.error("[stripe] No se pudo cargar el formulario:", err);
        if (vivo) {
          setMounting(false);
          onError("No se pudo cargar el formulario de pago. Recarga la página.");
        }
      });

    return () => {
      vivo = false;
      creados.forEach((el) => {
        try { el.destroy(); } catch { /* ya destruido */ }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = useCallback(async () => {
    if (!stripe || !cardEl) { onError("El formulario no está listo."); return; }
    if (!cardName.trim())   { onError("Ingresa el nombre del titular."); return; }

    setPaying(true);
    try {
      // 1. El servidor crea el pedido y el PaymentIntent por el importe real.
      const respuesta = await onIniciarPago();
      if (!respuesta.clientSecret) throw new Error("Respuesta de pago incompleta.");

      // 2. La tarjeta se confirma en el navegador: los datos nunca
      //    pasan por nuestro servidor. 3D Secure se resuelve en modal.
      const { paymentIntent, error } = await stripe.confirmCardPayment(respuesta.clientSecret, {
        payment_method: { card: cardEl, billing_details: { name: cardName.trim() } },
      });

      if (error) throw new Error(error.message ?? "No se pudo procesar el pago.");
      if (paymentIntent?.status !== "succeeded") throw new Error("El pago no se completó.");

      onCompletado(respuesta, paymentIntent.id);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setPaying(false);
    }
  }, [stripe, cardEl, cardName, onIniciarPago, onCompletado, onError]);

  const fieldBox = (id: string): React.CSSProperties => ({
    display: "flex", alignItems: "center", height: 46, padding: "0 12px", borderRadius: 10,
    background: "var(--color-cq-surface-2)",
    border: `1.5px solid ${focused === id ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
    boxShadow: focused === id ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
    transition: "border-color .2s, box-shadow .2s",
  });

  const bloqueado = paying || mounting || deshabilitado;

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
      <motion.button type="button" onClick={handlePay} disabled={bloqueado} whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2.5 w-full rounded-xl"
        style={{ height: 52, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem",
          background: "var(--color-cq-accent)", color: "white", border: "none",
          cursor: bloqueado ? "not-allowed" : "pointer", opacity: bloqueado ? 0.65 : 1 }}>
        {paying
          ? <><Spinner light /> Procesando…</>
          : <><i className="fa-solid fa-lock" style={{ fontSize: "0.8rem" }} /> Pagar {total !== null ? formatMoneda(total, moneda) : "…"}</>}
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
/* Paneles OXXO / SPEI (sólo disparan el pago)                */
/* ══════════════════════════════════════════════════════════ */
function PanelInstruccion({ icono, titulo, cuerpo, boton, iconoBoton, onClick, loading, deshabilitado }: {
  icono: string; titulo: React.ReactNode; cuerpo: React.ReactNode;
  boton: string; iconoBoton: string;
  onClick: () => void; loading: boolean; deshabilitado: boolean;
}) {
  const bloqueado = loading || deshabilitado;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-xl p-4"
        style={{ background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)" }}>
        <i className={icono} style={{ color: "var(--color-cq-accent)", fontSize: "0.9rem", marginTop: 2 }} />
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--color-cq-muted)", lineHeight: 1.7 }}>
          <p>{titulo}</p>
          <p style={{ marginTop: 6 }}>{cuerpo}</p>
        </div>
      </div>
      <motion.button type="button" onClick={onClick} disabled={bloqueado} whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2.5 w-full rounded-xl"
        style={{ height: 52, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem",
          background: "var(--color-cq-accent)", color: "white", border: "none",
          cursor: bloqueado ? "not-allowed" : "pointer", opacity: bloqueado ? 0.65 : 1 }}>
        {loading
          ? <><Spinner light /> Generando…</>
          : <><i className={iconoBoton} /> {boton}</>}
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/* StepPago                                                   */
/* ══════════════════════════════════════════════════════════ */
export function StepPago({
  data, onChange, onNext, onBack,
  contacto, envioData, totalServidor, moneda, montoMinimo = null, cuponCodigo,
}: Props) {
  const { items } = useCart();
  const [error,    setError]    = useState<string | null>(null);
  const [cardName, setCardName] = useState(data.nombreTarjeta ?? "");
  const [cargando, setCargando] = useState(false);

  /**
   * Pedido ya creado en un intento previo. Al reintentar (tarjeta
   * rechazada, por ejemplo) se reutiliza en vez de crear un pedido
   * nuevo por cada clic.
   */
  const pedidoEnCurso = useRef<number | null>(null);

  const setMetodo = (metodo: Metodo) => {
    onChange({ ...data, metodo });
    setError(null);
    // El pedido se conserva a propósito: el servidor lo reaprovecha y
    // sustituye su PaymentIntent, en vez de dejar pedidos huérfanos
    // reteniendo stock cada vez que el comprador cambia de opinión.
  };

  /**
   * Volver a envío puede cambiar la dirección y, con ella, el costo de
   * envío: el pedido en curso deja de ser válido y hay que crear otro.
   */
  const volver = () => {
    pedidoEnCurso.current = null;
    onBack();
  };

  /** Llama al servidor, que crea pedido + PaymentIntent en una operación. */
  const iniciarPago = useCallback(async (metodo: Metodo): Promise<RespuestaPago> => {
    const res = await fetch("/api/checkout/pagar", {
      method:      "POST",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        metodo,
        pedidoId: pedidoEnCurso.current ?? undefined,
        contacto: {
          nombre:   contacto.nombre,
          apellido: contacto.apellido,
          email:    contacto.email,
          telefono: contacto.telefono,
        },
        envio: envioData,
        // Sólo qué y cuánto: los precios los pone el servidor.
        items: items.map((i) => ({ variante_id: i.varianteId, cantidad: i.cantidad })),
        cupon_codigo: cuponCodigo || undefined,
        notas:        data.notas || undefined,
      }),
    });

    const json: RespuestaPago = await res.json();
    if (!res.ok || !json.success || !json.pedido) {
      throw new Error(json.error ?? "No pudimos iniciar el pago.");
    }
    pedidoEnCurso.current = json.pedido.id;
    return json;
  }, [contacto, envioData, items, cuponCodigo, data.notas]);

  /** Camino común tras un pago aceptado: correo + avanzar a confirmación. */
  const finalizar = useCallback((
    respuesta: RespuestaPago,
    paymentIntentId: string | null,
    paymentData: PaymentConfirmData | null
  ) => {
    const pedido = respuesta.pedido!;

    // Correo con el número REAL del pedido (el mismo que ve el admin).
    enviarEmailConfirmacion({
      orderNumber: pedido.numero,
      nombre:      `${contacto.nombre} ${contacto.apellido}`.trim(),
      items,
      envio:       envioData,
      metodo:      data.metodo,
      spei:        paymentData?.spei,
      oxxo:        paymentData?.oxxo,
    });

    onNext({
      pedidoId: pedido.id,
      numero:   pedido.numero,
      total:    pedido.total,
      moneda:   pedido.moneda,
      paymentIntentId,
      paymentData,
    });
  }, [contacto, items, envioData, data.metodo, onNext]);

  /* ── Tarjeta ── */
  const iniciarPagoTarjeta = useCallback(() => {
    setError(null);
    return iniciarPago("tarjeta");
  }, [iniciarPago]);

  const tarjetaCompletada = useCallback((respuesta: RespuestaPago, piId: string) => {
    finalizar(respuesta, piId, null);
  }, [finalizar]);

  /* ── OXXO / SPEI ── */
  const pagarAsincrono = useCallback(async (metodo: "oxxo" | "transferencia") => {
    setError(null);
    setCargando(true);
    try {
      const respuesta = await iniciarPago(metodo);
      const paymentData: PaymentConfirmData =
        metodo === "oxxo" ? { oxxo: respuesta.oxxo } : { spei: respuesta.spei };

      if (metodo === "oxxo" && !respuesta.oxxo) throw new Error("No se pudo generar el voucher OXXO.");
      if (metodo === "transferencia" && !respuesta.spei) throw new Error("No se pudo generar la CLABE.");

      finalizar(respuesta, null, paymentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setCargando(false);
    }
  }, [iniciarPago, finalizar]);

  /* Stripe no cobra por debajo del mínimo de la moneda. Se bloquean los
     métodos y se explica por qué, en vez de dejar que el botón dispare
     una petición que el servidor va a rechazar. */
  const bajoMinimo = totalServidor !== null && montoMinimo !== null && totalServidor < montoMinimo;
  const totalListo = totalServidor !== null && totalServidor > 0 && !bajoMinimo;

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

      {bajoMinimo && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.22)" }}>
          <i className="fa-solid fa-circle-exclamation"
            style={{ color: "#d97706", fontSize: "0.9rem", marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#b45309", lineHeight: 1.55 }}>
            El importe mínimo para pagar en línea es {formatMoneda(montoMinimo!, moneda)}, y tu pedido
            suma {formatMoneda(totalServidor!, moneda)}. Agrega algo más a tu carrito para completar la compra.
          </span>
        </div>
      )}

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
              onIniciarPago={iniciarPagoTarjeta}
              onCompletado={tarjetaCompletada}
              onError={(msg) => setError(msg)}
              total={totalServidor}
              moneda={moneda}
              deshabilitado={!totalListo}
            />
          </motion.div>
        )}
        {data.metodo === "transferencia" && (
          <motion.div key="transferencia" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
            className="rounded-xl p-5" style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
            <PanelInstruccion
              icono="fa-solid fa-circle-info"
              titulo={<>Generaremos una <strong style={{ color: "var(--color-cq-text)" }}>CLABE única</strong> para que realices tu transferencia SPEI desde cualquier banco.</>}
              cuerpo={<>El pedido se confirmará <strong style={{ color: "var(--color-cq-text)" }}>automáticamente</strong> al recibir el pago.</>}
              boton="Obtener datos de transferencia"
              iconoBoton="fa-solid fa-building-columns"
              onClick={() => pagarAsincrono("transferencia")}
              loading={cargando}
              deshabilitado={!totalListo}
            />
          </motion.div>
        )}
        {data.metodo === "oxxo" && (
          <motion.div key="oxxo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
            className="rounded-xl p-5" style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
            <PanelInstruccion
              icono="fa-solid fa-circle-info"
              titulo={<>Generaremos un <strong style={{ color: "var(--color-cq-text)" }}>código de barras único</strong> para pagar en cualquier tienda OXXO.</>}
              cuerpo={<>El voucher es válido por <strong style={{ color: "var(--color-cq-text)" }}>72 horas</strong>. El pedido se confirmará automáticamente al recibir el pago.</>}
              boton="Generar código OXXO"
              iconoBoton="fa-solid fa-barcode"
              onClick={() => pagarAsincrono("oxxo")}
              loading={cargando}
              deshabilitado={!totalListo}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button type="button" onClick={volver} whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 self-start"
        style={{ background: "none", border: "none", cursor: "pointer",
          fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-cq-muted)", padding: 0 }}>
        <i className="fa-solid fa-chevron-left" style={{ fontSize: "0.7rem" }} />
        Volver a envío
      </motion.button>
    </motion.div>
  );
}
