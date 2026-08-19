// features/orders/lib/calcularTotales.ts
// ─────────────────────────────────────────────────────────────
// Fuente ÚNICA de verdad del importe de un pedido.
//
// El navegador sólo puede decir QUÉ variantes y CUÁNTAS. Los
// precios, el envío, el descuento y la moneda se resuelven aquí
// contra la BD. Ninguna ruta debe cobrar un monto que no venga de
// esta función.
// ─────────────────────────────────────────────────────────────
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool }                                     from "@/shared/lib/db/pool";
import { getStorePricing, toStoreCurrency }         from "@/shared/lib/currency/store-currency";
import { cotizarEnvioServer }                       from "@/features/checkout/lib/cotizarEnvioServer";
import type { Moneda }                              from "@/shared/lib/config/store-config";

/** Cualquier cosa capaz de ejecutar SQL: el pool o una conexión en transacción. */
type Ejecutor = Pool | PoolConnection;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export interface ItemSolicitado {
  variante_id: number;
  cantidad:    number;
}

/** Línea ya resuelta contra la BD: precios y snapshot de producto. */
export interface LineaCalculada {
  variante_id:     number;
  cantidad:        number;
  precio_unitario: number;
  precio_original: number;
  total_linea:     number;
  titulo:          string;
  sku:             string;
  imagen_url:      string | null;
}

export interface TotalesCalculados {
  lineas:       LineaCalculada[];
  subtotal:     number;
  descuento:    number;
  costo_envio:  number;
  impuestos:    number;
  total:        number;
  moneda:       Moneda;
  cupon_id:     number | null;
  cupon_codigo: string | null;
}

/** Error de negocio: se traduce a 400 con mensaje legible para el cliente. */
export class ErrorCalculo extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErrorCalculo";
  }
}

export interface ParamsCalculo {
  items:         ItemSolicitado[];
  /** Estado de destino, para recotizar el envío. */
  estado:        string;
  cupon_codigo?: string | null;
  usuario_id?:   number | null;
  /** Ejecutor a usar; por defecto el pool. Pasar la conexión en transacción. */
  db?:           Ejecutor;
}

/**
 * Normaliza y valida lo que mandó el cliente: sólo IDs enteros
 * positivos y cantidades entre 1 y 99. Agrupa duplicados.
 */
function normalizarItems(items: unknown): ItemSolicitado[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ErrorCalculo("El pedido no tiene ítems.");
  }
  if (items.length > 100) {
    throw new ErrorCalculo("Demasiadas líneas en el pedido.");
  }

  const agrupados = new Map<number, number>();
  for (const raw of items) {
    const id   = Number((raw as ItemSolicitado)?.variante_id);
    const cant = Number((raw as ItemSolicitado)?.cantidad);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ErrorCalculo("Ítem inválido en el pedido.");
    }
    if (!Number.isInteger(cant) || cant <= 0 || cant > 99) {
      throw new ErrorCalculo("Cantidad inválida en el pedido.");
    }
    agrupados.set(id, (agrupados.get(id) ?? 0) + cant);
  }

  return [...agrupados].map(([variante_id, cantidad]) => ({ variante_id, cantidad }));
}

/**
 * Calcula el importe real del pedido. Lanza `ErrorCalculo` si algo
 * no cuadra (variante inexistente, producto inactivo, sin stock).
 */
