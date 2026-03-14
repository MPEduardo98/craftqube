// app/(admin)/admin/productos/page.tsx
// ─────────────────────────────────────────────────────────────
// Página: /admin/productos
// Server Component: obtiene los datos iniciales y pasa al
// client component ProductosTable para interactividad.
// ─────────────────────────────────────────────────────────────
import Link from "next/link";
import { pool } from "@/app/global/lib/db/pool";
import type { RowDataPacket } from "mysql2";
import { ProductosTable } from "./components/ProductosTable";

export const metadata = { title: "Productos" };

// Tipos
export interface ProductoRow {
  id:           number;
  titulo:       string;
  slug:         string;
  estado:       "activo" | "inactivo" | "borrador";
  precio:       number | null;
  stock_total:  number;
  imagen_url:   string | null;
  categorias:   string | null;
  marca_nombre: string | null;
  updated_at:   string;
}

async function fetchProductos(): Promise<{ productos: ProductoRow[]; total: number }> {
  const [rows] = await pool.execute<RowDataPacket[]>(`
    SELECT
      p.id,
      p.titulo,
      p.slug,
      p.estado,
      p.updated_at,
      m.nombre AS marca_nombre,
      (SELECT pv.precio_final
       FROM producto_variantes pv
       WHERE pv.producto_id = p.id AND pv.es_default = 1
       LIMIT 1) AS precio,
      (SELECT COALESCE(SUM(pv2.stock), 0)
       FROM producto_variantes pv2
       WHERE pv2.producto_id = p.id) AS stock_total,
      (SELECT pi.url
       FROM producto_imagenes pi
       WHERE pi.producto_id = p.id
       ORDER BY pi.orden ASC LIMIT 1) AS imagen_url,
      GROUP_CONCAT(DISTINCT c.nombre ORDER BY c.nombre SEPARATOR ', ') AS categorias
    FROM productos p
    LEFT JOIN marcas m              ON m.id = p.marca_id
    LEFT JOIN producto_categorias pc ON pc.producto_id = p.id
    LEFT JOIN categorias c          ON c.id = pc.categoria_id
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
      COUNT(*) AS total,
      SUM(estado = 'activo')   AS activos,
      SUM(estado = 'inactivo') AS inactivos,
      SUM(estado = 'borrador') AS borradores
    FROM productos WHERE deleted_at IS NULL
  `);
  return row as { total: number; activos: number; inactivos: number; borradores: number };
}

export default async function ProductosPage() {
  const [{ productos, total }, stats] = await Promise.all([
    fetchProductos(),
    fetchStats(),
  ]);

  return (
    <div className="p-6 space-y-5">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} productos en total</p>
        </div>
        <Link
          href="/admin/productos/crear"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar producto
        </Link>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total",      value: stats.total,      color: "bg-slate-100 text-slate-700" },
          { label: "Activos",    value: stats.activos,    color: "bg-green-50 text-green-700" },
          { label: "Inactivos",  value: stats.inactivos,  color: "bg-slate-50 text-slate-500" },
          { label: "Borradores", value: stats.borradores, color: "bg-amber-50 text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color.split(" ")[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabla con búsqueda y filtros — Client Component */}
      <ProductosTable initialProductos={productos} initialTotal={total} />
    </div>
  );
}