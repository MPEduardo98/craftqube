// app/(main)/checkout/components/CheckoutClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart }             from "@/app/global/context/CartContext";
import { CheckoutStepper }    from "./CheckoutStepper";
import { StepContacto }       from "./StepContacto";
import { StepEnvio }          from "./StepEnvio";
import { StepPago }           from "./StepPago";
import { StepConfirmacion }   from "./StepConfirmacion";
import { OrderSummary }       from "./OrderSummary";
import type { CheckoutFormData, CheckoutStep } from "../types";

const emptyForm: CheckoutFormData = {
  contacto: { nombre: "", apellido: "", email: "", telefono: "" },
  envio: { calle: "", numeroExt: "", numeroInt: "", colonia: "", ciudad: "", estado: "", codigoPostal: "", referencias: "" },
  pago: { metodo: "tarjeta", numeroTarjeta: "", nombreTarjeta: "", expiracion: "", cvv: "" },
};

function genOrderNumber() { return "CQ" + Date.now().toString(36).toUpperCase(); }

/* ─── TrustBar con FA icons ──────────────────────────────── */
function TrustBar() {
  const brands = [
    { label: "Visa",       icon: <i className="fa-brands fa-cc-visa"       style={{ fontSize: "1.45rem" }} /> },
    { label: "Mastercard", icon: <i className="fa-brands fa-cc-mastercard" style={{ fontSize: "1.45rem" }} /> },
    { label: "Amex",       icon: <i className="fa-brands fa-cc-amex"       style={{ fontSize: "1.45rem" }} /> },
    { label: "PayPal",     icon: <i className="fa-brands fa-cc-paypal"     style={{ fontSize: "1.45rem" }} /> },
    { label: "OXXO",       icon: <i className="fa-solid fa-store"          style={{ fontSize: "0.9rem" }} /> },
    { label: "SPEI",       icon: <i className="fa-solid fa-building-columns" style={{ fontSize: "0.9rem" }} /> },
  ];

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-3">
        <div style={{ height: 1, width: 32, background: "var(--color-cq-border)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.57rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted-2)" }}>
          Métodos de pago
        </span>
        <div style={{ height: 1, width: 32, background: "var(--color-cq-border)" }} />
      </div>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {brands.map(({ label, icon }) => (
          <div key={label} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg" title={label}
            style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-muted)", minWidth: 48, height: 36 }}>
            {icon}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <i className="fa-solid fa-lock" style={{ fontSize: "0.6rem", color: "var(--color-cq-muted-2)" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.05em", color: "var(--color-cq-muted-2)" }}>
          Conexión segura SSL 256-bit · Datos encriptados
        </span>
      </div>
    </div>
  );
}

/* ─── Header checkout — solo logo centrado ───────────────── */
function CheckoutHeader() {
  return (
    <header
      className="sticky top-0 z-20"
      style={{
        background: "var(--color-cq-surface)",
        borderBottom: "1px solid var(--color-cq-border)",
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{ height: 60 }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2.5"
          >
            <div
              className="flex items-center justify-center rounded-lg"
              style={{ width: 28, height: 28, background: "var(--color-cq-primary)", flexShrink: 0 }}
            >
              <i className="fa-solid fa-cube" style={{ fontSize: "0.75rem", color: "white" }} />
            </div>
            <span style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              fontWeight: 800,
              letterSpacing: "0.05em",
              color: "var(--color-cq-text)",
            }}>
              CRAFTQUBE
            </span>
          </motion.div>
        </Link>
      </div>
    </header>
  );
}

/* ─── Componente principal ───────────────────────────────── */
export function CheckoutClient() {
  const { items, totalPrecio, clearCart } = useCart();
  const [step, setStep]           = useState<CheckoutStep>("contacto");
  const [formData, setFormData]   = useState<CheckoutFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [orderNumber]             = useState(genOrderNumber);

  const FontAwesomeLink = () => (
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
  );

  if (items.length === 0 && step !== "confirmacion") {
    return (
      <>
        <FontAwesomeLink />
        <CheckoutHeader />
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-4"
          style={{ background: "var(--color-cq-bg)" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center max-w-sm">
            <div className="flex items-center justify-center rounded-2xl"
              style={{ width: 72, height: 72, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}>
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: "1.5rem", color: "var(--color-cq-muted-2)" }} />
            </div>
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "var(--color-cq-text)" }}>Tu carrito está vacío</h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-cq-muted)", marginTop: 6 }}>Agrega productos antes de proceder al pago.</p>
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

  const handlePago = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsLoading(false);
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

        {/* ── Contenido ───────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-10 pb-20 relative z-10">

          {/* Stepper — centrado, ancho completo del layout */}
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

          {/* ── Dos columnas — ALINEADAS en top ─────────── */}
          <div className="flex flex-col lg:flex-row gap-5 items-start">

            {/* ── Izquierda: Formulario ─────────────────── */}
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
                        onChange={(pago) => setFormData((p) => ({ ...p, pago }))}
                        onNext={handlePago}
                        onBack={() => setStep("envio")}
                        isLoading={isLoading} />
                    )}
                    {step === "confirmacion" && (
                      <StepConfirmacion key="confirmacion"
                        formData={formData}
                        orderNumber={orderNumber}
                        totalFinal={totalPrecio}
                        onClearCart={clearCart} />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {step !== "confirmacion" && <TrustBar />}
            </div>

            {/* ── Derecha: Order Summary ────────────────── */}
            {step !== "confirmacion" && (
              <div className="hidden lg:block shrink-0" style={{ width: 312 }}>
                {/* sticky top = header(62) + pt-10(40) + stepper(~76) = ~100px con algo de margen */}
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