export async function calcularTotales(params: ParamsCalculo): Promise<TotalesCalculados> {
  const db    = params.db ?? pool;
  const items = normalizarItems(params.items);
  const ids   = items.map((i) => i.variante_id);

  // ── 1. Precios y snapshot desde la BD (una sola consulta) ──
  const placeholders = ids.map(() => "?").join(",");
  const [filas] = await db.execute<RowDataPacket[]>(
    `SELECT
       pv.id            AS variante_id,
       pv.sku,
       pv.precio_final,
       pv.precio_original,
       pv.stock,
       pv.vender_sin_existencia,
       p.titulo,
       p.estado         AS producto_estado,
       p.deleted_at,
       (SELECT pi.url
          FROM producto_imagenes pi
         WHERE pi.producto_id = p.id AND pi.variante_id IS NULL
         ORDER BY pi.id ASC
         LIMIT 1)       AS imagen_url
     FROM producto_variantes pv
     INNER JOIN productos p ON p.id = pv.producto_id
     WHERE pv.id IN (${placeholders})`,
    ids
  );

  const porId   = new Map(filas.map((f) => [Number(f.variante_id), f]));
  const pricing = await getStorePricing();

  const lineas: LineaCalculada[] = items.map(({ variante_id, cantidad }) => {
    const fila = porId.get(variante_id);
    if (!fila) {
      throw new ErrorCalculo("Uno de los productos ya no está disponible.");
    }
    if (fila.producto_estado !== "activo" || fila.deleted_at !== null) {
      throw new ErrorCalculo(`"${fila.titulo}" ya no está disponible.`);
    }
    if (!fila.vender_sin_existencia && Number(fila.stock) < cantidad) {
      throw new ErrorCalculo(
        `Sólo quedan ${Number(fila.stock)} unidades de "${fila.titulo}".`
      );
    }

    // Los precios de BD están en moneda de captura; se convierten a la
    // moneda de la tienda igual que en el catálogo, para que lo cobrado
    // coincida con lo que el cliente vio.
    const precioUnitario = toStoreCurrency(fila.precio_final, pricing) ?? 0;
    const precioOriginal = toStoreCurrency(fila.precio_original, pricing) ?? precioUnitario;

    if (precioUnitario <= 0) {
      throw new ErrorCalculo(`"${fila.titulo}" no tiene un precio válido.`);
    }

    return {
      variante_id,
      cantidad,
      precio_unitario: precioUnitario,
      precio_original: precioOriginal,
      total_linea:     round2(precioUnitario * cantidad),
      titulo:          String(fila.titulo),
      sku:             String(fila.sku ?? variante_id),
      imagen_url:      (fila.imagen_url as string | null) ?? null,
    };
  });

  const subtotal = round2(lineas.reduce((s, l) => s + l.total_linea, 0));

  // ── 2. Envío recotizado en servidor ──
  const cotizacion = await cotizarEnvioServer(
    params.estado,
    items.map((i) => ({ variante_id: i.variante_id, cantidad: i.cantidad }))
  );
  let costoEnvio = round2(cotizacion?.costo_total ?? 0);

  // ── 3. Cupón validado en servidor ──
  let cuponId:     number | null = null;
  let cuponCodigo: string | null = null;
  let descuento = 0;

  const codigo = params.cupon_codigo?.trim();
  if (codigo) {
    const [cupRows] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM cupones
       WHERE UPPER(codigo) = UPPER(?)
         AND activo = 1
         AND (valido_desde IS NULL OR valido_desde <= NOW())
         AND (valido_hasta IS NULL OR valido_hasta >= NOW())
         AND (uso_maximo_total IS NULL OR usos_actuales < uso_maximo_total)
       LIMIT 1`,
      [codigo]
    );
    const cupon = cupRows[0];
    if (!cupon) {
      throw new ErrorCalculo("El cupón no es válido o ya expiró.");
    }
    if (cupon.minimo_compra && subtotal < Number(cupon.minimo_compra)) {
      throw new ErrorCalculo(
        `Este cupón requiere una compra mínima de ${Number(cupon.minimo_compra).toFixed(2)}.`
      );
    }
    if (params.usuario_id && Number(cupon.uso_maximo_usuario) > 0) {
      const [usosRows] = await db.execute<RowDataPacket[]>(
        "SELECT COUNT(*) AS usos FROM cupon_usos WHERE cupon_id = ? AND usuario_id = ?",
        [cupon.id, params.usuario_id]
      );
      if (Number(usosRows[0]?.usos ?? 0) >= Number(cupon.uso_maximo_usuario)) {
        throw new ErrorCalculo("Ya usaste este cupón el máximo de veces permitido.");
      }
    }

    cuponId     = Number(cupon.id);
    cuponCodigo = String(cupon.codigo);

    if (cupon.tipo === "porcentaje") {
      descuento = subtotal * (Number(cupon.valor) / 100);
      if (cupon.maximo_descuento) {
        descuento = Math.min(descuento, Number(cupon.maximo_descuento));
      }
    } else if (cupon.tipo === "monto_fijo") {
      descuento = Math.min(Number(cupon.valor), subtotal);
    } else if (cupon.tipo === "envio_gratis") {
      // El envío gratis se refleja poniendo el costo en 0, no como un
      // descuento sobre la mercancía: así el desglose es honesto.
      descuento  = 0;
      costoEnvio = 0;
    }
    descuento = round2(Math.max(0, descuento));
  }

  const impuestos = 0; // IVA incluido en el precio de lista
  const total     = round2(Math.max(0, subtotal - descuento) + costoEnvio + impuestos);

  if (total <= 0) {
    throw new ErrorCalculo("El total del pedido debe ser mayor a cero.");
  }

  return {
    lineas,
    subtotal,
    descuento,
    costo_envio:  costoEnvio,
    impuestos,
    total,
    moneda:       pricing.monedaTienda,
    cupon_id:     cuponId,
    cupon_codigo: cuponCodigo,
  };
}
