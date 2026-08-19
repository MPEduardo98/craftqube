// app/api/admin/pedidos/route.ts
// ─────────────────────────────────────────────────────────────
// GET /api/admin/pedidos → lista de pedidos del panel admin
//   ?q=       búsqueda por número, cliente, email, teléfono o guía
//   ?estado=  filtro por estado exacto
//   ?metodo=  filtro por método de pago
//   ?sort=    orden (whitelist)
//   ?page= &limit=
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                      from "@/shared/lib/db/pool";
import { ESTADO_ORDEN }              from "@/features/admin/pedidos/types";
import type { RowDataPacket }        from "mysql2";

/* Orden permitido (whitelist: nunca interpolar entrada del usuario en SQL). */
const SORT_SQL: Record<string, string> = {
  fecha_desc: "p.created_at DESC, p.id DESC",
  fecha_asc:  "p.created_at ASC, p.id ASC",
  total_desc: "p.total DESC, p.id DESC",
  total_asc:  "p.total ASC, p.id DESC",
  numero_asc: "p.numero ASC",
  numero_desc:"p.numero DESC",
};

const METODOS = new Set(["tarjeta", "transferencia", "oxxo"]);
const ESTADOS = new Set<string>(ESTADO_ORDEN);

export async function GET(req: NextRequest) {
  try {
    const sp     = req.nextUrl.searchParams;
    const q      = (sp.get("q") ?? "").trim();
    const estado = sp.get("estado") ?? "";
    const metodo = sp.get("metodo") ?? "";
    const sort   = SORT_SQL[sp.get("sort") ?? ""] ?? SORT_SQL.fecha_desc;
    const page   = Math.max(1, Number(sp.get("page")) || 1);
    const limit  = Math.min(100, Math.max(1, Number(sp.get("limit")) || 20));
    const offset = (page - 1) * limit;

    const where:  string[] = [];
    const params: (string | number)[] = [];

    if (q) {
      where.push(`(
        p.numero        LIKE ? OR
        p.envio_nombre  LIKE ? OR
        p.email         LIKE ? OR
        p.telefono      LIKE ? OR
        p.numero_guia   LIKE ?
      )`);
      const like = `%${q}%`;
      params.push(like, like, like, like, like);
    }
    if (ESTADOS.has(estado)) { where.push("p.estado = ?");      params.push(estado); }
    if (METODOS.has(metodo)) { where.push("p.metodo_pago = ?"); params.push(metodo); }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        p.id, p.numero, p.estado,
        p.envio_nombre AS cliente,
        p.email, p.telefono,
        p.total, p.moneda, p.metodo_pago,
        p.paqueteria, p.numero_guia,
        p.envio_ciudad, p.envio_estado,
        p.usuario_id, p.pagado_en, p.created_at,
        (SELECT COALESCE(SUM(pi.cantidad), 0)
           FROM pedido_items pi WHERE pi.pedido_id = p.id) AS total_items
      FROM pedidos p
      ${whereSql}
      ORDER BY ${sort}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const [[{ total }]] = await pool.query<RowDataPacket[]>(`
      SELECT COUNT(*) AS total FROM pedidos p ${whereSql}
    `, params);

    return NextResponse.json({
      success: true,
      data:    rows,
      meta:    { total: Number(total), page, limit, pages: Math.max(1, Math.ceil(Number(total) / limit)) },
    });
  } catch (err) {
    console.error("[GET /api/admin/pedidos]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
