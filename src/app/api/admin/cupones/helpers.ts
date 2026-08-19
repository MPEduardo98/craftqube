// app/api/admin/cupones/helpers.ts
// Utilidades compartidas por las rutas de cupones del panel admin.
import type { RowDataPacket } from "mysql2";

export const TIPOS_VALIDOS  = ["porcentaje", "monto_fijo", "envio_gratis", "2x1"];
export const APLICA_VALIDOS = ["todos", "categoria", "producto", "primera_compra"];

/** Proyección del listado: los datos del cupón + lo acumulado en cupon_usos. */
export const SELECT_CUPONES = `
  SELECT
    c.id, c.codigo, c.descripcion, c.tipo, c.valor,
    c.minimo_compra, c.maximo_descuento,
    c.uso_maximo_total, c.uso_maximo_usuario, c.usos_actuales,
    c.aplica_a, c.aplica_ids, c.activo,
    c.valido_desde, c.valido_hasta, c.created_at,
    COALESCE((SELECT SUM(u.descuento) FROM cupon_usos u WHERE u.cupon_id = c.id), 0) AS descuento_total
  FROM cupones c
`;

/**
 * Normaliza una fila cruda: `aplica_ids` se guarda como JSON (longtext) y el
 * driver lo devuelve como string o ya parseado según la versión de MariaDB.
 */
export function normalizarCupon(row: RowDataPacket) {
  let aplicaIds: number[] | null = null;
  const raw = row.aplica_ids;
  if (Array.isArray(raw)) {
    aplicaIds = raw.map(Number).filter(Boolean);
  } else if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) aplicaIds = parsed.map(Number).filter(Boolean);
    } catch { aplicaIds = null; }
  }

  return {
    ...row,
    valor:            Number(row.valor),
    minimo_compra:    row.minimo_compra    == null ? null : Number(row.minimo_compra),
    maximo_descuento: row.maximo_descuento == null ? null : Number(row.maximo_descuento),
    uso_maximo_total: row.uso_maximo_total == null ? null : Number(row.uso_maximo_total),
    uso_maximo_usuario: Number(row.uso_maximo_usuario),
    usos_actuales:      Number(row.usos_actuales),
    descuento_total:    Number(row.descuento_total ?? 0),
    activo:             Number(row.activo),
    aplica_ids:         aplicaIds,
  };
}

/** `datetime-local` (o ISO) → formato DATETIME de MySQL. Devuelve null si no es válido. */
export function toMysqlDatetime(v: unknown): string | null {
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
