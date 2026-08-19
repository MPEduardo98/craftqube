// features/orders/lib/createPedido.ts
// ─────────────────────────────────────────────────────────────
// Crea un pedido completo en la BD dentro de una transacción:
// totales calculados en servidor, ítems, stock, cupón e historial.
//
// El pedido nace SIEMPRE en `pendiente_pago`. Es el webhook de
// Stripe —y sólo él— quien lo mueve a `pago_recibido`.
// ─────────────────────────────────────────────────────────────
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { pool }                          from "@/shared/lib/db/pool";
import { formatMoneda }                  from "@/shared/lib/format";
import { calcularTotales, ErrorCalculo } from "./calcularTotales";
import type { CrearPedidoPayload, Pedido } from "@/features/orders/types/order";

export { ErrorCalculo };

/** Genera número de pedido: CQ-2026-000042 */
async function generarNumeroPedido(conn: PoolConnection): Promise<string> {
  // Upsert atómico: crea la fila 'pedidos' si no existe e incrementa en una
  // sola operación. LAST_INSERT_ID(expr) fija el valor asignado a ESTA conexión,
  // que el SELECT siguiente recupera sin condiciones de carrera entre pedidos
  // concurrentes.
  await conn.execute(
    `INSERT INTO \`secuencias\` (\`nombre\`, \`valor\`)
       VALUES ('pedidos', LAST_INSERT_ID(1))
     ON DUPLICATE KEY UPDATE \`valor\` = LAST_INSERT_ID(\`valor\` + 1)`
  );
  const [rows] = await conn.execute<RowDataPacket[]>(
    "SELECT LAST_INSERT_ID() AS `valor`"
  );
  const seq    = Number(rows[0]?.valor ?? 1);
  const year   = new Date().getFullYear();
  const padded = String(seq).padStart(6, "0");
  return `CQ-${year}-${padded}`;
}

/**
 * Bloquea las filas de variante implicadas para el resto de la
 * transacción. Sin esto, dos pedidos simultáneos por la última pieza
 * pasan ambos la validación de stock y se vende inventario que no hay.
 */
async function bloquearVariantes(
  conn: PoolConnection,
  varianteIds: number[]
): Promise<void> {
  if (varianteIds.length === 0) return;
  const placeholders = varianteIds.map(() => "?").join(",");
  await conn.execute(
    `SELECT id FROM producto_variantes WHERE id IN (${placeholders}) FOR UPDATE`,
    varianteIds
  );
}

