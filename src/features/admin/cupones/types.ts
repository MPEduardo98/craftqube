// features/admin/cupones/types.ts
// Tipos y catálogos compartidos del módulo de cupones admin
import type { CuponTipo, CuponAplica } from "@/shared/types/commerce";

export type { CuponTipo, CuponAplica };

/** Fila de la tabla de cupones (proyección del listado). */
export interface CuponRow {
  id:                 number;
  codigo:             string;
  descripcion:        string | null;
  tipo:               CuponTipo;
  valor:              number;
  minimo_compra:      number | null;
  maximo_descuento:   number | null;
  uso_maximo_total:   number | null;
  uso_maximo_usuario: number;
  usos_actuales:      number;
  aplica_a:           CuponAplica;
  aplica_ids:         number[] | null;
  activo:             number | boolean;
  valido_desde:       string | null;
  valido_hasta:       string | null;
  created_at:         string;
  /** Descuento total acumulado en cupon_usos (viene del JOIN del listado). */
  descuento_total:    number;
}

/** Estado derivado de la vigencia + activo + agotamiento. */
export type CuponEstado = "activo" | "inactivo" | "programado" | "expirado" | "agotado";

export function cuponEstado(c: CuponRow, ahora: Date = new Date()): CuponEstado {
  if (!Number(c.activo)) return "inactivo";
  if (c.valido_desde && new Date(c.valido_desde) > ahora) return "programado";
  if (c.valido_hasta && new Date(c.valido_hasta) < ahora) return "expirado";
  if (c.uso_maximo_total != null && Number(c.usos_actuales) >= Number(c.uso_maximo_total)) return "agotado";
  return "activo";
}

export function estadoMeta(estado: CuponEstado): { label: string; color: string; bg: string } {
  switch (estado) {
    case "activo":     return { label: "ACTIVO",     color: "#059669", bg: "rgba(5,150,105,0.10)"   };
    case "programado": return { label: "PROGRAMADO", color: "#2563eb", bg: "rgba(37,99,235,0.10)"   };
    case "expirado":   return { label: "EXPIRADO",   color: "#dc2626", bg: "rgba(220,38,38,0.10)"   };
    case "agotado":    return { label: "AGOTADO",    color: "#d97706", bg: "rgba(217,119,6,0.10)"   };
    default:           return { label: "INACTIVO",   color: "#64748b", bg: "rgba(100,116,139,0.10)" };
  }
}

export const TIPO_LABEL: Record<CuponTipo, string> = {
  porcentaje:   "Porcentaje",
  monto_fijo:   "Monto fijo",
  envio_gratis: "Envío gratis",
  "2x1":        "2x1",
};

export const APLICA_LABEL: Record<CuponAplica, string> = {
  todos:          "Todo el catálogo",
  categoria:      "Categorías",
  producto:       "Productos",
  primera_compra: "Primera compra",
};

/** Etiqueta corta del valor del cupón según su tipo. */
export function valorLabel(c: Pick<CuponRow, "tipo" | "valor">): string {
  if (c.tipo === "porcentaje")   return `${Number(c.valor)}%`;
  if (c.tipo === "envio_gratis") return "Envío gratis";
  if (c.tipo === "2x1")          return "2x1";
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(Number(c.valor));
}
