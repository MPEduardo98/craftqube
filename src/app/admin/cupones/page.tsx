// app/admin/cupones/page.tsx
import { pool }               from "@/shared/lib/db/pool";
import { AdminStatCards }     from "@/features/admin/components/AdminStatCards";
import { CuponesTable }       from "@/features/admin/cupones/components/CuponesTable";
import { CrearCuponButton }   from "@/features/admin/cupones/components/CrearCuponButton";
import { BulkEditProvider, HideOnBulkEdit } from "@/shared/components/ui/BulkEditContext";
import { formatPrice }        from "@/shared/lib/format";
import type { CuponRow }      from "@/features/admin/cupones/types";
import type { RowDataPacket } from "mysql2";

export const metadata = { title: "Cupones" };

const LIMIT = 20;

interface Stats {
  total:            number;
  activos:          number;
  canjes:           number;
  descuento_total:  number;
}

async function fetchCupones() {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      c.id, c.codigo, c.descripcion, c.tipo, c.valor,
      c.minimo_compra, c.maximo_descuento,
      c.uso_maximo_total, c.uso_maximo_usuario, c.usos_actuales,
      c.aplica_a, c.aplica_ids, c.aplica_envio, c.activo,
      c.valido_desde, c.valido_hasta, c.created_at,
      COALESCE((SELECT SUM(u.descuento) FROM cupon_usos u WHERE u.cupon_id = c.id), 0) AS descuento_total
    FROM cupones c
    ORDER BY c.created_at DESC, c.id DESC
    LIMIT ?
  `, [LIMIT]);

  const [[stats]] = await pool.query<RowDataPacket[]>(`
    SELECT
      COUNT(*) AS total,
      SUM(
        activo = 1
        AND (valido_desde IS NULL OR valido_desde <= NOW())
        AND (valido_hasta IS NULL OR valido_hasta >= NOW())
        AND (uso_maximo_total IS NULL OR usos_actuales < uso_maximo_total)
      ) AS activos,
      COALESCE(SUM(usos_actuales), 0) AS canjes
    FROM cupones
  `);

  const [[{ descuento_total }]] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(descuento), 0) AS descuento_total FROM cupon_usos"
  );

  // `aplica_ids` se guarda como JSON: el driver lo devuelve como string o ya parseado.
  const cupones = rows.map(r => {
    let aplicaIds: number[] | null = null;
    if (Array.isArray(r.aplica_ids)) {
      aplicaIds = r.aplica_ids.map(Number).filter(Boolean);
    } else if (typeof r.aplica_ids === "string" && r.aplica_ids.trim()) {
      try {
        const parsed = JSON.parse(r.aplica_ids);
        if (Array.isArray(parsed)) aplicaIds = parsed.map(Number).filter(Boolean);
      } catch { aplicaIds = null; }
    }
    return {
      ...r,
      valor:              Number(r.valor),
      minimo_compra:      r.minimo_compra    == null ? null : Number(r.minimo_compra),
      maximo_descuento:   r.maximo_descuento == null ? null : Number(r.maximo_descuento),
      uso_maximo_total:   r.uso_maximo_total == null ? null : Number(r.uso_maximo_total),
      uso_maximo_usuario: Number(r.uso_maximo_usuario),
      usos_actuales:      Number(r.usos_actuales),
      descuento_total:    Number(r.descuento_total ?? 0),
      activo:             Number(r.activo),
      aplica_envio:       Number(r.aplica_envio ?? 0),
      aplica_ids:         aplicaIds,
      // Los DATETIME viajan como Date al cliente: se serializan a ISO.
      valido_desde: r.valido_desde ? new Date(r.valido_desde).toISOString() : null,
      valido_hasta: r.valido_hasta ? new Date(r.valido_hasta).toISOString() : null,
      created_at:   new Date(r.created_at).toISOString(),
    } as CuponRow;
  });

  return {
    cupones,
    stats: {
      total:           Number(stats.total),
      activos:         Number(stats.activos ?? 0),
      canjes:          Number(stats.canjes),
      descuento_total: Number(descuento_total),
    } satisfies Stats,
  };
}

export default async function CuponesPage() {
  const { cupones, stats } = await fetchCupones();

  const cards = [
    {
      key:      "total",
      label:    "CUPONES CREADOS",
      href:     "/admin/cupones",
      accent:   "var(--color-cq-accent, #2563eb)",
      accentBg: "rgba(37,99,235,0.08)",
      d:        "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
      value:    stats.total,
    },
    {
      key:      "activos",
      label:    "VIGENTES AHORA",
      href:     "/admin/cupones",
      accent:   "#059669",
      accentBg: "rgba(5,150,105,0.08)",
      d:        "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
      value:    stats.activos,
    },
    {
      key:      "canjes",
      label:    "CANJES TOTALES",
      href:     "/admin/cupones",
      accent:   "#d97706",
      accentBg: "rgba(217,119,6,0.08)",
      d:        "M20 6 9 17l-5-5",
      value:    stats.canjes,
    },
    {
      key:      "descuento_total",
      label:    "DESCUENTO OTORGADO",
      href:     "/admin/reportes",
      accent:   "#7c3aed",
      accentBg: "rgba(124,58,237,0.08)",
      d:        "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
      value:    formatPrice(stats.descuento_total, "MXN").replace(" MXN", ""),
    },
  ];

  return (
    <BulkEditProvider>
    <div className="min-h-full" style={{ background: "var(--color-cq-bg, #f8fafc)" }}>

      {/* ── Encabezado ── */}
      <div
        className="relative overflow-hidden px-8 pt-8 pb-6"
        style={{ background: "var(--color-cq-surface, #fff)", borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 flex items-end justify-between gap-4">
          <div>
            <p
              className="text-[10px] tracking-widest uppercase mb-1"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-accent, #2563eb)" }}
            >
              Marketing
            </p>
            <h1
              className="text-[28px] font-black uppercase tracking-tight leading-none"
              style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}
            >
              Cupones
            </h1>
            <p className="text-[13px] mt-1"
              style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
              {stats.total} cupón{stats.total !== 1 ? "es" : ""} en total
            </p>
          </div>
          <HideOnBulkEdit>
            <div className="flex items-center gap-2.5 shrink-0">
              <CrearCuponButton />
            </div>
          </HideOnBulkEdit>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* ── Métricas ── */}
        <HideOnBulkEdit>
          <AdminStatCards cards={cards} />
        </HideOnBulkEdit>

        {/* ── Tabla ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)", boxShadow: "var(--shadow-card)" }}
        >
          <CuponesTable initialCupones={cupones} initialTotal={stats.total} />
        </div>

      </div>
    </div>
    </BulkEditProvider>
  );
}
