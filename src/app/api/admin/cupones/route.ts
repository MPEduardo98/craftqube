// app/api/admin/cupones/route.ts
// ─────────────────────────────────────────────────────────────
// GET  /api/admin/cupones  → lista los cupones (panel admin)
// POST /api/admin/cupones  → crea un nuevo cupón
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                      from "@/shared/lib/db/pool";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  TIPOS_VALIDOS, APLICA_VALIDOS, normalizarCupon, SELECT_CUPONES, toMysqlDatetime,
  normalizarAplicaEnvio,
} from "./helpers";

/* Orden permitido (whitelist: nunca interpolar entrada del usuario en SQL). */
const SORT_SQL: Record<string, string> = {
  fecha_desc:  "c.created_at DESC, c.id DESC",
  fecha_asc:   "c.created_at ASC, c.id ASC",
  codigo_asc:  "c.codigo ASC",
  codigo_desc: "c.codigo DESC",
  usos_desc:   "c.usos_actuales DESC, c.codigo ASC",
  usos_asc:    "c.usos_actuales ASC, c.codigo ASC",
  valor_desc:  "c.valor DESC, c.codigo ASC",
  valor_asc:   "c.valor ASC, c.codigo ASC",
};

/* Filtros por estado derivado (activo/vigencia/agotamiento). */
const ESTADO_SQL: Record<string, string> = {
  activo: `c.activo = 1
           AND (c.valido_desde IS NULL OR c.valido_desde <= NOW())
           AND (c.valido_hasta IS NULL OR c.valido_hasta >= NOW())
           AND (c.uso_maximo_total IS NULL OR c.usos_actuales < c.uso_maximo_total)`,
  inactivo:   "c.activo = 0",
  programado: "c.activo = 1 AND c.valido_desde IS NOT NULL AND c.valido_desde > NOW()",
  expirado:   "c.activo = 1 AND c.valido_hasta IS NOT NULL AND c.valido_hasta < NOW()",
  agotado:    "c.activo = 1 AND c.uso_maximo_total IS NOT NULL AND c.usos_actuales >= c.uso_maximo_total",
};

export async function GET(req: NextRequest) {
  try {
    const sp     = req.nextUrl.searchParams;
    const q      = (sp.get("q") ?? "").trim();
    const estado = sp.get("estado") ?? "";
    const tipo   = sp.get("tipo") ?? "";
    const sort   = SORT_SQL[sp.get("sort") ?? ""] ?? SORT_SQL.fecha_desc;
    const page   = Math.max(1, Number(sp.get("page")) || 1);
    const limit  = Math.min(100, Math.max(1, Number(sp.get("limit")) || 20));
    const offset = (page - 1) * limit;

    const where:  string[] = [];
    const params: (string | number)[] = [];

    if (q) {
      where.push("(c.codigo LIKE ? OR c.descripcion LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (ESTADO_SQL[estado]) where.push(`(${ESTADO_SQL[estado]})`);
    if (TIPOS_VALIDOS.includes(tipo)) {
      where.push("c.tipo = ?");
      params.push(tipo);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query<RowDataPacket[]>(`
      ${SELECT_CUPONES}
      ${whereSql}
      ORDER BY ${sort}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const [[{ total }]] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) AS total FROM cupones c ${whereSql}
    `, params);

    return NextResponse.json({
      success: true,
      data:    rows.map(normalizarCupon),
      meta:    { total: Number(total), page, limit, pages: Math.max(1, Math.ceil(Number(total) / limit)) },
    });
  } catch (err) {
    console.error("[GET /api/admin/cupones]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const tipo    = TIPOS_VALIDOS.includes(body.tipo)    ? body.tipo    : "porcentaje";
    const aplicaA = APLICA_VALIDOS.includes(body.aplica_a) ? body.aplica_a : "todos";

    // Para envío gratis / 2x1 el valor no se usa: se normaliza a 0.
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
    // Sólo porcentaje y monto fijo pueden descontar sobre el envío.
    const aplicaEnvio      = normalizarAplicaEnvio(body.aplica_envio, tipo);
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
      `INSERT INTO cupones
         (codigo, descripcion, tipo, valor, minimo_compra, maximo_descuento,
          uso_maximo_total, uso_maximo_usuario, aplica_a, aplica_ids, aplica_envio,
          activo, valido_desde, valido_hasta)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo, descripcion, tipo, valor, minimoCompra, maximoDescuento,
       usoMaximoTotal, usoMaximoUsuario, aplicaA, aplicaIds, aplicaEnvio,
       activo, validoDesde, validoHasta]
    );

    const [[cupon]] = await pool.query<RowDataPacket[]>(
      `${SELECT_CUPONES} WHERE c.id = ?`, [result.insertId]
    );

    return NextResponse.json({ success: true, data: normalizarCupon(cupon) });
  } catch (err: unknown) {
    const isDuplicate = (err as NodeJS.ErrnoException & { code?: string }).code === "ER_DUP_ENTRY";
    if (isDuplicate) {
      return NextResponse.json({ success: false, error: "Ya existe un cupón con ese código" }, { status: 409 });
    }
    console.error("[POST /api/admin/cupones]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
