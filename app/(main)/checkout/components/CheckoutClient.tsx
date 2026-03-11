// app/(main)/checkout/components/CheckoutClient.tsx
"use client";

import { useState, useRef }  from "react";
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

const emptyForm: CheckoutFormData = {
  contacto: { nombre: "", apellido: "", email: "", telefono: "", modoGuest: true },
  envio: {
    calle: "", numeroExt: "", numeroInt: "", colonia: "", ciudad: "",
    municipio: "", estado: "", codigoPostal: "", pais: "México",
    referencias: "", empresa: "", guardarDireccion: false,
  },
  pago: { metodo: "tarjeta", numeroTarjeta: "", nombreTarjeta: "", expiracion: "", cvv: "", notas: "" },
};

function genOrderNumber() { return "CQ" + Date.now().toString(36).toUpperCase(); }

function FontAwesomeLink() {
  return (
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
      crossOrigin="anonymous"
    />
  );
}

function TrustBar() {
  return (
    <div className="flex items-center justify-center gap-6 py-4"
      style={{ borderTop: "1px solid var(--color-cq-border)", marginTop: 8 }}>
      {[
        { icon: "fa-solid fa-lock",        label: "SSL Seguro" },
        { icon: "fa-solid fa-rotate-left", label: "30 días devolución" },
        { icon: "fa-solid fa-headset",     label: "Soporte 24/7" },
      ].map(({ icon, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <i className={icon} style={{ fontSize: "0.7rem", color: "var(--color-cq-muted-2)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--color-cq-muted-2)" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export function CheckoutClient() {
  const { items, totalPrecio, clearCart } = useCart();
  const [step,        setStep]     = useState<CheckoutStep>("contacto");
  const [formData,    setFormData] = useState<CheckoutFormData>(emptyForm);
  const [orderNumber]              = useState<string>(genOrderNumber);
  const [pedidoId,    setPedidoId] = useState<string | null>(null);

  /**
   * FIX: captura el total ANTES de que onClearCart() vacie el carrito y
   * haga que totalPrecio reactivo vuelva a 0 en el próximo render.
   */
  const totalSnapshot = useRef<number>(0);

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
    totalSnapshot.current = totalPrecio; // snapshot antes del clear
    setPedidoId(stripePaymentIntentId ?? null);
    setStep("confirmacion");
  };

  return (
    <>
      <FontAwesomeLink />
      <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 py-8">

          {step !== "confirmacion" && (
            <div className="mb-8">
              <CheckoutStepper currentStep={step} />
            </div>
          )}

          <div className="flex gap-8 items-start">
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl p-6 sm:p-8"
                style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
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
                      contactoNombre={`${formData.contacto.nombre} ${formData.contacto.apellido}`.trim()}
                      orderNumber={orderNumber}
                      envioData={formData.envio}
                    />
                  )}
                  {step === "confirmacion" && (
                    <StepConfirmacion key="confirmacion"
                      formData={formData}
                      orderNumber={orderNumber}
                      totalFinal={totalSnapshot.current}  // ← nunca será 0
                      pedidoId={pedidoId}
                      onClearCart={clearCart} />
                  )}
                </AnimatePresence>
              </div>

              {step !== "confirmacion" && <TrustBar />}
            </div>

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