// features/products/hooks/usePlanCorte.ts
// ─────────────────────────────────────────────────────────────
// Estado del plan de corte en la ficha. El modal edita un borrador;
// sólo al aplicarlo cambia lo que se agrega al carrito. Valida con
// las mismas reglas del núcleo que usa el cobro: lo que aquí pasa,
// el servidor lo acepta (y cobra igual).
// ─────────────────────────────────────────────────────────────
"use client";

import { useCallback, useMemo, useState } from "react";
import {
  calcularPlanTramos, cargoPlanTramos, normalizarTramos,
} from "@mpeduardo98/commerce-core/personalizacion/tramos";
import type {
  ConfigTramos, PlanTramos, SolicitudTramos,
} from "@mpeduardo98/commerce-core/personalizacion/types";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(n);

/** "1,200 + 800 mm" */
export const textoTramos = (tramos: number[], unidad: string) =>
  `${tramos.map(fmt).join(" + ")} ${unidad}`;

export const formatoMedida = fmt;

export interface Borrador {
  plan:       PlanTramos | null;
  error:      string | null;
  cargo:      number;
  incompleto: boolean;
}

function evaluar(config: ConfigTramos | null, medidas: string[]): Borrador {
  if (!config) return { plan: null, error: null, cargo: 0, incompleto: false };
  const tramos = normalizarTramos(medidas.map((m) => Number(m.replace(",", "."))));
  if (!tramos) return { plan: null, error: null, cargo: 0, incompleto: true };

  const r = calcularPlanTramos(config, tramos);
  return r.ok
    ? { plan: r.valor, error: null, cargo: cargoPlanTramos(config, r.valor), incompleto: false }
    : { plan: null, error: r.error, cargo: 0, incompleto: false };
}

export function usePlanCorte(config: ConfigTramos | null) {
  const [medidas,  setMedidas]  = useState<string[]>([""]);
  const [aplicado, setAplicado] = useState<PlanTramos | null>(null);

  const borrador = useMemo(() => evaluar(config, medidas), [config, medidas]);
  const max      = config?.max_tramos ?? 0;

  const solicitud: SolicitudTramos | null =
    aplicado ? { tipo: "tramos", tramos: aplicado.tramos } : null;

  return {
    medidas,
    borrador,
    /** Plan aplicado: el que se agrega al carrito. null = pieza completa */
    plan:  aplicado,
    cargo: aplicado && config ? cargoPlanTramos(config, aplicado) : 0,
    solicitud,
    puedeAgregar: medidas.length < max,
    aplicar: useCallback(() => {
      if (borrador.plan) setAplicado(borrador.plan);
    }, [borrador.plan]),
    /** Vuelve a pieza completa; el borrador se conserva para retomarlo. */
    quitarPlan: useCallback(() => setAplicado(null), []),
    /** Descarta lo editado en el modal y vuelve al plan aplicado. */
    descartar: useCallback(() => {
      if (aplicado) setMedidas(aplicado.tramos.map(String));
    }, [aplicado]),
    cambiar: (i: number, valor: string) =>
      setMedidas((ms) => ms.map((m, j) => (j === i ? valor : m))),
    agregar: () =>
      setMedidas((ms) => (ms.length < max ? [...ms, ms[ms.length - 1] ?? ""] : ms)),
    quitar: (i: number) =>
      setMedidas((ms) => (ms.length > 1 ? ms.filter((_, j) => j !== i) : [""])),
  };
}

export type EstadoPlanCorte = ReturnType<typeof usePlanCorte>;
