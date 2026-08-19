// shared/lib/rate-limit.ts
// ─────────────────────────────────────────────────────────────
// Limitador de tasa en memoria, por proceso.
//
// Alcance honesto: en serverless cada instancia tiene su propio
// contador, así que esto NO es una defensa dura — es un freno
// barato contra el abuso trivial (scripts que martillean el
// endpoint de pago creando PaymentIntents y Customers en Stripe).
// Para límites reales hace falta un store compartido (Redis/Upstash).
// ─────────────────────────────────────────────────────────────

interface Ventana {
  conteo: number;
  /** epoch ms en que la ventana se reinicia */
  reinicio: number;
}

const ventanas = new Map<string, Ventana>();

/** Evita que el Map crezca sin límite en procesos de larga vida. */
function purgar(ahora: number) {
  if (ventanas.size < 5_000) return;
  for (const [clave, v] of ventanas) {
    if (v.reinicio <= ahora) ventanas.delete(clave);
  }
}

export interface ResultadoLimite {
  permitido: boolean;
  /** Segundos hasta que se libere el límite. */
  esperaSegundos: number;
}

/**
 * Consume una unidad del cupo de `clave`.
 * @param limite    peticiones permitidas por ventana
 * @param ventanaMs duración de la ventana
 */
export function consumirLimite(
  clave: string,
  limite: number,
  ventanaMs: number
): ResultadoLimite {
  const ahora = Date.now();
  purgar(ahora);

  const actual = ventanas.get(clave);

  if (!actual || actual.reinicio <= ahora) {
    ventanas.set(clave, { conteo: 1, reinicio: ahora + ventanaMs });
    return { permitido: true, esperaSegundos: 0 };
  }

  actual.conteo += 1;
  if (actual.conteo > limite) {
    return {
      permitido: false,
      esperaSegundos: Math.max(1, Math.ceil((actual.reinicio - ahora) / 1000)),
    };
  }
  return { permitido: true, esperaSegundos: 0 };
}

/** IP del cliente a partir de las cabeceras del proxy. */
export function ipDeRequest(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "desconocida";
}
