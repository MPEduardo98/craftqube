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
import { resolverCupon }                            from "./resolverCupon";
import type { Moneda }                              from "@/shared/lib/config/store-config";
import type { CuponTipo }                           from "@/shared/types/commerce";

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
  producto_id:     number;
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
  cupon_tipo:   CuponTipo | null;
  /**
   * Sólo en modo tolerante: por qué se descartó el cupón que pidió el
   * cliente. El resto del desglose sigue siendo válido.
   */
  cupon_error:  string | null;
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
  /** Correo del comprador; identifica al invitado en cupones de primera compra. */
  email?:        string | null;
  /**
   * Vista previa: un cupón inválido no rompe el cálculo, se descarta y
   * el motivo viaja en `cupon_error`. Al crear el pedido se deja en
   * false para que un cupón que dejó de ser válido aborte el cobro.
   */
  cupon_tolerante?: boolean;
  /**
   * Bloquea la fila del cupón hasta que termine la transacción, para
   * que dos pedidos simultáneos no gasten el mismo código de un solo
   * uso. Requiere pasar `db` con la conexión de la transacción.
   */
  bloquear_cupon?: boolean;
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
       p.id             AS producto_id,
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
      producto_id:     Number(fila.producto_id),
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
  let cuponId:     number | null    = null;
  let cuponCodigo: string | null    = null;
  let cuponTipo:   CuponTipo | null = null;
  let cuponError:  string | null    = null;
  let descuento = 0;

  const codigo = params.cupon_codigo?.trim();
  if (codigo) {
    const resultado = await resolverCupon({
      codigo,
      lineas: lineas.map((l) => ({
        variante_id:     l.variante_id,
        producto_id:     l.producto_id,
        cantidad:        l.cantidad,
        precio_unitario: l.precio_unitario,
        total_linea:     l.total_linea,
      })),
      subtotal,
      costo_envio: costoEnvio,
      pricing,
      usuario_id:  params.usuario_id ?? null,
      email:       params.email ?? null,
      bloquear:    params.bloquear_cupon ?? false,
      db,
    });

    if (resultado.ok) {
      cuponId     = resultado.cupon_id;
      cuponCodigo = resultado.codigo;
      cuponTipo   = resultado.tipo;
      descuento   = resultado.descuento;
      costoEnvio  = resultado.costo_envio;
    } else if (params.cupon_tolerante) {
      // Vista previa: se descarta el cupón y el resto del desglose
      // sigue en pie. Quien llama avisa al comprador.
      cuponError = resultado.error;
    } else {
      throw new ErrorCalculo(resultado.error);
    }
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
    cupon_tipo:   cuponTipo,
    cupon_error:  cuponError,
  };
}
