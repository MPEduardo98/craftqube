// features/checkout/components/pasos/PasoContacto.tsx
"use client";

import { useRouter }    from "next/navigation";
import { useCheckout }  from "@mpeduardo98/commerce-core/checkout/context/CheckoutContext";
import { RUTA_PASO }    from "@mpeduardo98/commerce-core/checkout/types";
import { StepContacto } from "../StepContacto";

export function PasoContacto() {
  const router = useRouter();
  const { formData, setContacto } = useCheckout();

  return (
    <StepContacto
      data={formData.contacto}
      onChange={setContacto}
      onNext={() => router.push(RUTA_PASO.envio)}
    />
  );
}
