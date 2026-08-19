// features/checkout/components/pasos/PasoEnvio.tsx
"use client";

import { useRouter }   from "next/navigation";
import { useCheckout } from "../../context/CheckoutContext";
import { RUTA_PASO }   from "../../types";
import { StepEnvio }   from "../StepEnvio";

export function PasoEnvio() {
  const router = useRouter();
  const { formData, setEnvio } = useCheckout();

  return (
    <StepEnvio
      data={formData.envio}
      onChange={setEnvio}
      onNext={() => router.push(RUTA_PASO.pago)}
      // "Volver" es la misma acción que la flecha del navegador: retrocede
      // en el historial en lugar de apilar otra entrada hacia contacto.
      onBack={() => router.back()}
      contactoNombre={formData.contacto.nombre}
      contactoApellido={formData.contacto.apellido}
    />
  );
}
