// app/api/checkout/pagar/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/checkout/pagar
//
// Única puerta de entrada al cobro. Sustituye a las tres rutas
// /api/stripe/create-*-payment, que aceptaban el importe desde el
// navegador.
//
// Orden correcto de las operaciones:
//   1. Crear el pedido en `pendiente_pago` con totales de servidor
//   2. Crear el PaymentIntent por ESE total
//   3. Guardar el PaymentIntent en el pedido (referencia_pago)
//   4. Devolver al cliente lo que necesita para completar el pago
//
// Así nunca existe un cobro sin pedido, y el webhook siempre puede
// encontrar a quién acreditarle el pago.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import Stripe                        from "stripe";
import { pool }                      from "@/shared/lib/db/pool";
import type { RowDataPacket }        from "mysql2";
import {
  getStripe,
  aUnidadMinima,
  OXXO_MONTO_MAXIMO_MXN,
  OXXO_DIAS_VIGENCIA,
} from "@/shared/lib/stripe/client";
import { montoMinimoStripe }         from "@/shared/lib/stripe/montos";
import { formatMoneda }              from "@/shared/lib/format";
import {
  createPedido,
  enlazarPaymentIntent,
  getReferenciaPago,
} from "@/features/orders/lib/createPedido";
import { ErrorCalculo }                    from "@/features/orders/lib/calcularTotales";
import { getSessionUser }                  from "@/features/auth/lib/getSessionUser";
import { consumirLimite, ipDeRequest }     from "@/shared/lib/rate-limit";
import type { MetodoPago, Pedido }         from "@/features/orders/types/order";

export const dynamic = "force-dynamic";

const METODOS_VALIDOS: MetodoPago[] = ["tarjeta", "transferencia", "oxxo"];

/** OXXO y SPEI son productos mexicanos: sólo operan en MXN. */
const SOLO_MXN: MetodoPago[] = ["oxxo", "transferencia"];

interface CuerpoPago {
  metodo:        MetodoPago;
  /** Reintento sobre un pedido ya creado (p. ej. tarjeta rechazada). */
  pedidoId?:     number;
  contacto:      { nombre: string; apellido: string; email: string; telefono?: string };
  envio: {
    calle: string; numeroExt: string; numeroInt?: string; colonia: string;
    ciudad: string; municipio?: string; estado: string; codigoPostal: string;
    pais: string; referencias?: string; empresa?: string;
  };
  items:         { variante_id: number; cantidad: number }[];
  cupon_codigo?: string;
  notas?:        string;
}

function errorNegocio(mensaje: string, status = 400) {
  return NextResponse.json({ success: false, error: mensaje }, { status });
}

/**
 * Recupera el PaymentIntent de un pedido si sigue siendo utilizable.
 * Evita crear un PaymentIntent nuevo cada vez que el cliente reintenta.
 */
async function paymentIntentReutilizable(
  stripe: Stripe,
  referencia: string | null
): Promise<Stripe.PaymentIntent | null> {
  if (!referencia) return null;
  try {
    const pi = await stripe.paymentIntents.retrieve(referencia);
    const reutilizables: Stripe.PaymentIntent.Status[] = [
      "requires_payment_method",
      "requires_confirmation",
      "requires_action",
      "processing",
    ];
    return reutilizables.includes(pi.status) ? pi : null;
  } catch {
    return null;
  }
}

/**
 * Anula un PaymentIntent que ya no se va a usar (el comprador cambió
 * de método). Si Stripe ya no permite cancelarlo —porque se pagó o
 * está en curso— se ignora: ese caso lo resuelve el webhook.
 */
async function cancelarPaymentIntent(stripe: Stripe, referencia: string | null): Promise<void> {
  if (!referencia) return;
  try {
    await stripe.paymentIntents.cancel(referencia, { cancellation_reason: "requested_by_customer" });
  } catch (err) {
    console.warn(`[checkout] No se pudo cancelar el PaymentIntent ${referencia}:`, err);
  }
}

