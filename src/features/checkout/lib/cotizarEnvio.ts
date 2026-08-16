// features/checkout/lib/cotizarEnvio.ts
// ─────────────────────────────────────────────────────────────
// Motor de cálculo de envío (Paquetexpress, modelo de guías).
// Función PURA: recibe ítems ya leídos de BD + tarifa de la zona
// + topes; no toca la base de datos (testeable).
//
//   1 guía = hasta `pesoMaxKg` y `volMaxM3`  → cuesta `precioGuia`
//   Ítem que excede `dimMaxCm` en cualquier lado → no cabe en guía,
//   se cobra por flete (base + $/kg).
// ─────────────────────────────────────────────────────────────

export interface EnvioCaps {
  pesoMaxKg: number;
  volMaxM3:  number;
  dimMaxCm:  number;
}

export interface EnvioTarifa {
  precioGuia: number;
  fleteBase:  number;
  fletePorKg: number;
}

/** Ítem con unidades crudas tal como vienen de producto_envio */
export interface EnvioItemRaw {
  cantidad:      number;
  peso:          number | null;
  peso_unidad:   string | null;
  largo:         number | null;
  ancho:         number | null;
  alto:          number | null;
  medida_unidad: string | null;
}

export interface EnvioBreakdown {
  guias:                 number;
  peso_total_kg:         number;
  volumen_total_m3:      number;
  costo_guias:           number;
  costo_flete:           number;
  costo_total:           number;
  hay_sobredimensionado: boolean;
}

const PESO_A_KG: Record<string, number> = { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 };
const MEDIDA_A_CM: Record<string, number> = { cm: 1, mm: 0.1, m: 100, in: 2.54 };

export const aKg = (valor: number | null | undefined, unidad: string | null | undefined): number => {
  const v = Number(valor) || 0;
  return v * (PESO_A_KG[unidad ?? "kg"] ?? 1);
};

export const aCm = (valor: number | null | undefined, unidad: string | null | undefined): number => {
  const v = Number(valor) || 0;
  return v * (MEDIDA_A_CM[unidad ?? "cm"] ?? 1);
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function calcularEnvio(
  items: EnvioItemRaw[],
  tarifa: EnvioTarifa,
  caps: EnvioCaps,
): EnvioBreakdown {
  let pesoNormKg = 0, volNormM3 = 0;
  let pesoOverKg = 0, volOverM3 = 0;
  let normalCount = 0, overCount = 0;

  for (const it of items) {
    const cant = Math.max(1, Number(it.cantidad) || 1);
    const pesoKg = aKg(it.peso, it.peso_unidad);
    const lCm = aCm(it.largo, it.medida_unidad);
    const wCm = aCm(it.ancho, it.medida_unidad);
    const hCm = aCm(it.alto,  it.medida_unidad);
    const volM3 = (lCm * wCm * hCm) / 1_000_000;

    const sobredimensionado =
      lCm > caps.dimMaxCm || wCm > caps.dimMaxCm || hCm > caps.dimMaxCm;

    if (sobredimensionado) {
      pesoOverKg += pesoKg * cant;
      volOverM3  += volM3  * cant;
      overCount  += cant;
    } else {
      pesoNormKg += pesoKg * cant;
      volNormM3  += volM3  * cant;
      normalCount += cant;
    }
  }

  // Guías para ítems normales
  let guias = 0;
  if (normalCount > 0) {
    const porPeso = caps.pesoMaxKg > 0 ? pesoNormKg / caps.pesoMaxKg : 0;
    const porVol  = caps.volMaxM3  > 0 ? volNormM3  / caps.volMaxM3  : 0;
    guias = Math.max(1, Math.ceil(Math.max(porPeso, porVol)));
  }
  const costoGuias = round2(guias * tarifa.precioGuia);

  // Flete para sobredimensionados
  const costoFlete = overCount > 0
    ? round2(tarifa.fleteBase + pesoOverKg * tarifa.fletePorKg)
    : 0;

  return {
    guias,
    peso_total_kg:         round2(pesoNormKg + pesoOverKg),
    volumen_total_m3:      round2(volNormM3 + volOverM3),
    costo_guias:           costoGuias,
    costo_flete:           costoFlete,
    costo_total:           round2(costoGuias + costoFlete),
    hay_sobredimensionado: overCount > 0,
  };
}
