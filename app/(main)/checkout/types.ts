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
  numeroTarjeta: string;
  nombreTarjeta: string;
  expiracion:    string;
  cvv:           string;
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

export const ESTADOS_MX = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche",
  "Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango",
  "Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco",
  "Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla",
  "Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora",
  "Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas",
];