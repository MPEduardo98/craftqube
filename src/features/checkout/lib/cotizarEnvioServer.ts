// features/checkout/lib/cotizarEnvioServer.ts
// ─────────────────────────────────────────────────────────────
// Cotización de envío contra la BD. Vive aquí (y no dentro de la
// ruta /api/envio/cotizar) porque el cálculo del total del pedido
// TAMBIÉN necesita recotizar el envío en el servidor: el costo que
// manda el navegador no es de fiar.
// ─────────────────────────────────────────────────────────────
import { pool }               from "@/shared/lib/db/pool";
import type { RowDataPacket } from "mysql2";
import {
  calcularEnvio,
  type EnvioItemRaw,
  type EnvioCaps,
  type EnvioTarifa,
} from "./cotizarEnvio";
import type { CotizacionEnvio } from "@/shared/types/commerce";

const CAPS_FALLBACK: EnvioCaps = { pesoMaxKg: 5, volMaxM3: 0.0109, dimMaxCm: 27 };

export interface ItemCotizable {
  variante_id: number;
  cantidad:    number;
}

/**
 * Calcula el costo de envío a un estado para un conjunto de ítems.
 * Los pesos y dimensiones salen de `producto_envio`; nada de esto
 * se acepta desde el cliente.
 */
export async function cotizarEnvioServer(
  estado: string,
  items:  ItemCotizable[]
): Promise<CotizacionEnvio | null> {
  const varianteIds = items
    .map((i) => Number(i.variante_id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!estado.trim() || varianteIds.length === 0) return null;

  // 1. Resolver zona por estado (fallback: cualquier zona activa)
  const [[zonaEstado]] = await pool.execute<RowDataPacket[]>(
    `SELECT z.id, z.nombre
     FROM zona_estados ze
     INNER JOIN zonas_envio z ON z.id = ze.zona_id AND z.activa = 1
     WHERE ze.estado = ?
     LIMIT 1`,
    [estado]
  );
  let zona = zonaEstado ?? null;
  if (!zona) {
    const [[fallback]] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nombre FROM zonas_envio WHERE activa = 1 ORDER BY id ASC LIMIT 1"
    );
    zona = fallback ?? null;
  }

  // 2. Tarifas de la zona (por_guia y flete)
  const tarifa: EnvioTarifa = { precioGuia: 0, fleteBase: 0, fletePorKg: 0 };
  if (zona) {
    const [tarifas] = await pool.execute<RowDataPacket[]>(
      "SELECT tipo_calculo, precio_base, precio_por_kg FROM tarifas_envio WHERE zona_id = ? AND activa = 1",
      [zona.id]
    );
    for (const t of tarifas) {
      if (t.tipo_calculo === "por_guia") tarifa.precioGuia = Number(t.precio_base) || 0;
      if (t.tipo_calculo === "flete") {
        tarifa.fleteBase  = Number(t.precio_base) || 0;
        tarifa.fletePorKg = Number(t.precio_por_kg) || 0;
      }
    }
  }

  // 3. Topes de guía (configuracion)
  const [cfgRows] = await pool.execute<RowDataPacket[]>(
    "SELECT clave, valor FROM configuracion WHERE clave IN ('envio_peso_max_kg','envio_volumen_max_m3','envio_dim_max_cm')"
  );
  const cfg = new Map(cfgRows.map((r) => [r.clave as string, Number(r.valor)]));
  const caps: EnvioCaps = {
    pesoMaxKg: cfg.get("envio_peso_max_kg")    || CAPS_FALLBACK.pesoMaxKg,
    volMaxM3:  cfg.get("envio_volumen_max_m3") || CAPS_FALLBACK.volMaxM3,
    dimMaxCm:  cfg.get("envio_dim_max_cm")     || CAPS_FALLBACK.dimMaxCm,
  };

  // 4. Peso/dimensiones por ítem (producto_envio)
  const cantPorVariante = new Map(
    items.map((i) => [Number(i.variante_id), Math.max(1, Number(i.cantidad) || 1)])
  );
  const placeholders = varianteIds.map(() => "?").join(",");
  const [envRows] = await pool.execute<RowDataPacket[]>(
    `SELECT v.id AS variante_id,
            e.peso, e.peso_unidad, e.largo, e.ancho, e.alto, e.medida_unidad
     FROM producto_variantes v
     LEFT JOIN producto_envio e ON e.producto_id = v.producto_id
     WHERE v.id IN (${placeholders})`,
    varianteIds
  );

  const itemsRaw: EnvioItemRaw[] = envRows.map((r) => ({
    cantidad:      cantPorVariante.get(r.variante_id as number) ?? 1,
    peso:          r.peso,
    peso_unidad:   r.peso_unidad,
    largo:         r.largo,
    ancho:         r.ancho,
    alto:          r.alto,
    medida_unidad: r.medida_unidad,
  }));

  // 5. Calcular
  const breakdown = calcularEnvio(itemsRaw, tarifa, caps);

  return {
    zona:    zona?.nombre ?? null,
    zona_id: zona?.id ?? null,
    ...breakdown,
  };
}
