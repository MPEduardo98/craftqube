// app/api/admin/cupones/[id]/route.ts
// ─────────────────────────────────────────────────────────────
// GET    → detalle del cupón + historial de usos
// PUT    → reemplaza todos los campos editables
// PATCH  → actualización parcial (edición masiva/en línea)
// DELETE → elimina el cupón (bloqueado si ya fue canjeado)
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse }           from "next/server";
import { pool }                                from "@/shared/lib/db/pool";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  TIPOS_VALIDOS, APLICA_VALIDOS, normalizarCupon, SELECT_CUPONES, toMysqlDatetime,
} from "../helpers";

type Params = { params: Promise<{ id: string }> };

/* ── GET ────────────────────────────────────────────────────── */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const cuponId = Number(id);
  if (!cuponId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    const [[cupon]] = await pool.query<RowDataPacket[]>(`${SELECT_CUPONES} WHERE c.id = ?`, [cuponId]);
    if (!cupon) return NextResponse.json({ success: false, error: "Cupón no encontrado" }, { status: 404 });

    const [usos] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.pedido_id, u.usuario_id, u.email, u.descuento, u.created_at,
              p.numero AS pedido_numero
         FROM cupon_usos u
         LEFT JOIN pedidos p ON p.id = u.pedido_id
        WHERE u.cupon_id = ?
        ORDER BY u.created_at DESC
        LIMIT 50`,
      [cuponId]
    );

    return NextResponse.json({
      success: true,
      data:    { ...normalizarCupon(cupon), usos },
    });
  } catch (err) {
    console.error("[GET /api/admin/cupones/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

/* ── PUT ────────────────────────────────────────────────────── */
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const cuponId = Number(id);
  if (!cuponId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    const body   = await req.json();
    const codigo = String(body.codigo ?? "").trim().toUpperCase();

    if (!codigo) {
      return NextResponse.json({ success: false, error: "El código es obligatorio" }, { status: 400 });
    }
    if (!/^[A-Z0-9_-]+$/.test(codigo)) {
      return NextResponse.json(
        { success: false, error: "El código sólo admite letras, números, guion y guion bajo" },
        { status: 400 }
      );
    }

    const tipo    = TIPOS_VALIDOS.includes(body.tipo)      ? body.tipo    : "porcentaje";
    const aplicaA = APLICA_VALIDOS.includes(body.aplica_a) ? body.aplica_a : "todos";

    const valor = tipo === "envio_gratis" || tipo === "2x1" ? 0 : Number(body.valor) || 0;
    if (tipo === "porcentaje" && (valor <= 0 || valor > 100)) {
      return NextResponse.json({ success: false, error: "El porcentaje debe estar entre 1 y 100" }, { status: 400 });
    }
    if (tipo === "monto_fijo" && valor <= 0) {
      return NextResponse.json({ success: false, error: "El monto del descuento debe ser mayor a 0" }, { status: 400 });
    }

    const descripcion      = String(body.descripcion ?? "").trim() || null;
    const minimoCompra     = body.minimo_compra    != null && body.minimo_compra    !== "" ? Number(body.minimo_compra)    : null;
    const maximoDescuento  = body.maximo_descuento != null && body.maximo_descuento !== "" ? Number(body.maximo_descuento) : null;
    const usoMaximoTotal   = body.uso_maximo_total != null && body.uso_maximo_total !== "" ? Number(body.uso_maximo_total) : null;
    const usoMaximoUsuario = Number(body.uso_maximo_usuario) || 1;
    const activo           = body.activo === false || body.activo === 0 ? 0 : 1;
    const validoDesde      = toMysqlDatetime(body.valido_desde);
    const validoHasta      = toMysqlDatetime(body.valido_hasta);

    if (validoDesde && validoHasta && new Date(validoDesde) > new Date(validoHasta)) {
      return NextResponse.json(
        { success: false, error: "La fecha de inicio no puede ser posterior a la de fin" },
        { status: 400 }
      );
    }

    const aplicaIds = aplicaA === "categoria" || aplicaA === "producto"
      ? JSON.stringify((Array.isArray(body.aplica_ids) ? body.aplica_ids : []).map(Number).filter(Boolean))
      : null;

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE cupones SET
         codigo = ?, descripcion = ?, tipo = ?, valor = ?,
         minimo_compra = ?, maximo_descuento = ?,
         uso_maximo_total = ?, uso_maximo_usuario = ?,
         aplica_a = ?, aplica_ids = ?, activo = ?,
         valido_desde = ?, valido_hasta = ?
       WHERE id = ?`,
      [codigo, descripcion, tipo, valor, minimoCompra, maximoDescuento,
       usoMaximoTotal, usoMaximoUsuario, aplicaA, aplicaIds, activo,
       validoDesde, validoHasta, cuponId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Cupón no encontrado" }, { status: 404 });
    }

    const [[cupon]] = await pool.query<RowDataPacket[]>(`${SELECT_CUPONES} WHERE c.id = ?`, [cuponId]);
    return NextResponse.json({ success: true, data: normalizarCupon(cupon) });
  } catch (err: unknown) {
    const isDuplicate = (err as NodeJS.ErrnoException & { code?: string }).code === "ER_DUP_ENTRY";
    console.error("[PUT /api/admin/cupones/[id]]", err);
    return NextResponse.json(
      { success: false, error: isDuplicate ? "Ya existe un cupón con ese código" : "Error al actualizar" },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}

/* ── PATCH ──────────────────────────────────────────────────── */
/* Actualización parcial: sólo toca los campos presentes en el body.
   Lo usa la edición masiva/en línea de la tabla de cupones. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const cuponId = Number(id);
  if (!cuponId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();
    const sets:   string[] = [];
    const values: (string | number | null)[] = [];

    if ("codigo" in body) {
      const codigo = String(body.codigo ?? "").trim().toUpperCase();
      if (!codigo) return NextResponse.json({ success: false, error: "El código es obligatorio" }, { status: 400 });
      if (!/^[A-Z0-9_-]+$/.test(codigo)) {
        return NextResponse.json(
          { success: false, error: "El código sólo admite letras, números, guion y guion bajo" },
          { status: 400 }
        );
      }
      sets.push("codigo = ?"); values.push(codigo);
    }
    if ("descripcion" in body) {
      sets.push("descripcion = ?"); values.push(String(body.descripcion ?? "").trim() || null);
    }
    if ("tipo" in body) {
      if (!TIPOS_VALIDOS.includes(body.tipo)) {
        return NextResponse.json({ success: false, error: "Tipo de cupón inválido" }, { status: 400 });
      }
      sets.push("tipo = ?"); values.push(body.tipo);
      // Envío gratis y 2x1 no llevan valor: se limpia para no dejar restos.
      if ((body.tipo === "envio_gratis" || body.tipo === "2x1") && !("valor" in body)) {
        sets.push("valor = ?"); values.push(0);
      }
    }
    if ("valor" in body) {
      sets.push("valor = ?"); values.push(Number(body.valor) || 0);
    }
    if ("minimo_compra" in body) {
      const v = body.minimo_compra;
      sets.push("minimo_compra = ?"); values.push(v == null || v === "" ? null : Number(v));
    }
    if ("maximo_descuento" in body) {
      const v = body.maximo_descuento;
      sets.push("maximo_descuento = ?"); values.push(v == null || v === "" ? null : Number(v));
    }
    if ("uso_maximo_total" in body) {
      const v = body.uso_maximo_total;
      sets.push("uso_maximo_total = ?"); values.push(v == null || v === "" ? null : Number(v));
    }
    if ("uso_maximo_usuario" in body) {
      sets.push("uso_maximo_usuario = ?"); values.push(Number(body.uso_maximo_usuario) || 1);
    }
    if ("aplica_a" in body) {
      if (!APLICA_VALIDOS.includes(body.aplica_a)) {
        return NextResponse.json({ success: false, error: "Ámbito de aplicación inválido" }, { status: 400 });
      }
      sets.push("aplica_a = ?"); values.push(body.aplica_a);
      // Cambiar a "todos"/"primera_compra" invalida la lista de IDs previa.
      if ((body.aplica_a === "todos" || body.aplica_a === "primera_compra") && !("aplica_ids" in body)) {
        sets.push("aplica_ids = ?"); values.push(null);
      }
    }
    if ("aplica_ids" in body) {
      const ids = Array.isArray(body.aplica_ids) ? body.aplica_ids.map(Number).filter(Boolean) : [];
      sets.push("aplica_ids = ?"); values.push(ids.length ? JSON.stringify(ids) : null);
    }
    if ("activo" in body) {
      sets.push("activo = ?"); values.push(body.activo === false || body.activo === 0 ? 0 : 1);
    }
    if ("valido_desde" in body) {
      sets.push("valido_desde = ?"); values.push(toMysqlDatetime(body.valido_desde));
    }
    if ("valido_hasta" in body) {
      sets.push("valido_hasta = ?"); values.push(toMysqlDatetime(body.valido_hasta));
    }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: "Nada que actualizar" }, { status: 400 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE cupones SET ${sets.join(", ")} WHERE id = ?`,
      [...values, cuponId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Cupón no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const isDuplicate = (err as NodeJS.ErrnoException & { code?: string }).code === "ER_DUP_ENTRY";
    console.error("[PATCH /api/admin/cupones/[id]]", err);
    return NextResponse.json(
      { success: false, error: isDuplicate ? "Ya existe un cupón con ese código" : "Error al actualizar" },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}

/* ── DELETE ─────────────────────────────────────────────────── */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const cuponId = Number(id);
  if (!cuponId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    // Un cupón ya canjeado forma parte del historial de pedidos: se desactiva
    // en vez de borrarse para no perder la trazabilidad de cupon_usos.
    const [[{ total: usos }]] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM cupon_usos WHERE cupon_id = ?",
      [cuponId]
    );
    if (Number(usos) > 0) {
      return NextResponse.json(
        { success: false, error: "No se puede eliminar: el cupón ya fue canjeado. Desactívalo en su lugar." },
        { status: 409 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>("DELETE FROM cupones WHERE id = ?", [cuponId]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Cupón no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/cupones/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
