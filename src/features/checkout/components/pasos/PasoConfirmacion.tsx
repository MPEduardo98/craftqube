// features/checkout/components/pasos/PasoConfirmacion.tsx
"use client";

import { useCheckout }      from "../../context/CheckoutContext";
import { StepConfirmacion } from "../StepConfirmacion";

export function PasoConfirmacion() {
  const { formData, resultado } = useCheckout();

  // Sin pedido no hay nada que confirmar; el guard del shell ya está
  // devolviendo a /checkout/contacto, aquí sólo se evita el render.
  if (!resultado) return null;

  return <StepConfirmacion formData={formData} resultado={resultado} />;
}
