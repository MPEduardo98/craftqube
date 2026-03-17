// app/admin/productos/page.tsx
import Link              from "next/link";
import { pool }          from "@/app/global/lib/db/pool";
import type { RowDataPacket } from "mysql2";
import { ProductosTable } from "./components/ProductosTable";
import type { ProductoRow } from "./types";

export type { ProductoRow };
export const metadata = { title: "Productos" };

async function fetchProductos() {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT
      p.id, p.titulo, p.slug, p.estado,
      MIN(v.precio_final) AS precio,
      COALESCE(SUM(v.stock), 0) AS stock,
      (SELECT pi.url FROM producto_imagenes pi WHERE pi.producto_id = p.id ORDER BY pi.orden ASC LIMIT 1) AS imagen_url,
      GROUP_CONCAT(DISTINCT c.nombre ORDER BY c.nombre SEPARATOR ', ') AS categorias,
      m.nombre AS marca
    FROM productos p
    LEFT JOIN producto_variantes v      ON v.producto_id = p.id
    LEFT JOIN marcas m                  ON m.id = p.marca_id
    LEFT JOIN producto_categorias pc    ON pc.producto_id = p.id
    LEFT JOIN categorias c              ON c.id = pc.categoria_id
    WHERE p.deleted_at IS NULL
    GROUP BY p.id
    ORDER BY p.updated_at DESC
    LIMIT 50
  `);

  const [[{ total }]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM productos WHERE deleted_at IS NULL"
  );

  return { productos: rows as ProductoRow[], total: Number(total) };
}

async function fetchStats() {
  const [[row]] = await pool.execute<RowDataPacket[]>(`
    SELECT
      COUNT(*)                 AS total,
      SUM(estado = 'activo')   AS activos,
      SUM(estado = 'inactivo') AS inactivos,
      SUM(estado = 'borrador') AS borradores
    FROM productos WHERE deleted_at IS NULL
  `);
  return row as { total: number; activos: number; inactivos: number; borradores: number };
}

export default async function ProductosPage() {
  const [{ productos, total }, stats] = await Promise.all([fetchProductos(), fetchStats()]);

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
              Catálogo
            </p>
            <h1
              className="text-[28px] font-black uppercase tracking-tight leading-none"
              style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}
            >
              Productos
            </h1>
            <p className="text-[13px] mt-1" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
              {total} productos en total
            </p>
          </div>
          <Link href="/admin/productos/crear" className="btn-primary text-[11px] inline-flex items-center gap-2 shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar producto
          </Link>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* ── Stats ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: "Total",      value: stats.total,      color: "var(--color-cq-muted, #64748b)" },
            { label: "Activos",    value: stats.activos,    color: "#059669" },
            { label: "Inactivos",  value: stats.inactivos,  color: "var(--color-cq-muted-2, #94a3b8)" },
            { label: "Borradores", value: stats.borradores, color: "#d97706" },
          ].map(s => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 px-4 py-2 rounded-lg"
              style={{ background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span
                className="text-[11px] uppercase tracking-wider font-semibold"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}
              >
                {s.label}
              </span>
              <span
                className="text-[16px] font-black"
                style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)", letterSpacing: "-0.02em" }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Tabla ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)", boxShadow: "var(--shadow-card)" }}
        >
          <ProductosTable initialProductos={productos} initialTotal={total} />
        </div>

      </div>
    </div>
  );
}