/** Datos del voucher OXXO tal como los espera la pantalla de confirmación. */
function extraerOxxo(pi: Stripe.PaymentIntent) {
  const detalles = pi.next_action?.oxxo_display_details;
  if (!detalles?.number) return null;
  return {
    numero:           detalles.number,
    expira:           detalles.expires_after,
    hostedVoucherUrl: detalles.hosted_voucher_url ?? null,
  };
}

/** Datos de transferencia SPEI (CLABE + referencia). */
function extraerSpei(pi: Stripe.PaymentIntent, monto: number) {
  const transferencia = pi.next_action?.display_bank_transfer_instructions;
  if (!transferencia) return null;

  const direccion = transferencia.financial_addresses?.find((a) => a.type === "spei");
  const spei      = direccion?.spei;

  return {
    clabe:                 spei?.clabe ?? null,
    banco:                 spei?.bank_name ?? "Banco asignado por Stripe",
    referencia:            transferencia.reference ?? null,
    monto,
    hostedInstructionsUrl: transferencia.hosted_instructions_url ?? null,
  };
}

export async function POST(req: NextRequest) {
  // ── Freno de abuso ──
  const ip = ipDeRequest(req);
  const limite = consumirLimite(`pagar:${ip}`, 12, 60_000);
  if (!limite.permitido) {
    return NextResponse.json(
      { success: false, error: "Demasiados intentos. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(limite.esperaSegundos) } }
    );
  }

  let cuerpo: CuerpoPago;
  try {
    cuerpo = await req.json();
  } catch {
    return errorNegocio("Petición inválida.");
  }

  const metodo = cuerpo.metodo;
  if (!METODOS_VALIDOS.includes(metodo)) {
    return errorNegocio("Método de pago no soportado.");
  }

  const email = cuerpo.contacto?.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return errorNegocio("Necesitamos un correo electrónico válido.");
  }
  if (!cuerpo.envio?.estado?.trim()) {
    return errorNegocio("Falta el estado de envío.");
  }

  const usuario   = await getSessionUser();
  const usuarioId = usuario?.id ? Number(usuario.id) : undefined;

  try {
    const stripe = getStripe();

    // ── 1. Pedido: reusar el del reintento o crear uno nuevo ──
    let pedido: Pedido | null = null;

    if (cuerpo.pedidoId) {
      const [[fila]] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM pedidos WHERE id = ? LIMIT 1",
        [Number(cuerpo.pedidoId)]
      );
      // Sólo se reutiliza si sigue sin pagar y es del mismo comprador:
      // el id de pedido viaja por el navegador y no es un secreto.
      if (
        fila &&
        fila.estado === "pendiente_pago" &&
        String(fila.email).toLowerCase() === email
      ) {
        pedido = fila as Pedido;

        // Cambio de método sobre el mismo carrito: se reaprovecha el
        // pedido y se anula el PaymentIntent anterior. Crear un pedido
        // nuevo dejaría el otro colgado en `pendiente_pago` reteniendo
        // stock que nadie va a pagar.
        if (fila.metodo_pago !== metodo) {
          // Se desliga PRIMERO y se cancela después: así, cuando llegue
          // el evento `payment_intent.canceled`, el webhook ve que ese
          // PaymentIntent ya no es el activo del pedido y lo ignora en
          // lugar de cancelar una compra que sigue viva.
          await pool.execute(
            "UPDATE pedidos SET metodo_pago = ?, referencia_pago = NULL WHERE id = ?",
            [metodo, fila.id]
          );
          await cancelarPaymentIntent(stripe, fila.referencia_pago);
          pedido = { ...(fila as Pedido), metodo_pago: metodo, referencia_pago: null };
        }
      }
    }

    if (!pedido) {
      pedido = await createPedido({
        usuario_id:      usuarioId,
        email,
        telefono:        cuerpo.contacto.telefono || undefined,
        direccion_envio: {
          nombre:        cuerpo.contacto.nombre,
          apellido:      cuerpo.contacto.apellido,
          empresa:       cuerpo.envio.empresa || undefined,
          telefono:      cuerpo.contacto.telefono || undefined,
          calle:         cuerpo.envio.calle,
          numero_ext:    cuerpo.envio.numeroExt,
          numero_int:    cuerpo.envio.numeroInt || undefined,
          colonia:       cuerpo.envio.colonia,
          ciudad:        cuerpo.envio.ciudad,
          municipio:     cuerpo.envio.municipio || undefined,
          estado:        cuerpo.envio.estado,
          codigo_postal: cuerpo.envio.codigoPostal,
          pais:          cuerpo.envio.pais,
          referencias:   cuerpo.envio.referencias || undefined,
        },
        items:         cuerpo.items ?? [],
        metodo_pago:   metodo,
        cupon_codigo:  cuerpo.cupon_codigo || undefined,
        notas_cliente: cuerpo.notas || undefined,
        ip_origen:     ip !== "desconocida" ? ip : undefined,
      });
    }

    if (!pedido) {
      return errorNegocio("No se pudo crear el pedido. Inténtalo de nuevo.", 500);
    }

    const total  = Number(pedido.total);
    const moneda = String(pedido.moneda ?? "MXN").toUpperCase();

    // Stripe rechaza importes por debajo del mínimo de la moneda
    // (`amount_too_small`). `createPedido` ya lo impide al crear, pero
    // un pedido reutilizado —creado antes, o con un cupón que desde
    // entonces come casi todo el total— puede llegar aquí por debajo.
    const minimo = montoMinimoStripe(moneda);
    if (total < minimo) {
      return errorNegocio(
        `El importe mínimo para pagar en línea es ${formatMoneda(minimo, moneda)}. ` +
        `Agrega algo más a tu carrito para continuar.`
      );
    }

    // OXXO y SPEI no existen fuera de MXN: mejor decirlo que fallar feo.
    if (SOLO_MXN.includes(metodo) && moneda !== "MXN") {
      return errorNegocio(
        "Este método de pago sólo está disponible para cobros en pesos mexicanos."
      );
    }
    if (metodo === "oxxo" && total > OXXO_MONTO_MAXIMO_MXN) {
      return errorNegocio(
        `OXXO admite pagos de hasta $${OXXO_MONTO_MAXIMO_MXN.toLocaleString("es-MX")} MXN. ` +
        `Elige tarjeta o transferencia para este pedido.`
      );
    }

    const metadata = {
      pedido_id:     String(pedido.id),
      pedido_numero: String(pedido.numero),
      email,
    };

    // ── 2. PaymentIntent (reutilizando el del pedido si sigue vivo) ──
    let pi = await paymentIntentReutilizable(stripe, pedido.referencia_pago);

    if (!pi) {
      const nuevo = await crearPaymentIntent(stripe, {
        metodo,
        total,
        moneda,
        metadata,
        email,
        nombre: `${cuerpo.contacto.nombre} ${cuerpo.contacto.apellido}`.trim() || "Cliente",
      });

      // ── 3. Enlazar pago ↔ pedido ANTES de responder ──
      if (await enlazarPaymentIntent(Number(pedido.id), nuevo.id)) {
        pi = nuevo;
      } else {
        // Otra petición simultánea se adelantó y ya enlazó su propio
        // PaymentIntent. Se anula el nuestro —si no, quedarían dos
        // cobros vivos para el mismo pedido— y se sigue con el suyo.
        await cancelarPaymentIntent(stripe, nuevo.id);
        const ganador = await getReferenciaPago(Number(pedido.id));
        if (!ganador) return errorNegocio("No pudimos iniciar el pago. Inténtalo de nuevo.", 500);
        pi = await stripe.paymentIntents.retrieve(ganador);
      }
    }

    // ── 4. Respuesta según método ──
    const base = {
      success: true,
      pedido: {
        id:     Number(pedido.id),
        numero: String(pedido.numero),
        total,
        moneda,
      },
      metodo,
    };

    if (metodo === "tarjeta") {
      return NextResponse.json({ ...base, clientSecret: pi.client_secret });
    }

    if (metodo === "oxxo") {
      const oxxo = extraerOxxo(pi);
      if (!oxxo) return errorNegocio("No se pudo generar el voucher OXXO.", 502);
      return NextResponse.json({ ...base, oxxo });
    }

    const spei = extraerSpei(pi, total);
    if (!spei?.clabe) return errorNegocio("No se pudo generar la CLABE para la transferencia.", 502);
    return NextResponse.json({ ...base, spei });

  } catch (err) {
    if (err instanceof ErrorCalculo) {
      return errorNegocio(err.message);
    }
    // Los errores de tarjeta de Stripe sí son útiles para el comprador.
    if (err instanceof Stripe.errors.StripeCardError) {
      return errorNegocio(err.message ?? "La tarjeta fue rechazada.");
    }
    console.error("[POST /api/checkout/pagar]", err);
    return errorNegocio("No pudimos procesar el pago. Inténtalo de nuevo.", 500);
  }
}

