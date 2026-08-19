// features/checkout/components/CheckoutClient.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import Link                                  from "next/link";
import { motion, AnimatePresence }           from "framer-motion";
import { useCart }                           from "@/features/cart/context/CartContext";
import { useAuth }                           from "@/features/auth/context/AuthContext";
import { useAlert }                          from "@/shared/context/AlertContext";
import { formatMoneda }                      from "@/shared/lib/format";
import { CheckoutStepper }                   from "./CheckoutStepper";
import { StepContacto }                      from "./StepContacto";
import { StepEnvio }                         from "./StepEnvio";
import { StepPago }                          from "./StepPago";
import { StepConfirmacion }                  from "./StepConfirmacion";
import { OrderSummary }                      from "./OrderSummary";
import type { CheckoutFormData, CheckoutStep, DatosPago } from "../types";
import type { ResultadoPago }                             from "./StepPago";

/* ── Resumen calculado en servidor ───────────────────────── */
export interface ResumenCheckout {
  subtotal:    number;
  descuento:   number;
  costo_envio: number;
  impuestos:   number;
  total:       number;
  moneda:      string;
  /** Código realmente aplicado por el servidor; null si ninguno. */
  cupon_codigo?: string | null;
  cupon_tipo?:   string | null;
  /** Motivo por el que se descartó el cupón que se pidió. */
  cupon_error?:  string | null;
}

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
  pago: { metodo: "tarjeta", nombreTarjeta: "", notas: "" },
};

/* ── Guardar teléfono del usuario autenticado ────────────── */
async function guardarTelefonoUsuario(telefono: string) {
  try {
    await fetch("/api/users/profile", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ telefono }),
    });
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
  } catch (err) {
    console.error("[checkout] Error al guardar dirección:", err);
  }
}

