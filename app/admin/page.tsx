// app/(admin)/admin/page.tsx
// ─────────────────────────────────────────────────────────────
// Página: /admin
// Dashboard principal del panel de administración.
// ─────────────────────────────────────────────────────────────
import Link from "next/link";
import { pool } from "@/app/global/lib/db/pool";
import type { RowDataPacket } from "mysql2";

export const metadata = { title: "Dashboard" };

async function fetchDashboardStats() {
  const [[stats]] = await pool.execute<RowDataPacket[]>(`
    SELECT
      (SELECT COUNT(*) FROM productos WHERE deleted_at IS NULL AND estado = 'activo') AS productos_activos,
      (SELECT COUNT(*) FROM productos WHERE deleted_at IS NULL AND estado = 'borrador') AS borradores,
      (SELECT COALESCE(SUM(stock), 0) FROM producto_variantes) AS stock_total,
      (SELECT COUNT(*) FROM pedidos WHERE DATE(created_at) = CURDATE()) AS pedidos_hoy
  `);
  return stats as {
    productos_activos: number;
    borradores:        number;
    stock_total:       number;
    pedidos_hoy:       number;
  };
}

export default async function AdminDashboardPage() {
  const stats = await fetchDashboardStats();

  const cards = [
    {
      label: "Productos activos",
      value: stats.productos_activos,
      icon:  "📦",
      href:  "/admin/productos?estado=activo",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Borradores",
      value: stats.borradores,
      icon:  "✏️",
      href:  "/admin/productos?estado=borrador",
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Unidades en stock",
      value: Number(stats.stock_total).toLocaleString("es-MX"),
      icon:  "🏭",
      href:  "/admin/productos",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Pedidos hoy",
      value: stats.pedidos_hoy,
      icon:  "🛒",
      href:  "/admin/pedidos",
      color: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Bienvenido al panel de CraftQube</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${c.color}`}>
              {c.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800">{c.value}</p>
            <p className="text-sm text-slate-500 mt-1 group-hover:text-slate-700 transition-colors">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/productos/crear"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo producto
          </Link>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    </div>
  );
}