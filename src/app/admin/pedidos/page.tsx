// app/admin/pedidos/page.tsx
import { pool }             from "@/shared/lib/db/pool";
import { AdminStatCards }   from "@/features/admin/components/AdminStatCards";
import { PedidosTable }     from "@/features/admin/pedidos/components/PedidosTable";
import { formatPrice }      from "@/shared/lib/format";
import type { PedidoRow }   from "@/features/admin/pedidos/types";
import type { RowDataPacket } from "mysql2";

export const metadata = { title: "Pedidos" };

const LIMIT = 20;

interface Stats {
  total:        number;
  pendientes:   number;
  en_curso:     number;
  entregados:   number;
  ingresos_mes: number;
}

async function fetchPedidos() {
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
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ?
  `, [LIMIT]);

  const [[stats]] = await pool.query<RowDataPacket[]>(`
    SELECT
      COUNT(*)                                                                   AS total,
      SUM(estado = 'pendiente_pago')                                             AS pendientes,
      SUM(estado IN ('pago_recibido','en_proceso','listo_envio','enviado'))       AS en_curso,
      SUM(estado = 'entregado')                                                   AS entregados,
      COALESCE(SUM(
        CASE WHEN estado NOT IN ('cancelado','reembolsado')
              AND YEAR(created_at)  = YEAR(CURDATE())
              AND MONTH(created_at) = MONTH(CURDATE())
             THEN total ELSE 0 END
      ), 0)                                                                       AS ingresos_mes
    FROM pedidos
  `);

  return {
    pedidos: rows as PedidoRow[],
    stats: {
      total:        Number(stats.total),
      pendientes:   Number(stats.pendientes),
      en_curso:     Number(stats.en_curso),
      entregados:   Number(stats.entregados),
      ingresos_mes: Number(stats.ingresos_mes),
    } satisfies Stats,
  };
}

export default async function PedidosPage() {
  const { pedidos, stats } = await fetchPedidos();

  const cards = [
    {
      key:      "pendientes",
      label:    "PENDIENTES DE PAGO",
      href:     "/admin/pedidos",
      accent:   "#d97706",
      accentBg: "rgba(217,119,6,0.08)",
      d:        "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
      value:    stats.pendientes,
    },
    {
      key:      "en_curso",
      label:    "EN CURSO",
      href:     "/admin/pedidos",
      accent:   "var(--color-cq-accent, #2563eb)",
      accentBg: "rgba(37,99,235,0.08)",
      d:        "M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 18.5a2 2 0 1 0 0 .01M18.5 18.5a2 2 0 1 0 0 .01",
      value:    stats.en_curso,
    },
    {
      key:      "entregados",
      label:    "ENTREGADOS",
      href:     "/admin/pedidos",
      accent:   "#059669",
      accentBg: "rgba(5,150,105,0.08)",
      d:        "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
      value:    stats.entregados,
    },
    {
      key:      "ingresos_mes",
      label:    "INGRESOS DEL MES",
      href:     "/admin/reportes",
      accent:   "#7c3aed",
      accentBg: "rgba(124,58,237,0.08)",
      d:        "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
      value:    formatPrice(stats.ingresos_mes, "MXN").replace(" MXN", ""),
    },
  ];

  return (
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
              Ventas
            </p>
            <h1
              className="text-[28px] font-black uppercase tracking-tight leading-none"
              style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}
            >
              Pedidos
            </h1>
            <p className="text-[13px] mt-1"
              style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
              {stats.total} pedido{stats.total !== 1 ? "s" : ""} en total
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* ── Métricas ── */}
        <AdminStatCards cards={cards} />

        {/* ── Tabla ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)", boxShadow: "var(--shadow-card)" }}
        >
          <PedidosTable initialPedidos={pedidos} initialTotal={stats.total} />
        </div>

      </div>
    </div>
  );
}
