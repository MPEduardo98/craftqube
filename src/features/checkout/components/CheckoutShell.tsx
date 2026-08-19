// features/checkout/components/CheckoutShell.tsx
// ─────────────────────────────────────────────────────────────
// Marco común de /checkout/*. Vive en el layout, así que Next lo
// conserva al pasar de un paso a otro: el stepper, el resumen y
// el estado del pedido no se remontan en cada navegación.
//
// También hace de guard. Con un paso por URL, cualquiera puede
// escribir /checkout/pago a mano o recargar ahí: antes de pintar
// nada se comprueba que los pasos previos estén completos y, si
// no, se devuelve al primero que falte.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link                        from "next/link";
import { usePathname, useRouter }  from "next/navigation";
import { motion }                 from "framer-motion";
import { useCart }                 from "@/features/cart/context/CartContext";
import { CheckoutProvider, useCheckout } from "../context/CheckoutContext";
import { contactoCompleto, envioCompleto } from "../lib/validaciones";
import { RUTA_PASO, pasoDesdeRuta, type CheckoutStep } from "../types";
import { CheckoutStepper } from "./CheckoutStepper";
import { OrderSummary }    from "./OrderSummary";
import { CuponCard }       from "./CuponCard";

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

/** Espera mientras se lee el borrador o se resuelve una redirección. */
function Cargando() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-2xl animate-pulse"
          style={{ height: 56, background: "var(--color-cq-surface-2)", marginBottom: 32 }} />
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0 rounded-2xl animate-pulse"
            style={{ height: 420, background: "var(--color-cq-surface-2)",
              border: "1px solid var(--color-cq-border)" }} />
          <div className="hidden lg:block shrink-0 rounded-2xl animate-pulse"
            style={{ width: 384, height: 280, background: "var(--color-cq-surface-2)",
              border: "1px solid var(--color-cq-border)" }} />
        </div>
      </div>
    </div>
  );
}

function CarritoVacio() {
  return (
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
  );
}

/* ══════════════════════════════════════════════════════════ */
function Marco({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const paso     = pasoDesdeRuta(pathname);

  const { items, hidratado: carritoHidratado } = useCart();
  const {
    hidratado, formData, resultado, limpiarPedido,
    resumen, cupon, cuponCargando, cuponEtiqueta, aplicarCupon, quitarCupon,
  } = useCheckout();

  const listo = hidratado && carritoHidratado;

  /* ── Volver al flujo tras un pedido terminado = compra nueva ──
     El pedido pagado sobrevive a la recarga (la confirmación con los
     datos de SPEI/OXXO tiene que aguantar un F5), así que hay que
     retirarlo al pisar otra vez un paso de compra. Se compara contra
     el paso anterior para no borrarlo en el instante en que el pago
     se acepta y todavía estamos en /checkout/pago. */
  const pasoAnterior = useRef<CheckoutStep | null>(null);
  useEffect(() => {
    if (!listo) return;
    const anterior = pasoAnterior.current;
    pasoAnterior.current = paso;
    if (anterior !== paso && paso !== "confirmacion" && resultado) limpiarPedido();
  }, [listo, paso, resultado, limpiarPedido]);

  /* Hay pedido pagado pero no estamos en la confirmación: o el cobro
     acaba de aceptarse y la navegación va en camino, o se volvió atrás
     y el efecto de arriba está a punto de cerrarlo. En ninguno de los
     dos casos tiene sentido pintar el paso; se espera. */
  const pedidoFueraDeSitio = listo && resultado !== null && paso !== "confirmacion";

  /* ── Guard: ¿este paso es alcanzable con lo que hay? ────── */
  const destino: string | null =
    !listo                        ? null
    : paso === "confirmacion"     ? (resultado ? null : RUTA_PASO.contacto)
    : items.length === 0          ? null   // se muestra el carrito vacío, no se redirige
    : paso !== "contacto" && !contactoCompleto(formData.contacto) ? RUTA_PASO.contacto
    : paso === "pago" && !envioCompleto(formData.envio)           ? RUTA_PASO.envio
    : null;

  useEffect(() => {
    if (destino) router.replace(destino);
  }, [destino, router]);

  if (!listo || destino || pedidoFueraDeSitio) return <Cargando />;

  if (paso !== "confirmacion" && items.length === 0) return <CarritoVacio />;

  const enConfirmacion = paso === "confirmacion";

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {!enConfirmacion && (
          <div className="mb-8">
            <CheckoutStepper currentStep={paso} />
          </div>
        )}

        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl p-6 sm:p-8"
              style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
              {/* Sin AnimatePresence aquí a propósito. Envolver el paso en
                  otro motion.div dejaba a su motion.div raíz clavado en su
                  `initial` (opacity 0): el formulario estaba en el DOM y
                  respondía al ratón, pero no se veía. Cada paso ya se anima
                  al entrar por su cuenta; lo único que se pierde es la
                  animación de salida, que con una URL por paso sobra. */}
              {children}
            </div>

            {!enConfirmacion && <TrustBar />}
          </div>

          {!enConfirmacion && (
            <div className="hidden lg:block shrink-0" style={{ width: 384 }}>
              <div className="flex flex-col gap-4" style={{ position: "sticky", top: 80 }}>
                <OrderSummary resumen={paso === "pago" ? resumen : null} />

                {/* Sólo en el paso de pago: aplicar un cupón exige el
                    estado de envío ya cotizado, que es lo que da los
                    importes reales sobre los que muerde el descuento. */}
                {paso === "pago" && (
                  <CuponCard
                    aplicado={cupon}
                    cargando={cuponCargando}
                    etiqueta={cuponEtiqueta}
                    onAplicar={aplicarCupon}
                    onQuitar={quitarCupon}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CheckoutShell({ children }: { children: ReactNode }) {
  return (
    <CheckoutProvider>
      <FontAwesomeLink />
      <Marco>{children}</Marco>
    </CheckoutProvider>
  );
}
