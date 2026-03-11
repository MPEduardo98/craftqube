// app/(main)/checkout/components/CheckoutClient.tsx
"use client";

import { useState }          from "react";
import Link                  from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart }           from "@/app/global/context/CartContext";
import { CheckoutStepper }  from "./CheckoutStepper";
import { StepContacto }     from "./StepContacto";
import { StepEnvio }        from "./StepEnvio";
import { StepPago }         from "./StepPago";
import { StepConfirmacion } from "./StepConfirmacion";
import { OrderSummary }     from "./OrderSummary";
import type { CheckoutFormData, CheckoutStep, DatosPago } from "../types";

/* ─── emptyForm ──────────────────────────────────────────── */
const emptyForm: CheckoutFormData = {
  contacto: {
    nombre:    "",
    apellido:  "",
    email:     "",
    telefono:  "",
    modoGuest: true,
  },
  envio: {
    calle:            "",
    numeroExt:        "",
    numeroInt:        "",
    colonia:          "",
    ciudad:           "",
    municipio:        "",
    estado:           "",
    codigoPostal:     "",
    pais:             "México",
    referencias:      "",
    empresa:          "",
    guardarDireccion: false,
  },
  pago: {
    metodo:        "tarjeta",
    numeroTarjeta: "",
    nombreTarjeta: "",
    expiracion:    "",
    cvv:           "",
    notas:         "",
  },
};

function genOrderNumber() { return "CQ" + Date.now().toString(36).toUpperCase(); }

/* ─── Font Awesome ───────────────────────────────────────── */
function FontAwesomeLink() {
  return (
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      crossOrigin="anonymous"
    />
  );
}

/* ─── TrustBar ───────────────────────────────────────────── */
function TrustBar() {
  return (
    <div className="flex items-center justify-center gap-6 flex-wrap"
      style={{ padding: "12px 0", opacity: 0.5 }}>
      {[
        { icon: "fa-solid fa-lock",           label: "SSL seguro"     },
        { icon: "fa-solid fa-rotate-left",    label: "30 días devolución" },
        { icon: "fa-solid fa-headset",        label: "Soporte 24/7"   },
      ].map((t) => (
        <div key={t.label} className="flex items-center gap-1.5">
          <i className={t.icon} style={{ fontSize: "0.65rem", color: "var(--color-cq-muted)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
            {t.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── CheckoutHeader ─────────────────────────────────────── */
function CheckoutHeader() {
  return (
    <header className="flex items-center justify-center"
      style={{ height: 62, borderBottom: "1px solid var(--color-cq-border)" }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.35rem",
          color: "var(--color-cq-text)", letterSpacing: "-0.02em",
        }}>
          craft<span style={{ color: "var(--color-cq-accent)" }}>qube</span>
        </span>
      </Link>
    </header>
  );
}

/* ══════════════════════════════════════════════════════════ */
export function CheckoutClient() {
  const { items, totalPrecio, clearCart } = useCart();
  const [step,        setStep]        = useState<CheckoutStep>("contacto");
  const [formData,    setFormData]    = useState<CheckoutFormData>(emptyForm);
  const [orderNumber] = useState<string>(genOrderNumber);
  /* stripePaymentIntentId en lugar de paypalOrderId */
  const [pedidoId,    setPedidoId]    = useState<string | null>(null);

  /* Carrito vacío */
  if (!items.length && step !== "confirmacion") {
    return (
      <>
        <FontAwesomeLink />
        <div className="min-h-screen flex flex-col items-center justify-center gap-6"
          style={{ background: "var(--color-cq-bg)" }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }} className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center justify-center rounded-2xl"
              style={{ width: 72, height: 72, background: "var(--color-cq-surface-2)" }}>
              <i className="fa-solid fa-bag-shopping" style={{ fontSize: "1.8rem", color: "var(--color-cq-muted)" }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                Tu carrito está vacío
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)", marginTop: 6 }}>
                Agrega productos para continuar con tu compra.
              </p>
            </div>
            <Link href="/catalogo" className="btn-primary" style={{ marginTop: 8 }}>
              <i className="fa-solid fa-arrow-right" style={{ marginRight: 8 }} />
              Explorar catálogo
            </Link>
          </motion.div>
        </div>
      </>
    );
  }

  const handlePago = (stripePaymentIntentId?: string) => {
    if (stripePaymentIntentId) setPedidoId(stripePaymentIntentId);
    setStep("confirmacion");
  };

  return (
    <>
      <FontAwesomeLink />

      <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>

        {/* Grid decorativo */}
        <div className="pointer-events-none fixed inset-0" style={{
          backgroundImage: "linear-gradient(var(--color-cq-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-cq-border) 1px, transparent 1px)",
          backgroundSize: "80px 80px", opacity: "var(--grid-opacity, 0.03)", zIndex: 0,
        }} />

        <CheckoutHeader />

        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 pb-20 relative z-10">

          {step !== "confirmacion" && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }} style={{ marginBottom: 32 }}>
              <CheckoutStepper currentStep={step} />
            </motion.div>
          )}

          {/* Mobile summary */}
          {step !== "confirmacion" && (
            <div className="lg:hidden" style={{ marginBottom: 20 }}>
              <OrderSummary compact />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-5 items-start">

            {/* ── Izquierda: formulario ────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              <div className="rounded-2xl"
                style={{
                  background: "var(--color-cq-surface)",
                  border: "1px solid var(--color-cq-border)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                }}>
                <div className="p-7 sm:p-9">
                  <AnimatePresence mode="wait">
                    {step === "contacto" && (
                      <StepContacto key="contacto"
                        data={formData.contacto}
                        onChange={(contacto) => setFormData((p) => ({ ...p, contacto }))}
                        onNext={() => setStep("envio")} />
                    )}
                    {step === "envio" && (
                      <StepEnvio key="envio"
                        data={formData.envio}
                        onChange={(envio) => setFormData((p) => ({ ...p, envio }))}
                        onNext={() => setStep("pago")}
                        onBack={() => setStep("contacto")} />
                    )}
                    {step === "pago" && (
                      <StepPago key="pago"
                        data={formData.pago}
                        onChange={(pago: DatosPago) => setFormData((p) => ({ ...p, pago }))}
                        onNext={(stripeId: string | undefined) => handlePago(stripeId)}
                        onBack={() => setStep("envio")}
                        contactoEmail={formData.contacto.email}
                        contactoNombre={`${formData.contacto.nombre} ${formData.contacto.apellido}`.trim()} />
                    )}
                    {step === "confirmacion" && (
                      <StepConfirmacion key="confirmacion"
                        formData={formData}
                        orderNumber={orderNumber}
                        totalFinal={totalPrecio}
                        pedidoId={pedidoId}
                        onClearCart={clearCart} />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {step !== "confirmacion" && <TrustBar />}
            </div>

            {/* ── Derecha: Order Summary ───────────────────── */}
            {step !== "confirmacion" && (
              <div className="hidden lg:block shrink-0" style={{ width: 312 }}>
                <div style={{ position: "sticky", top: 80 }}>
                  <OrderSummary />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}