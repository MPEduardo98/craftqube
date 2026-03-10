// app/(main)/checkout/types.ts

export type CheckoutStep = "contacto" | "envio" | "pago" | "confirmacion";

export interface DatosContacto {
  nombre:   string;
  apellido: string;
  email:    string;
  telefono: string;
}

export interface DatosEnvio {
  calle:        string;
  numeroExt:    string;
  numeroInt:    string;
  colonia:      string;
  ciudad:       string;
  estado:       string;
  codigoPostal: string;
  referencias:  string;
}

export interface DatosPago {
  metodo:        "tarjeta" | "transferencia" | "oxxo";
  numeroTarjeta: string;
  nombreTarjeta: string;
  expiracion:    string;
  cvv:           string;
}

export interface CheckoutFormData {
  contacto: DatosContacto;
  envio:    DatosEnvio;
  pago:     DatosPago;
}

export const STEPS: { id: CheckoutStep; label: string; shortLabel: string }[] = [
  { id: "contacto",     label: "Contacto",  shortLabel: "Contacto" },
  { id: "envio",        label: "Envío",     shortLabel: "Envío"    },
  { id: "pago",         label: "Pago",      shortLabel: "Pago"     },
  { id: "confirmacion", label: "Listo",     shortLabel: "Listo"    },
];

export const ESTADOS_MX = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche",
  "Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango",
  "Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco",
  "Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla",
  "Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora",
  "Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas",
];