/* ══════════════════════════════════════════════════════════ */
export function CheckoutClient() {
  const { items, clearCart } = useCart();
  const { usuario, autenticado, refreshUser } = useAuth();
  const { success, error: alertaError } = useAlert();

  const [step,     setStep]     = useState<CheckoutStep>("contacto");
  const [formData, setFormData] = useState<CheckoutFormData>(emptyForm);

  /** Código de cupón confirmado por el servidor; null si no hay ninguno. */
  const [cupon,         setCupon]         = useState<string | null>(null);
  const [cuponCargando, setCuponCargando] = useState(false);

  /** Importes autoritativos del servidor; null mientras se calculan. */
  const [resumen,       setResumen]       = useState<ResumenCheckout | null>(null);
  const [errorResumen,  setErrorResumen]  = useState<string | null>(null);

  /** Datos del pedido ya pagado, para la pantalla de confirmación. */
  const [resultado, setResultado] = useState<ResultadoPago | null>(null);

  /**
   * Pide al servidor el desglose real (precios de BD, envío cotizado,
   * cupón). Es la MISMA función que después calcula lo que se cobra,
   * así que lo mostrado y lo cobrado no pueden diferir.
   */
  const cargarResumen = useCallback(async (
    estado:      string,
    codigoCupon: string | null
  ): Promise<ResumenCheckout | null> => {
    if (!estado.trim() || items.length === 0) { setResumen(null); return null; }
    setErrorResumen(null);
    try {
      const res = await fetch("/api/checkout/resumen", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          estado,
          items: items.map((i) => ({ variante_id: i.varianteId, cantidad: i.cantidad })),
          cupon_codigo: codigoCupon || undefined,
          // Identifica al invitado en cupones de primera compra, para que
          // la vista previa coincida con lo que aceptará el cobro.
          email: formData.contacto.email || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setResumen(null);
        setErrorResumen(json.error ?? "No pudimos calcular el total.");
        return null;
      }

      const data = json.data as ResumenCheckout;
      setResumen(data);

      // El servidor manda sobre el cupón. Si lo rechazó —por ejemplo
      // porque el carrito cambió y ya no llega al mínimo— se retira aquí,
      // en un solo sitio, y el comprador se entera por qué.
      if (data.cupon_error) {
        setCupon(null);
        alertaError(data.cupon_error, "Cupón no aplicado");
      } else {
        setCupon(data.cupon_codigo ?? null);
      }

      return data;
    } catch {
      setResumen(null);
      setErrorResumen("No pudimos calcular el total. Revisa tu conexión.");
      return null;
    }
  }, [items, formData.contacto.email, alertaError]);

  /* Recalcular si cambia el carrito estando ya en el paso de pago. */
  useEffect(() => {
    if (step === "pago") void cargarResumen(formData.envio.estado, cupon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, items]);

  /* ── Cupones ────────────────────────────────────────────── */
  const aplicarCupon = useCallback(async (codigo: string) => {
    setCuponCargando(true);
    try {
      const data = await cargarResumen(formData.envio.estado, codigo);
      if (!data?.cupon_codigo) return;   // el motivo ya se avisó
      success(
        data.cupon_tipo === "envio_gratis"
          ? "El envío de tu pedido es gratis."
          : `Ahorras ${formatMoneda(data.descuento, data.moneda)}.`,
        "Cupón aplicado"
      );
    } finally {
      setCuponCargando(false);
    }
  }, [cargarResumen, formData.envio.estado, success]);

  const quitarCupon = useCallback(async () => {
    setCuponCargando(true);
    setCupon(null);
    try {
      await cargarResumen(formData.envio.estado, null);
    } finally {
      setCuponCargando(false);
    }
  }, [cargarResumen, formData.envio.estado]);

  /* ── Pago aceptado: sólo tareas de cuenta; el pedido ya existe ── */
  const handlePagoConfirmado = useCallback(async (res: ResultadoPago) => {
    setResultado(res);
    setStep("confirmacion");
    clearCart();

    // Guardar teléfono si el usuario autenticado no tenía uno
    if (autenticado && usuario && !usuario.telefono && formData.contacto.telefono?.trim()) {
      await guardarTelefonoUsuario(formData.contacto.telefono.trim());
      refreshUser?.();
    }

    // Guardar dirección si el usuario lo marcó
    if (autenticado && formData.envio.guardarDireccion) {
      void guardarDireccionUsuario(formData, true);
    }
  }, [formData, autenticado, usuario, refreshUser, clearCart]);

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
                      onNext={() => { void cargarResumen(formData.envio.estado, cupon); setStep("pago"); }}
                      onBack={() => setStep("contacto")}
                      contactoNombre={formData.contacto.nombre}
                      contactoApellido={formData.contacto.apellido} />
                  )}
                  {step === "pago" && (
                    <>
                      {errorResumen && (
                        <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5"
                          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                          <i className="fa-solid fa-circle-exclamation"
                            style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#dc2626", lineHeight: 1.55 }}>
                            {errorResumen}
                          </span>
                        </div>
                      )}
                      <StepPago key="pago"
                        data={formData.pago}
                        onChange={(pago: DatosPago) => setFormData((p) => ({ ...p, pago }))}
                        onNext={handlePagoConfirmado}
                        onBack={() => setStep("envio")}
                        contacto={formData.contacto}
                        envioData={formData.envio}
                        totalServidor={resumen?.total ?? null}
                        moneda={resumen?.moneda ?? "MXN"}
                        cuponCodigo={cupon}
                        cuponCargando={cuponCargando}
                        cuponEtiqueta={
                          !resumen ? null
                          : resumen.cupon_tipo === "envio_gratis" ? "Envío gratis"
                          : resumen.descuento > 0 ? `−${formatMoneda(resumen.descuento, resumen.moneda)}`
                          : null
                        }
                        onAplicarCupon={aplicarCupon}
                        onQuitarCupon={quitarCupon}
                      />
                    </>
                  )}
                  {step === "confirmacion" && resultado && (
                    <StepConfirmacion key="confirmacion"
                      formData={formData}
                      resultado={resultado} />
                  )}
                </AnimatePresence>
              </div>

              {step !== "confirmacion" && <TrustBar />}
            </div>

            {step !== "confirmacion" && (
              <div className="hidden lg:block shrink-0" style={{ width: 312 }}>
                <div style={{ position: "sticky", top: 80 }}>
                  <OrderSummary resumen={step === "pago" ? resumen : null} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
