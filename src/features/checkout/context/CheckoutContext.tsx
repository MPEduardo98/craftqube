// features/checkout/context/CheckoutContext.tsx
// ─────────────────────────────────────────────────────────────
// Estado compartido del checkout. Antes vivía dentro de un único
// componente que pintaba los cuatro pasos; ahora cada paso es una
// página, así que el estado sube al layout —que Next conserva
// entre rutas hermanas— y se respalda en sessionStorage para que
// un F5 no borre lo que el comprador ya escribió.
//
// sessionStorage y no localStorage a propósito: el borrador muere
// con la pestaña. Del pago nunca se guarda nada sensible: número,
// vencimiento y CVC viven sólo dentro de los iframes de Stripe.
// ─────────────────────────────────────────────────────────────
"use client";

import {
  createContext, useContext, useState, useCallback, useEffect,
  type ReactNode,
} from "react";
import { useCart }      from "@/features/cart/context/CartContext";
import { useAuth }      from "@/features/auth/context/AuthContext";
import { useAlert }     from "@/shared/context/AlertContext";
import { formatMoneda } from "@/shared/lib/format";
import type {
  CheckoutFormData, DatosContacto, DatosEnvio, DatosPago,
} from "../types";
import type { ResultadoPago } from "../components/StepPago";

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
  /** El descuento se calculó incluyendo el envío en su base. */
  cupon_aplica_envio?: boolean;
  /** Motivo por el que se descartó el cupón que se pidió. */
  cupon_error?:  string | null;
}

const STORAGE_KEY = "cq-checkout";

export const emptyForm: CheckoutFormData = {
  contacto: { nombre: "", apellido: "", email: "", telefono: "", modoGuest: true },
  envio: {
    calle: "", numeroExt: "", numeroInt: "", colonia: "", ciudad: "",
    municipio: "", estado: "", codigoPostal: "", pais: "México",
    referencias: "", empresa: "", guardarDireccion: false,
  },
  pago: { metodo: "tarjeta", nombreTarjeta: "", notas: "" },
};

/** Lo que se respalda entre recargas. */
interface Borrador {
  formData:  CheckoutFormData;
  cupon:     string | null;
  resultado: ResultadoPago | null;
}

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
interface CheckoutContextValue {
  /** false hasta leer el borrador de sessionStorage. */
  hidratado: boolean;

  formData:    CheckoutFormData;
  setContacto: (d: DatosContacto) => void;
  setEnvio:    (d: DatosEnvio)    => void;
  setPago:     (d: DatosPago)     => void;

  cupon:         string | null;
  cuponCargando: boolean;
  cuponEtiqueta: string | null;
  aplicarCupon:  (codigo: string) => Promise<void>;
  quitarCupon:   () => Promise<void>;

  resumen:       ResumenCheckout | null;
  errorResumen:  string | null;
  cargarResumen: (estado: string, codigoCupon: string | null) => Promise<ResumenCheckout | null>;

  resultado:     ResultadoPago | null;
  /** Pago aceptado: guarda el pedido, vacía el carrito y hace las tareas de cuenta. */
  registrarPago: (r: ResultadoPago) => Promise<void>;
  /** Descarta el pedido terminado para empezar una compra nueva. */
  limpiarPedido: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const { items, clearCart } = useCart();
  const { usuario, autenticado, refreshUser } = useAuth();
  const { success, error: alertaError } = useAlert();

  const [hidratado, setHidratado] = useState(false);
  const [formData,  setFormData]  = useState<CheckoutFormData>(emptyForm);

  /** Código de cupón confirmado por el servidor; null si no hay ninguno. */
  const [cupon,         setCupon]         = useState<string | null>(null);
  const [cuponCargando, setCuponCargando] = useState(false);

  /** Importes autoritativos del servidor; null mientras se calculan. */
  const [resumen,      setResumen]      = useState<ResumenCheckout | null>(null);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);

  /** Datos del pedido ya pagado, para la pantalla de confirmación. */
  const [resultado, setResultado] = useState<ResultadoPago | null>(null);

  /* ── Rehidratar el borrador (una sola vez) ──────────────── */
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const b = JSON.parse(raw) as Partial<Borrador>;
        if (b.formData) {
          setFormData({
            contacto: { ...emptyForm.contacto, ...b.formData.contacto },
            envio:    { ...emptyForm.envio,    ...b.formData.envio    },
            pago:     { ...emptyForm.pago,     ...b.formData.pago     },
          });
        }
        if (b.cupon)     setCupon(b.cupon);
        if (b.resultado) setResultado(b.resultado);
      }
    } catch { /* un borrador ilegible no debe romper la compra */ }
    setHidratado(true);
  }, []);

  /* ── Persistir en cada cambio, ya hidratados ────────────── */
  useEffect(() => {
    if (!hidratado) return;
    try {
      const b: Borrador = { formData, cupon, resultado };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(b));
    } catch { /* cuota llena o modo privado: seguir sin respaldo */ }
  }, [hidratado, formData, cupon, resultado]);

  const setContacto = useCallback((contacto: DatosContacto) =>
    setFormData((p) => ({ ...p, contacto })), []);
  const setEnvio = useCallback((envio: DatosEnvio) =>
    setFormData((p) => ({ ...p, envio })), []);
  const setPago = useCallback((pago: DatosPago) =>
    setFormData((p) => ({ ...p, pago })), []);

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

  /* ── Cupones ────────────────────────────────────────────── */
  const aplicarCupon = useCallback(async (codigo: string) => {
    setCuponCargando(true);
    try {
      const data = await cargarResumen(formData.envio.estado, codigo);
      if (!data?.cupon_codigo) return;   // el motivo ya se avisó
      success(
        data.cupon_tipo === "envio_gratis"
          ? "El envío de tu pedido es gratis."
          : data.cupon_aplica_envio
            ? `Ahorras ${formatMoneda(data.descuento, data.moneda)}, envío incluido.`
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
  const registrarPago = useCallback(async (res: ResultadoPago) => {
    setResultado(res);
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

  /**
   * Cierra el pedido terminado. Conserva contacto y envío: si vuelve a
   * comprar en la misma pestaña no tiene que reescribir sus datos.
   */
  const limpiarPedido = useCallback(() => {
    setResultado(null);
    setResumen(null);
    setCupon(null);
    setErrorResumen(null);
  }, []);

  /** Efecto del cupón, para mostrarlo junto al código aplicado. */
  const cuponEtiqueta =
    !resumen                                ? null
    : resumen.cupon_tipo === "envio_gratis" ? "Envío gratis"
    : resumen.descuento > 0                 ? `−${formatMoneda(resumen.descuento, resumen.moneda)}${resumen.cupon_aplica_envio ? " (envío incluido)" : ""}`
    : null;

  return (
    <CheckoutContext.Provider value={{
      hidratado,
      formData, setContacto, setEnvio, setPago,
      cupon, cuponCargando, cuponEtiqueta, aplicarCupon, quitarCupon,
      resumen, errorResumen, cargarResumen,
      resultado, registrarPago, limpiarPedido,
    }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout debe usarse dentro de <CheckoutProvider>");
  return ctx;
}
