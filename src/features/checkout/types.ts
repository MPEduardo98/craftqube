// app/(main)/checkout/types.ts

export type CheckoutStep = "contacto" | "envio" | "pago" | "confirmacion";

export interface DatosContacto {
  nombre:    string;
  apellido:  string;
  email:     string;
  telefono:  string;
  /** Solo aplica cuando el usuario NO está autenticado */
  modoGuest?: boolean;
}

export interface DatosEnvio {
  calle:           string;
  numeroExt:       string;
  numeroInt:       string;
  colonia:         string;
  ciudad:          string;
  municipio:       string;
  estado:          string;
  codigoPostal:    string;
  pais:            string;
  referencias:     string;
  empresa:         string;
  /** Guardar dirección en la cuenta (solo usuarios autenticados) */
  guardarDireccion?: boolean;
}

export interface DatosPago {
  metodo:        "tarjeta" | "transferencia" | "oxxo";
  /**
   * Sólo el nombre del titular. El número, el vencimiento y el CVC
   * viven exclusivamente dentro de los iframes de Stripe Elements:
   * nunca tocan el estado de la aplicación ni nuestro servidor.
   */
  nombreTarjeta: string;
  notas:         string;
}

export interface CheckoutFormData {
  contacto: DatosContacto;
  envio:    DatosEnvio;
  pago:     DatosPago;
}

export const STEPS: { id: CheckoutStep; label: string; shortLabel: string; icon: string }[] = [
  { id: "contacto",     label: "Contacto",  shortLabel: "Contacto", icon: "fa-user"       },
  { id: "envio",        label: "Envío",     shortLabel: "Envío",    icon: "fa-truck"      },
  { id: "pago",         label: "Pago",      shortLabel: "Pago",     icon: "fa-credit-card"},
  { id: "confirmacion", label: "Listo",     shortLabel: "Listo",    icon: "fa-check"      },
];

export { ESTADOS_MX } from "@/shared/data/estados-mx";