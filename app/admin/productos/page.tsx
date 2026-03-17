// app/admin/productos/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import ProductosTable, {
  type Producto,
} from "./components/ProductosTable";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

async function getProductos(): Promise<Producto[]> {
  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT
      p.id,
      p.titulo,
      p.slug,
      p.estado,
      p.created_at,
      p.updated_at,
      MIN(pi.url)                AS imagen,
      MIN(pv.sku)                AS sku,
      MIN(pv.precio_final)       AS precio,
      COALESCE(SUM(pv.stock), 0) AS stock
    FROM productos p
    LEFT JOIN producto_imagenes pi ON pi.producto_id = p.id AND pi.orden = 0
    LEFT JOIN producto_variantes pv ON pv.producto_id = p.id
    WHERE p.deleted_at IS NULL
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `);

  return rows.map((r) => ({
    id: r.id,
    titulo: r.titulo,
    slug: r.slug,
    estado: r.estado,
    imagen: r.imagen ?? undefined,
    sku: r.sku ?? undefined,
    precio: r.precio != null ? Number(r.precio) : undefined,
    stock: Number(r.stock),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  }));
}

export const metadata = {
  title: "Productos — Admin",
};

export default async function AdminProductosPage() {
  const productos = await getProductos();

  return (
    <main className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Productos</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {productos.length} producto{productos.length !== 1 ? "s" : ""} en
            total
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Link>
      </div>

      <ProductosTable productos={productos} />
    </main>
  );
}