// app/admin/page.tsx
import Link     from "next/link";
import { pool } from "@/app/global/lib/db/pool";
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
  return s as { productos_activos: number; borradores: number; stock_total: number; pedidos_hoy: number };
}

const cards = [
  {
    key:      "productos_activos" as const,
    label:    "PRODUCTOS ACTIVOS",
    href:     "/admin/productos?estado=activo",
    accent:   "var(--color-cq-accent, #2563eb)",
    accentBg: "rgba(37,99,235,0.08)",
    d:        "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  },
  {
    key:      "borradores" as const,
    label:    "BORRADORES",
    href:     "/admin/productos?estado=borrador",
    accent:   "#d97706",
    accentBg: "rgba(217,119,6,0.08)",
    d:        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  },
  {
    key:      "stock_total" as const,
    label:    "UNIDADES EN STOCK",
    href:     "/admin/productos",
    accent:   "#059669",
    accentBg: "rgba(5,150,105,0.08)",
    d:        "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    format:   true,
  },
  {
    key:      "pedidos_hoy" as const,
    label:    "PEDIDOS HOY",
    href:     "/admin/pedidos",
    accent:   "#7c3aed",
    accentBg: "rgba(124,58,237,0.08)",
    d:        "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
  },
] as const;

export default async function AdminDashboardPage() {
  const stats = await fetchStats();

  return (
    <div
      className="min-h-full"
      style={{ background: "var(--color-cq-bg, #f8fafc)" }}
    >
      {/* ── Encabezado — mismo estilo hero del sitio pero compacto ── */}
      <div
        className="relative overflow-hidden px-8 pt-8 pb-7"
        style={{
          background: "var(--color-cq-surface, #fff)",
          borderBottom: "1px solid var(--color-cq-border, #e2e8f0)",
        }}
      >
        {/* Grid pattern sutil */}
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

      <div className="px-8 py-7 space-y-6 max-w-6xl">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((c) => {
            const raw = stats[c.key];
            const val = ("format" in c && c.format)
              ? Number(raw).toLocaleString("es-MX")
              : raw;

            return (
              <Link
                key={c.key}
                href={c.href}
                className="group relative overflow-hidden flex flex-col gap-4 p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background:  "var(--color-cq-surface, #fff)",
                  border:      "1px solid var(--color-cq-border, #e2e8f0)",
                  boxShadow:   "var(--shadow-card)",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-md)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)"}
              >
                {/* Glow top-right */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background: c.accentBg, filter: "blur(20px)", transform: "translate(30%, -30%)" }}
                />

                <div className="flex items-start justify-between relative z-10">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: c.accentBg }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      {c.d.split("M").filter(Boolean).map((seg, i) => (
                        <path key={i} d={"M" + seg} />
                      ))}
                    </svg>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-all duration-150 group-hover:translate-x-0.5"
                    style={{ color: "var(--color-cq-muted-2, #94a3b8)", marginTop: "2px" }}
                  >
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>

                <div className="relative z-10">
                  <p
                    className="text-[30px] font-black leading-none"
                    style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)", letterSpacing: "-0.02em" }}
                  >
                    {val}
                  </p>
                  <p
                    className="text-[10px] mt-1.5 font-semibold tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}
                  >
                    {c.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Acciones rápidas ── */}
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)" }}
        >
          <p
            className="text-[10px] font-bold tracking-widest uppercase mb-4"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}
          >
            Acciones rápidas
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/productos/crear" className="btn-primary text-[11px] inline-flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo producto
            </Link>
            <Link href="/admin/productos" className="btn-secondary text-[11px]">
              Ver productos
            </Link>
            <Link href="/admin/pedidos" className="btn-ghost text-[11px]">
              Ver pedidos
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}