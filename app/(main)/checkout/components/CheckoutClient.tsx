// app/(main)/checkout/components/CheckoutClient.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import Link                               from "next/link";
import { motion, AnimatePresence }        from "framer-motion";
import { useCart }                        from "@/app/global/context/CartContext";
import { useAuth }                        from "@/app/global/context/AuthContext";
import { CheckoutStepper }               from "./CheckoutStepper";
import { StepContacto }                  from "./StepContacto";
import { StepEnvio }                     from "./StepEnvio";
import { StepPago }                      from "./StepPago";
import { StepConfirmacion }              from "./StepConfirmacion";
import { OrderSummary }                  from "./OrderSummary";
import type { CheckoutFormData, CheckoutStep, DatosPago } from "../types";
import type { PaymentConfirmData }                         from "./StepPago";

/* ── Helpers ─────────────────────────────────────────────── */
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

const emptyForm: CheckoutFormData = {
  contacto: { nombre: "", apellido: "", email: "", telefono: "", modoGuest: true },
  envio: {
    calle: "", numeroExt: "", numeroInt: "", colonia: "", ciudad: "",
    municipio: "", estado: "", codigoPostal: "", pais: "México",
    referencias: "", empresa: "", guardarDireccion: false,
  },
  pago: { metodo: "tarjeta", numeroTarjeta: "", nombreTarjeta: "", expiracion: "", cvv: "", notas: "" },
};

/* ── Guardar pedido en la base de datos ──────────────────── */
async function guardarPedidoDB(params: {
  formData:     CheckoutFormData;
  items:        { variante_id: number; cantidad: number; precio_unitario: number; precio_original: number }[];
  total:        number;
  stripeId:     string | null;
  usuarioId?:   number;
}) {
  const { formData, items, stripeId, usuarioId } = params;
  const { contacto, envio, pago } = formData;

  try {
    const res = await fetch("/api/pedidos", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        usuario_id:  usuarioId ?? undefined,
        email:       contacto.email,
        telefono:    contacto.telefono || undefined,
        direccion_envio: {
          nombre:       contacto.nombre,
          apellido:     contacto.apellido,
          empresa:      envio.empresa || undefined,
          telefono:     contacto.telefono || undefined,
          calle:        envio.calle,
          numero_ext:   envio.numeroExt,
          numero_int:   envio.numeroInt || undefined,
          colonia:      envio.colonia,
          ciudad:       envio.ciudad,
          municipio:    envio.municipio || undefined,
          estado:       envio.estado,
          codigo_postal: envio.codigoPostal,
          pais:         envio.pais,
          referencias:  envio.referencias || undefined,
        },
        items,
        metodo_pago:   pago.metodo,
        costo_envio:   0,
        notas_cliente: pago.notas || undefined,
        referencia_pago: stripeId ?? undefined,
      }),
    });

    const json = await res.json();
    if (!res.ok) console.error("[checkout] Error guardando pedido:", json.error);
    else console.log("[checkout] ✓ Pedido guardado:", json.data?.numero);
  } catch (err) {
    console.error("[checkout] Error al guardar pedido:", err);
  }
}

/* ── Guardar teléfono del usuario autenticado ────────────── */
async function guardarTelefonoUsuario(telefono: string) {
  try {
    await fetch("/api/users/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ telefono }),
    });
    console.log("[checkout] ✓ Teléfono guardado en perfil");
  } catch (err) {
    console.error("[checkout] Error al guardar teléfono:", err);
  }
}

