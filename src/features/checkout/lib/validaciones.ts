// features/checkout/lib/validaciones.ts
// ─────────────────────────────────────────────────────────────
// Reglas de validación de cada paso, fuera de los componentes.
// Ahora que cada paso tiene su propia URL, el mismo criterio que
// bloquea el botón "Continuar" tiene que poder evaluarse desde el
// guard de ruta: si alguien recarga en /checkout/pago sin datos de
// envío, hay que devolverlo. Una sola fuente para las dos cosas.
// ─────────────────────────────────────────────────────────────
import type { DatosContacto, DatosEnvio } from "../types";

export type ErroresContacto = Partial<Record<keyof DatosContacto, string>>;
export type ErroresEnvio    = Partial<Record<keyof DatosEnvio,    string>>;

export function validarContacto(d: DatosContacto): ErroresContacto {
  const e: ErroresContacto = {};
  if (!d.nombre.trim())   e.nombre   = "El nombre es requerido";
  if (!d.apellido.trim()) e.apellido = "El apellido es requerido";
  if (!d.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
    e.email = "Correo electrónico inválido";
  if (!d.modoGuest && d.telefono && d.telefono.replace(/\D/g, "").length < 10)
    e.telefono = "Teléfono de 10 dígitos";
  return e;
}

export function validarEnvio(d: DatosEnvio): ErroresEnvio {
  const e: ErroresEnvio = {};
  if (!d.calle.trim())     e.calle     = "La calle es requerida";
  if (!d.numeroExt.trim()) e.numeroExt = "El número exterior es requerido";
  if (!d.colonia.trim())   e.colonia   = "La colonia es requerida";
  if (!d.ciudad.trim())    e.ciudad    = "La ciudad es requerida";
  if (!d.estado)           e.estado    = "Selecciona un estado";
  if (!d.codigoPostal.trim() || d.codigoPostal.replace(/\D/g, "").length !== 5)
    e.codigoPostal = "Código postal de 5 dígitos";
  return e;
}

export const contactoCompleto = (d: DatosContacto) =>
  Object.keys(validarContacto(d)).length === 0;

export const envioCompleto = (d: DatosEnvio) =>
  Object.keys(validarEnvio(d)).length === 0;
