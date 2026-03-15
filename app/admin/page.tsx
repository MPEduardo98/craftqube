// app/admin/page.tsx
import { pool }           from "@/app/global/lib/db/pool";
import { AdminStatCards } from "./components/AdminStatCards";
import type { RowDataPacket } from "mysql2";

export const metadata = { title: "Dashboard" };

async function fetchStats() {
  const [[s]] = await pool.execute<RowDataPacket[]>(`
    SELECT
      (SELECT COUNT(*) FROM productos WHERE deleted_at IS NULL AND estado = 'activo')   AS productos_activos,
      (SELECT COUNT(*) FROM productos WHERE deleted_at IS NULL AND estado = 'borrador') AS borradores,
      (SELECT COALESCE(SUM(stock), 0) FROM producto_variantes)                          AS stock_total,
      (SELECT COUNT(*) FROM pedidos WHERE DATE(created_at) = CURDATE())                 AS pedidos_hoy
  `);
  return s as {
    productos_activos: number;
    borradores:        number;
    stock_total:       number;
    pedidos_hoy:       number;
  };
}

export default async function AdminDashboardPage() {
  const stats = await fetchStats();

  const cards = [
    {
      key:      "productos_activos",
      label:    "PRODUCTOS ACTIVOS",
      href:     "/admin/productos?estado=activo",
      accent:   "var(--color-cq-accent, #2563eb)",
      accentBg: "rgba(37,99,235,0.08)",
      d:        "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
      value:    stats.productos_activos,
    },
    {
      key:      "borradores",
      label:    "BORRADORES",
      href:     "/admin/productos?estado=borrador",
      accent:   "#d97706",
      accentBg: "rgba(217,119,6,0.08)",
      d:        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
      value:    stats.borradores,
    },
    {
      key:      "stock_total",
      label:    "UNIDADES EN STOCK",
      href:     "/admin/productos",
      accent:   "#059669",
      accentBg: "rgba(5,150,105,0.08)",
      d:        "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
      value:    Number(stats.stock_total).toLocaleString("es-MX"),
    },
    {
      key:      "pedidos_hoy",
      label:    "PEDIDOS HOY",
      href:     "/admin/pedidos",
      accent:   "#7c3aed",
      accentBg: "rgba(124,58,237,0.08)",
      d:        "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
      value:    stats.pedidos_hoy,
    },
  ];

  return (
    <div
      className="min-h-full"
      style={{ background: "var(--color-cq-bg, #f8fafc)" }}
    >
      {/* ── Encabezado ── */}
      <div
        className="relative overflow-hidden px-8 pt-8 pb-7"
        style={{
          background:   "var(--color-cq-surface, #fff)",
          borderBottom: "1px solid var(--color-cq-border, #e2e8f0)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10">
          <p
            className="text-[10px] tracking-widest uppercase mb-1"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-accent, #2563eb)" }}
          >
            Panel de control
          </p>
          <h1
            className="text-[28px] font-black uppercase tracking-tight leading-none"
            style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}
          >
            Dashboard
          </h1>
          <p
            className="text-[13px] mt-1"
            style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--color-cq-muted, #64748b)" }}
          >
            Resumen del estado del panel
          </p>
        </div>
      </div>

      {/* ── Cards + resto del contenido ── */}
      <div className="px-8 py-7 space-y-6 max-w-6xl">
        <AdminStatCards cards={cards} />
      </div>
    </div>
  );
}