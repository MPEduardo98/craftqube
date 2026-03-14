// app/(admin)/admin/productos/crear/page.tsx
// ─────────────────────────────────────────────────────────────
// Página: /admin/productos/crear
// Server Component: carga categorías y marcas del servidor,
// luego renderiza el ProductoForm en modo "crear".
// ─────────────────────────────────────────────────────────────
import { pool }         from "@/app/global/lib/db/pool";
import type { RowDataPacket } from "mysql2";
import { ProductoForm } from "../components/ProductoForm";

export const metadata = { title: "Nuevo producto" };

async function fetchCatalogData() {
  const [categorias, marcas] = await Promise.all([
    pool.execute<RowDataPacket[]>(
      "SELECT id, nombre, slug FROM categorias ORDER BY nombre ASC"
    ),
    pool.execute<RowDataPacket[]>(
      "SELECT id, nombre FROM marcas ORDER BY nombre ASC"
    ),
  ]);
  return {
    categorias: categorias[0] as { id: number; nombre: string; slug: string }[],
    marcas:     marcas[0]     as { id: number; nombre: string }[],
  };
}

export default async function CrearProductoPage() {
  const { categorias, marcas } = await fetchCatalogData();

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      <ProductoForm
        mode="crear"
        categorias={categorias}
        marcas={marcas}
      />
    </div>
  );
}