export async function createPedido(payload: CrearPedidoPayload): Promise<Pedido | null> {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Bloquear variantes ANTES de leer precios y stock
    const varianteIds = [...new Set(
      (payload.items ?? [])
        .map((i) => Number(i.variante_id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )];
    await bloquearVariantes(conn, varianteIds);

    // 2. Totales autoritativos (precios, envío, cupón y moneda de BD).
    //    Lo que mandó el cliente sólo aporta variante_id y cantidad.
    const totales = await calcularTotales({
      items:        payload.items.map((i) => ({
        variante_id: Number(i.variante_id),
        cantidad:    Number(i.cantidad),
      })),
      estado:       payload.direccion_envio.estado,
      cupon_codigo: payload.cupon_codigo ?? null,
      usuario_id:   payload.usuario_id ?? null,
      // Identifica al invitado en cupones de primera compra. Aquí NO se
      // tolera un cupón inválido: si dejó de serlo entre la vista previa
      // y el pago, se aborta en vez de cobrar un total distinto.
      email:        payload.email ?? null,
      // Las variantes ya están bloqueadas; el cupón se bloquea ahora, en
      // ese mismo orden, para que dos pedidos a la vez no puedan gastar
      // el mismo código de un solo uso.
      bloquear_cupon: true,
      db:             conn,
    });

    // 2b. Mínimo cobrable. Se comprueba ANTES de insertar nada: un
    //     pedido por debajo del mínimo de Stripe no se puede cobrar, y
    //     dejarlo en `pendiente_pago` sólo serviría para retener stock.
    if (totales.total < totales.monto_minimo) {
      throw new ErrorCalculo(
        `El importe mínimo para pagar en línea es ${formatMoneda(totales.monto_minimo, totales.moneda)}. ` +
        `Agrega algo más a tu carrito para continuar.`
      );
    }

    // 3. Número de pedido
    const numero = await generarNumeroPedido(conn);

    // 4. Snapshot de dirección
    const dir = payload.direccion_envio;
    const envioNombre = `${dir.nombre} ${dir.apellido}`.trim();

    // 5. Insertar pedido
    const [pedidoResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO pedidos (
        numero, usuario_id, estado,
        envio_nombre, envio_empresa, envio_telefono,
        envio_calle, envio_numero_ext, envio_numero_int,
        envio_colonia, envio_ciudad, envio_municipio,
        envio_estado, envio_cp, envio_pais, envio_referencias,
        email, telefono,
        subtotal, descuento, costo_envio, impuestos, total, moneda,
        cupon_id, cupon_codigo, cupon_descuento,
        metodo_pago, referencia_pago, notas_cliente, ip_origen, fuente, carrito_id
      ) VALUES (
        ?,?,?,
        ?,?,?,
        ?,?,?,
        ?,?,?,
        ?,?,?,?,
        ?,?,
        ?,?,?,?,?,?,
        ?,?,?,
        ?,?,?,?,?,?
      )`,
      [
        numero,
        payload.usuario_id ?? null,
        "pendiente_pago",
        envioNombre,
        dir.empresa ?? null,
        dir.telefono ?? null,
        dir.calle,
        dir.numero_ext,
        dir.numero_int ?? null,
        dir.colonia,
        dir.ciudad,
        dir.municipio ?? null,
        dir.estado,
        dir.codigo_postal,
        dir.pais,
        dir.referencias ?? null,
        payload.email,
        payload.telefono ?? null,
        totales.subtotal,
        totales.descuento,
        totales.costo_envio,
        totales.impuestos,
        totales.total,
        totales.moneda,
        totales.cupon_id,
        totales.cupon_codigo,
        totales.descuento > 0 ? totales.descuento : null,
        payload.metodo_pago,
        payload.referencia_pago ?? null,
        payload.notas_cliente ?? null,
        payload.ip_origen ?? null,
        "web",
        payload.carrito_id ?? null,
      ]
    );

    const pedidoId = pedidoResult.insertId;

    // 6. Ítems (precios y snapshot ya resueltos por calcularTotales)
    for (const linea of totales.lineas) {
      await conn.execute(
        `INSERT INTO pedido_items (
           pedido_id, variante_id,
           titulo, sku, imagen_url,
           precio_unitario, precio_original, cantidad,
           descuento_linea, total_linea
         ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          pedidoId,
          linea.variante_id,
          linea.titulo,
          linea.sku,
          linea.imagen_url,
          linea.precio_unitario,
          linea.precio_original,
          linea.cantidad,
          0,
          linea.total_linea,
        ]
      );

      // Descontar stock con guarda: si otro pedido se adelantó y ya no
      // alcanza, `affectedRows` es 0 y se aborta toda la transacción.
      const [res] = await conn.execute<ResultSetHeader>(
        `UPDATE producto_variantes
            SET stock = stock - ?
          WHERE id = ?
            AND vender_sin_existencia = 0
            AND stock >= ?`,
        [linea.cantidad, linea.variante_id, linea.cantidad]
      );

      if (res.affectedRows === 0) {
        // Puede ser stock insuficiente o una variante que se vende sin
        // existencias (donde no se descuenta nada). Se distingue leyendo.
        const [[variante]] = await conn.execute<RowDataPacket[]>(
          "SELECT vender_sin_existencia FROM producto_variantes WHERE id = ?",
          [linea.variante_id]
        );
        if (!variante?.vender_sin_existencia) {
          throw new ErrorCalculo(`Ya no hay existencias suficientes de "${linea.titulo}".`);
        }
      }
    }

    // 7. Historial inicial
    await conn.execute(
      `INSERT INTO pedido_historial (pedido_id, estado_anterior, estado_nuevo, comentario, notificar)
       VALUES (?, NULL, 'pendiente_pago', 'Pedido creado', 1)`,
      [pedidoId]
    );

    // 8. Registrar uso de cupón
    if (totales.cupon_id) {
      await conn.execute(
        "UPDATE cupones SET usos_actuales = usos_actuales + 1 WHERE id = ?",
        [totales.cupon_id]
      );
      await conn.execute(
        `INSERT INTO cupon_usos (cupon_id, pedido_id, usuario_id, email, descuento)
         VALUES (?,?,?,?,?)`,
        [totales.cupon_id, pedidoId, payload.usuario_id ?? null, payload.email, totales.descuento]
      );
    }

    // 9. Marcar carrito como convertido
    if (payload.carrito_id) {
      await conn.execute(
        "UPDATE carritos SET estado = 'convertido' WHERE id = ?",
        [payload.carrito_id]
      );
    }

    // 10. Leer el pedido creado ANTES de cerrar la transacción
    const [pedRows] = await conn.execute<RowDataPacket[]>(
      "SELECT * FROM pedidos WHERE id = ?",
      [pedidoId]
    );

    await conn.commit();

    return (pedRows[0] as Pedido) ?? null;

  } catch (error) {
    await conn.rollback();
    // Los errores de negocio (sin stock, cupón inválido, precio cero)
    // suben tal cual para que la ruta los devuelva como 400 legible.
    if (error instanceof ErrorCalculo) throw error;
    console.error("[createPedido] Error:", error);
    return null;
  } finally {
    conn.release();
  }
}

/**
 * Enlaza el PaymentIntent con el pedido. Es la referencia que usa el
 * webhook para acreditar el pago; sin ella, un cobro confirmado nunca
 * se refleja en el pedido.
 *
 * El UPDATE es condicional (`referencia_pago IS NULL`) y hace las
 * veces de cerrojo: si dos peticiones simultáneas crearan dos
 * PaymentIntents, sólo una consigue enlazarse y la otra sabe que
 * perdió y debe anular el suyo. Devuelve si ganó el enlace.
 */
export async function enlazarPaymentIntent(
  pedidoId: number,
  paymentIntentId: string
): Promise<boolean> {
  const [res] = await pool.execute<ResultSetHeader>(
    "UPDATE pedidos SET referencia_pago = ? WHERE id = ? AND referencia_pago IS NULL",
    [paymentIntentId, pedidoId]
  );
  return res.affectedRows > 0;
}

/** Referencia de pago actualmente enlazada al pedido. */
export async function getReferenciaPago(pedidoId: number): Promise<string | null> {
  const [[fila]] = await pool.execute<RowDataPacket[]>(
    "SELECT referencia_pago FROM pedidos WHERE id = ? LIMIT 1",
    [pedidoId]
  );
  return (fila?.referencia_pago as string | null) ?? null;
}
