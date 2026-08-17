// app/admin/categorias/page.tsx
import { pool } from "@/shared/lib/db/pool";
import type { RowDataPacket } from "mysql2";
import { CategoriasTable }        from "@/features/admin/categorias/components/CategoriasTable";
import { CrearCategoriaButton }   from "@/features/admin/categorias/components/CrearCategoriaButton";
import { BulkEditProvider, HideOnBulkEdit } from "@/shared/components/ui/BulkEditContext";
import type { CategoriaRow } from "@/features/admin/categorias/types";

export const metadata = { title: "Categorías" };

const LIMIT = 20;

async function fetchCategorias() {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      c.id, c.nombre, c.slug, c.descripcion, c.imagen, c.parent_id,
      p.nombre AS parent_nombre,
      COUNT(DISTINCT pc.producto_id) AS total_productos
    FROM categorias c
    LEFT JOIN categorias p           ON p.id = c.parent_id
    LEFT JOIN producto_categorias pc ON pc.categoria_id = c.id
    GROUP BY c.id, c.nombre, c.slug, c.descripcion, c.imagen, c.parent_id, p.nombre
    ORDER BY c.nombre ASC
    LIMIT ?
  `, [LIMIT]);

  const [[{ total }]] = await pool.execute<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM categorias"
  );

  return { categorias: rows as CategoriaRow[], total: Number(total) };
}

export default async function CategoriasPage() {
  const { categorias, total } = await fetchCategorias();

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
              Catálogo
            </p>
            <h1
              className="text-[28px] font-black uppercase tracking-tight leading-none"
              style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}
            >
              Categorías
            </h1>
            <p className="text-[13px] mt-1" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
              {total} categorías en total
            </p>
          </div>
          <HideOnBulkEdit>
            <div className="flex items-center gap-2.5 shrink-0">
              <CrearCategoriaButton categorias={categorias} />
            </div>
          </HideOnBulkEdit>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">

        {/* ── Tabla ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)", boxShadow: "var(--shadow-card)" }}
        >
          <CategoriasTable initialCategorias={categorias} initialTotal={total} />
        </div>

      </div>
    </div>
    </BulkEditProvider>
  );
}
