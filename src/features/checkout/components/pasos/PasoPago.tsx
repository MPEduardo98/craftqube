// features/checkout/components/pasos/PasoPago.tsx
"use client";

import { useEffect, useCallback } from "react";
import { useRouter }              from "next/navigation";
import { useCart }                from "@/features/cart/context/CartContext";
import { useCheckout }            from "../../context/CheckoutContext";
import { RUTA_PASO }              from "../../types";
import { StepPago }               from "../StepPago";
import type { DatosPago }         from "../../types";
import type { ResultadoPago }     from "../StepPago";

export function PasoPago() {
  const router  = useRouter();
  const { items } = useCart();
  const {
    hidratado, formData, setPago, cupon,
    resumen, cargarResumen, registrarPago,
  } = useCheckout();

  /* El desglose se pide al entrar al paso y se rehace si el carrito
     cambia mientras se está aquí: lo que se muestra tiene que ser
     exactamente lo que el servidor va a cobrar. */
  useEffect(() => {
    if (!hidratado) return;
    void cargarResumen(formData.envio.estado, cupon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidratado, items]);

  const handlePagado = useCallback((res: ResultadoPago) => {
    void registrarPago(res);
    // replace y no push: el pedido ya está cobrado, la flecha de atrás
    // no debe devolver a nadie al formulario de pago.
    router.replace(RUTA_PASO.confirmacion);
  }, [registrarPago, router]);

  return (
    <StepPago
      data={formData.pago}
      onChange={(pago: DatosPago) => setPago(pago)}
      onNext={handlePagado}
      onBack={() => router.back()}
      contacto={formData.contacto}
      envioData={formData.envio}
      totalServidor={resumen?.total ?? null}
      moneda={resumen?.moneda ?? "MXN"}
      montoMinimo={resumen?.monto_minimo ?? null}
      cuponCodigo={cupon}
    />
  );
}