/** Crea el PaymentIntent adecuado al método elegido. */
async function crearPaymentIntent(
  stripe: Stripe,
  args: {
    metodo:   MetodoPago;
    total:    number;
    moneda:   string;
    metadata: Record<string, string>;
    email:    string;
    nombre:   string;
  }
): Promise<Stripe.PaymentIntent> {
  const { metodo, total, moneda, metadata, email, nombre } = args;

  const comun: Stripe.PaymentIntentCreateParams = {
    amount:        aUnidadMinima(total),
    currency:      moneda.toLowerCase(),
    description:   `Pedido ${metadata.pedido_numero} · CraftQube`,
    receipt_email: email,
    metadata,
  };

  // Sin clave de idempotencia a propósito: el cerrojo está en la BD
  // (enlazarPaymentIntent). Una clave por pedido+método devolvía de la
  // caché de Stripe el PaymentIntent ya CANCELADO cuando el comprador
  // volvía a un método que había descartado antes.

  if (metodo === "tarjeta") {
    return stripe.paymentIntents.create(
      {
        ...comun,
        // Sólo tarjeta: se confirma en el navegador con confirmCardPayment,
        // que resuelve 3D Secure en modal (sin redirección).
        payment_method_types: ["card"],
      }
    );
  }

  if (metodo === "oxxo") {
    return stripe.paymentIntents.create(
      {
        ...comun,
        payment_method_types: ["oxxo"],
        payment_method_data: {
          type: "oxxo",
          billing_details: { name: nombre, email },
        },
        payment_method_options: {
          // Explícito: la UI promete 72 h de vigencia.
          oxxo: { expires_after_days: OXXO_DIAS_VIGENCIA },
        },
        confirm: true,
      }
    );
  }

  // Transferencia SPEI vía customer_balance: exige un Customer.
  const customer = await resolverCustomer(stripe, email, nombre);

  return stripe.paymentIntents.create(
    {
      ...comun,
      customer:             customer.id,
      payment_method_types: ["customer_balance"],
      payment_method_data:  { type: "customer_balance" },
      payment_method_options: {
        customer_balance: {
          funding_type:  "bank_transfer",
          bank_transfer: { type: "mx_bank_transfer" },
        },
      },
      confirm: true,
    }
  );
}

/**
 * Busca el Customer por metadata propia en vez de por `email` suelto.
 * `customers.list({ email })` devolvía el Customer de cualquiera que
 * conociera ese correo; aquí el email va normalizado y el registro
 * queda marcado como creado por la tienda.
 */
async function resolverCustomer(
  stripe: Stripe,
  email: string,
  nombre: string
): Promise<Stripe.Customer> {
  const encontrados = await stripe.customers.search({
    query: `email:'${email.replace(/'/g, "")}' AND metadata['origen']:'craftqube'`,
    limit: 1,
  });
  if (encontrados.data.length > 0) return encontrados.data[0];

  return stripe.customers.create({
    email,
    name:     nombre,
    metadata: { origen: "craftqube" },
  });
}
