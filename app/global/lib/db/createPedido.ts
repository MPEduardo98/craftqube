// app/global/lib/db/createPedido.ts
// ─────────────────────────────────────────────────────────────
// Función de servidor: crea un pedido completo en la DB
// Genera número de pedido, items, historial inicial
// ─────────────────────────────────────────────────────────────
import mysql from "mysql2/promise";
import type { CrearPedidoPayload, Pedido } from "@/app/global/types/order";

function dbConfig() {
  return {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     Number(process.env.DB_PORT) || 3306,
    ssl:      { rejectUnauthorized: false },
  };
}

/** Genera número de pedido: CQ-2026-000042 */
async function generarNumeroPedido(conn: mysql.Connection): Promise<string> {
  await conn.execute(
    "UPDATE `secuencias` SET `valor` = `valor` + 1 WHERE `nombre` = 'pedidos'"
  );
  const [rows] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT `valor` FROM `secuencias` WHERE `nombre` = 'pedidos'"
  );
  const seq    = (rows[0]?.valor as number) ?? 1;
  const year   = new Date().getFullYear();
  const padded = String(seq).padStart(6, "0");
  return `CQ-${year}-${padded}`;
}

export async function createPedido(payload: CrearPedidoPayload): Promise<Pedido | null> {
  const conn = await mysql.createConnection(dbConfig());

  try {
    await conn.beginTransaction();

    // 1. Validar cupón (si viene)
    let cuponId:       number | null  = null;
    let cuponCodigo:   string | null  = null;
    let cuponDescuento: number        = 0;

    if (payload.cupon_codigo) {
      const [cupRows] = await conn.execute<mysql.RowDataPacket[]>(
        `SELECT * FROM cupones
         WHERE codigo = ?
           AND activo = 1
           AND (valido_desde IS NULL OR valido_desde <= NOW())
           AND (valido_hasta IS NULL OR valido_hasta >= NOW())
           AND (uso_maximo_total IS NULL OR usos_actuales < uso_maximo_total)
         LIMIT 1`,
        [payload.cupon_codigo]
      );
      const cupon = cupRows[0];
      if (cupon) {
        cuponId      = cupon.id;
        cuponCodigo  = cupon.codigo;
        const subtotal = payload.items.reduce(
          (s, i) => s + i.precio_unitario * i.cantidad, 0
        );
        if (cupon.tipo === "porcentaje") {
          cuponDescuento = subtotal * (cupon.valor / 100);
          if (cupon.maximo_descuento) {
            cuponDescuento = Math.min(cuponDescuento, cupon.maximo_descuento);
          }
        } else if (cupon.tipo === "monto_fijo") {
          cuponDescuento = Math.min(cupon.valor, subtotal);
        } else if (cupon.tipo === "envio_gratis") {
          cuponDescuento = payload.costo_envio;
        }
      }
    }

    // 2. Calcular montos
    const subtotal    = payload.items.reduce(
      (s, i) => s + i.precio_unitario * i.cantidad, 0
    );
    const descuento   = cuponDescuento;
    const costoEnvio  = cuponCodigo && cuponDescuento === payload.costo_envio
      ? 0
      : payload.costo_envio;
    const baseImpuesto = subtotal - descuento;
    const impuestos   = 0; // Ajustar según IVA incluido o no
    const total       = baseImpuesto + costoEnvio + impuestos;

    // 3. Número de pedido
    const numero = await generarNumeroPedido(conn);

    // 4. Snapshot de dirección
    const dir = payload.direccion_envio;
    const envioNombre = `${dir.nombre} ${dir.apellido}`.trim();

    // 5. Insertar pedido
    const [pedidoResult] = await conn.execute<mysql.ResultSetHeader>(
      `INSERT INTO pedidos (
        numero, usuario_id, estado,
        envio_nombre, envio_empresa, envio_telefono,
        envio_calle, envio_numero_ext, envio_numero_int,
        envio_colonia, envio_ciudad, envio_municipio,
        envio_estado, envio_cp, envio_pais, envio_referencias,
        email, telefono,
        subtotal, descuento, costo_envio, impuestos, total, moneda,
        cupon_id, cupon_codigo, cupon_descuento,
        metodo_pago, notas_cliente, ip_origen, fuente, carrito_id
      ) VALUES (
        ?,?,?,
        ?,?,?,
        ?,?,?,
        ?,?,?,
        ?,?,?,?,
        ?,?,
        ?,?,?,?,?,?,
        ?,?,?,
        ?,?,?,?,?
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
        subtotal,
        descuento,
        costoEnvio,
        impuestos,
        total,
        "MXN",
        cuponId,
        cuponCodigo,
        cuponDescuento > 0 ? cuponDescuento : null,
        payload.metodo_pago,
        payload.notas_cliente ?? null,
        payload.ip_origen ?? null,
        "web",
        payload.carrito_id ?? null,
      ]
    );

    const pedidoId = pedidoResult.insertId;

    // 6. Insertar ítems
    for (const item of payload.items) {
      // Obtener snapshot del producto
      const [varRows] = await conn.execute<mysql.RowDataPacket[]>(
        `SELECT
           pv.sku,
           p.titulo,
           pi.url AS imagen_url
         FROM producto_variantes pv
         INNER JOIN productos p ON p.id = pv.producto_id
         LEFT JOIN producto_imagenes pi
           ON pi.producto_id = p.id
           AND pi.variante_id IS NULL
           AND pi.id = (
             SELECT MIN(id) FROM producto_imagenes
             WHERE producto_id = p.id AND variante_id IS NULL
           )
         WHERE pv.id = ?`,
        [item.variante_id]
      );
      const varData = varRows[0];
      const totalLinea =
        (item.precio_unitario * item.cantidad);

      await conn.execute(
        `INSERT INTO pedido_items (
           pedido_id, variante_id,
           titulo, sku, imagen_url,
           precio_unitario, precio_original, cantidad,
           descuento_linea, total_linea
         ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [
          pedidoId,
          item.variante_id,
          varData?.titulo ?? "Producto",
          varData?.sku    ?? item.variante_id.toString(),
          varData?.imagen_url ?? null,
          item.precio_unitario,
          item.precio_original,
          item.cantidad,
          0,
          totalLinea,
        ]
      );

      // Descontar stock
      await conn.execute(
        `UPDATE producto_variantes
         SET stock = GREATEST(0, stock - ?)
         WHERE id = ? AND vender_sin_existencia = 0`,
        [item.cantidad, item.variante_id]
      );
    }

    // 7. Historial inicial
    await conn.execute(
      `INSERT INTO pedido_historial (pedido_id, estado_anterior, estado_nuevo, comentario, notificar)
       VALUES (?, NULL, 'pendiente_pago', 'Pedido creado', 1)`,
      [pedidoId]
    );

    // 8. Registrar uso de cupón
    if (cuponId && cuponDescuento > 0) {
      await conn.execute(
        `UPDATE cupones SET usos_actuales = usos_actuales + 1 WHERE id = ?`,
        [cuponId]
      );
      await conn.execute(
        `INSERT INTO cupon_usos (cupon_id, pedido_id, usuario_id, email, descuento)
         VALUES (?,?,?,?,?)`,
        [cuponId, pedidoId, payload.usuario_id ?? null, payload.email, cuponDescuento]
      );
    }

    // 9. Marcar carrito como convertido
    if (payload.carrito_id) {
      await conn.execute(
        `UPDATE carritos SET estado = 'convertido' WHERE id = ?`,
        [payload.carrito_id]
      );
    }

    await conn.commit();

    // 10. Retornar pedido creado
    const [pedRows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM pedidos WHERE id = ?`,
      [pedidoId]
    );

    return pedRows[0] as Pedido ?? null;

  } catch (error) {
    await conn.rollback();
    console.error("[createPedido] Error:", error);
    return null;
  } finally {
    await conn.end();
  }
}