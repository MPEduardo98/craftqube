// app/api/pedidos/[id]/route.ts
// ─────────────────────────────────────────────────────────────
// GET /api/pedidos/:id — detalle del pedido del usuario autenticado
//
// A diferencia del endpoint de admin, aquí NO se devuelven campos
// internos (notas_internas, ip_origen, …) y el pedido debe pertenecer
// al usuario de la sesión: un id ajeno responde 404, no 403, para no
// revelar qué pedidos existen.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                      from "@/shared/lib/db/pool";
import type { RowDataPacket }        from "mysql2";
import { getSessionUser }            from "@/features/auth/lib/getSessionUser";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 });
  }
  const userId = Number(user.id);

  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
  }

  try {
    // La condición por usuario_id va en el WHERE: es la única barrera
    // que impide leer el pedido de otra persona conociendo su id.
    const [pedRows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         id, numero, estado,
         envio_nombre, envio_empresa, envio_telefono,
         envio_calle, envio_numero_ext, envio_numero_int, envio_colonia,
         envio_ciudad, envio_municipio, envio_estado, envio_cp, envio_pais,
         envio_referencias,
         email, telefono,
         subtotal, descuento, costo_envio, impuestos, total, moneda,
         cupon_codigo, cupon_descuento,
         metodo_pago, referencia_pago, pagado_en,
         paqueteria, numero_guia, url_rastreo, enviado_en, entregado_en,
         notas_cliente, created_at, updated_at
       FROM pedidos
       WHERE id = ? AND usuario_id = ?
       LIMIT 1`,
      [id, userId]
    );

    const pedido = pedRows[0];
    if (!pedido) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 });
    }

    const [items] = await pool.execute<RowDataPacket[]>(
      `SELECT
         pi.id, pi.variante_id, pi.titulo, pi.sku, pi.imagen_url,
         pi.precio_unitario, pi.precio_original, pi.cantidad,
         pi.descuento_linea, pi.total_linea,
         p.id   AS producto_id,
         p.slug AS producto_slug
       FROM pedido_items pi
       LEFT JOIN producto_variantes pv ON pv.id = pi.variante_id
       LEFT JOIN productos p           ON p.id  = pv.producto_id
       WHERE pi.pedido_id = ?
       ORDER BY pi.id ASC`,
      [id]
    );

    // El historial del cliente omite `comentario`/`notificar`: son notas
    // de operación interna, no información para el comprador.
    const [historial] = await pool.execute<RowDataPacket[]>(
      `SELECT id, estado_anterior, estado_nuevo, created_at
       FROM pedido_historial
       WHERE pedido_id = ?
       ORDER BY created_at ASC, id ASC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: { ...pedido, items, historial },
    });
  } catch (error) {
    console.error("[GET /api/pedidos/:id]", error);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
