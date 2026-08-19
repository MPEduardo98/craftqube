// app/api/admin/pedidos/[id]/route.ts
// ─────────────────────────────────────────────────────────────
// GET   /api/admin/pedidos/:id → detalle (pedido + ítems + historial)
// PATCH /api/admin/pedidos/:id → actualiza estado y/o datos de envío
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                      from "@/shared/lib/db/pool";
import { ESTADO_ORDEN }              from "@/features/admin/pedidos/types";
import type { RowDataPacket }        from "mysql2";

const ESTADOS = new Set<string>(ESTADO_ORDEN);

/* ── GET — detalle ────────────────────────────────────────────── */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
  }

  try {
    const [pedRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM pedidos WHERE id = ? LIMIT 1`, [id]
    );
    const pedido = pedRows[0];
    if (!pedido) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 });
    }

    const [items] = await pool.query<RowDataPacket[]>(`
      SELECT
        pi.id, pi.variante_id, pi.titulo, pi.sku, pi.imagen_url,
        pi.precio_unitario, pi.cantidad, pi.descuento_linea, pi.total_linea,
        p.slug AS producto_slug
      FROM pedido_items pi
      LEFT JOIN producto_variantes pv ON pv.id = pi.variante_id
      LEFT JOIN productos p           ON p.id  = pv.producto_id
      WHERE pi.pedido_id = ?
      ORDER BY pi.id ASC
    `, [id]);

    const [historial] = await pool.query<RowDataPacket[]>(`
      SELECT id, estado_anterior, estado_nuevo, comentario, notificar, created_at
      FROM pedido_historial
      WHERE pedido_id = ?
      ORDER BY created_at DESC, id DESC
    `, [id]);

    return NextResponse.json({
      success: true,
      data: { ...pedido, items, historial },
    });
  } catch (err) {
    console.error("[GET /api/admin/pedidos/:id]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

/* ── PATCH — cambio de estado / datos de envío ────────────────── */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });
  }

  const conn = await pool.getConnection();
  try {
    const body = await req.json();

    const [pedRows] = await conn.query<RowDataPacket[]>(
      `SELECT id, estado FROM pedidos WHERE id = ? LIMIT 1`, [id]
    );
    const actual = pedRows[0];
    if (!actual) {
      return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 });
    }

    const sets:   string[] = [];
    const params: (string | number | null)[] = [];

    /* Estado — valida contra la whitelist y registra el cambio en el historial. */
    const nuevoEstado: string | undefined =
      typeof body.estado === "string" ? body.estado : undefined;

    if (nuevoEstado !== undefined) {
      if (!ESTADOS.has(nuevoEstado)) {
        return NextResponse.json({ success: false, error: "Estado no válido" }, { status: 400 });
      }
      sets.push("estado = ?");
      params.push(nuevoEstado);

      // Sellos de tiempo derivados del estado (solo si aún no se habían fijado).
      if (nuevoEstado === "pago_recibido") sets.push("pagado_en    = COALESCE(pagado_en, NOW())");
      if (nuevoEstado === "enviado")       sets.push("enviado_en   = COALESCE(enviado_en, NOW())");
      if (nuevoEstado === "entregado")     sets.push("entregado_en = COALESCE(entregado_en, NOW())");
    }

    /* Datos de envío / pago editables desde el detalle. */
    const textFields: Record<string, string> = {
      paqueteria:      "paqueteria",
      numero_guia:     "numero_guia",
      url_rastreo:     "url_rastreo",
      referencia_pago: "referencia_pago",
      notas_internas:  "notas_internas",
    };
    for (const [key, column] of Object.entries(textFields)) {
      if (!(key in body)) continue;
      const raw = body[key];
      const value = typeof raw === "string" && raw.trim() ? raw.trim() : null;
      sets.push(`${column} = ?`);
      params.push(value);
    }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: "Nada que actualizar" }, { status: 400 });
    }

    await conn.beginTransaction();

    await conn.execute(
      `UPDATE pedidos SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`,
      [...params, id]
    );

    if (nuevoEstado !== undefined && nuevoEstado !== actual.estado) {
      const comentario =
        typeof body.comentario === "string" && body.comentario.trim()
          ? body.comentario.trim()
          : null;
      await conn.execute(
        `INSERT INTO pedido_historial (pedido_id, estado_anterior, estado_nuevo, comentario, notificar)
         VALUES (?, ?, ?, ?, ?)`,
        [id, actual.estado, nuevoEstado, comentario, body.notificar ? 1 : 0]
      );
    }

    await conn.commit();

    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT * FROM pedidos WHERE id = ? LIMIT 1`, [id]
    );

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error("[PATCH /api/admin/pedidos/:id]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  } finally {
    conn.release();
  }
}