/* ── Guardar dirección del usuario autenticado ───────────── */
async function guardarDireccionUsuario(
  formData: CheckoutFormData,
  esPredeterminada = false
) {
  const { contacto, envio } = formData;
  try {
    await fetch("/api/users/addresses", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        nombre:           contacto.nombre,
        apellido:         contacto.apellido,
        empresa:          envio.empresa || null,
        telefono:         contacto.telefono || null,
        calle:            envio.calle,
        numero_ext:       envio.numeroExt,
        numero_int:       envio.numeroInt || null,
        colonia:          envio.colonia,
        ciudad:           envio.ciudad,
        municipio:        envio.municipio || null,
        estado:           envio.estado,
        codigo_postal:    envio.codigoPostal,
        pais:             envio.pais,
        referencias:      envio.referencias || null,
        es_predeterminada: esPredeterminada,
        tipo:             "envio",
      }),
    });
    console.log("[checkout] ✓ Dirección guardada en cuenta");
  } catch (err) {
    console.error("[checkout] Error al guardar dirección:", err);
  }
}

/* ══════════════════════════════════════════════════════════ */
export function CheckoutClient() {
  const { items, totalPrecio, clearCart } = useCart();
  const { usuario, autenticado, refreshUser } = useAuth();

  const [step,        setStep]      = useState<CheckoutStep>("contacto");
  const [formData,    setFormData]  = useState<CheckoutFormData>(emptyForm);
  const [orderNumber]               = useState<string>(genOrderNumber);
  const [pedidoId,    setPedidoId]  = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentConfirmData | null>(null);

  const totalSnapshot = useRef<number>(0);

  /* ── handlePago: DEBE estar antes de cualquier early return (Rules of Hooks) ── */
  const handlePago = useCallback(async (
    stripePaymentIntentId?: string,
    pd?: PaymentConfirmData
  ) => {
    totalSnapshot.current = totalPrecio;
    setPedidoId(stripePaymentIntentId ?? null);
    setPaymentData(pd ?? null);
    setStep("confirmacion");

    const pedidoItems = items.map((item) => ({
      variante_id:     item.varianteId,
      cantidad:        item.cantidad,
      precio_unitario: item.precio,
      precio_original: item.precio,
    }));

    // 1️⃣ Guardar pedido en la BD (non-blocking)
    guardarPedidoDB({
      formData,
      items:      pedidoItems,
      total:      totalPrecio,
      stripeId:   stripePaymentIntentId ?? null,
      usuarioId:  usuario?.id,
    });

    // 2️⃣ Guardar teléfono si el usuario autenticado no tenía uno
    if (autenticado && usuario && !usuario.telefono && formData.contacto.telefono?.trim()) {
      await guardarTelefonoUsuario(formData.contacto.telefono.trim());
      refreshUser?.();
    }

    // 3️⃣ Guardar dirección si el usuario lo marcó
    if (autenticado && formData.envio.guardarDireccion) {
      guardarDireccionUsuario(formData, true);
    }
  }, [formData, items, totalPrecio, autenticado, usuario, refreshUser]);

  /* ── Carrito vacío — early return DESPUÉS de todos los hooks ── */
  if (items.length === 0 && step !== "confirmacion") {
    return (
      <>
        <FontAwesomeLink />
        <div className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--color-cq-bg)" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center px-4"
          >
            <div className="flex items-center justify-center rounded-2xl"
              style={{ width: 72, height: 72, background: "var(--color-cq-surface-2)",
                border: "1px solid var(--color-cq-border)" }}>
              <i className="fa-solid fa-cart-shopping"
                style={{ fontSize: "1.6rem", color: "var(--color-cq-muted-2)" }} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem",
                fontWeight: 700, color: "var(--color-cq-text)" }}>
                Tu carrito está vacío
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem",
                color: "var(--color-cq-muted)", marginTop: 6 }}>
                Agrega productos para continuar con tu compra
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
                      onBack={() => setStep("contacto")}
                      contactoNombre={formData.contacto.nombre}
                      contactoApellido={formData.contacto.apellido} />
                  )}
                  {step === "pago" && (
                    <StepPago key="pago"
                      data={formData.pago}
                      onChange={(pago: DatosPago) => setFormData((p) => ({ ...p, pago }))}
                      onNext={(stripeId, pd) => handlePago(stripeId, pd)}
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
                      totalFinal={totalSnapshot.current}
                      pedidoId={pedidoId}
                      paymentData={paymentData}
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