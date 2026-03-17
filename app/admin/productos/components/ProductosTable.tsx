// app/admin/productos/components/ProductosTable.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  LayoutList,
  LayoutGrid,
  Search,
  ChevronDown,
  AlertTriangle,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
} from "lucide-react";

export type ProductoEstado = "activo" | "inactivo" | "borrador";

export interface Producto {
  id: number;
  titulo: string;
  slug: string;
  estado: ProductoEstado;
  imagen?: string;
  precio?: number;
  stock?: number;
  sku?: string;
  created_at: string;
  updated_at: string;
}

type SortField = "titulo" | "estado" | "precio" | "stock" | "created_at";
type SortDir = "asc" | "desc";
type ViewMode = "lista" | "cuadricula";

const ESTADO_CONFIG: Record<
  ProductoEstado,
  { label: string; classes: string; dot: string }
> = {
  activo: {
    label: "Activo",
    classes:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  inactivo: {
    label: "Inactivo",
    classes: "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200",
    dot: "bg-zinc-400",
  },
  borrador: {
    label: "Borrador",
    classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-400",
  },
};

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "titulo", label: "Nombre" },
  { field: "estado", label: "Estado" },
  { field: "precio", label: "Precio" },
  { field: "stock", label: "Stock" },
  { field: "created_at", label: "Fecha creación" },
];

function EstadoBadge({ estado }: { estado: ProductoEstado }) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function DeleteModal({
  producto,
  onConfirm,
  onCancel,
  loading,
}: {
  producto: Producto;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-zinc-900">
                Eliminar producto
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Esta acción no se puede deshacer. El producto y todos sus datos
                asociados serán eliminados permanentemente.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="ml-2 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Product info */}
          <div className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-200">
            <div className="flex items-center gap-3">
              {producto.imagen ? (
                <img
                  src={producto.imagen}
                  alt={producto.titulo}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200">
                  <Package className="h-5 w-5 text-zinc-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {producto.titulo}
                </p>
                <p className="text-xs text-zinc-500">{producto.slug}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Eliminando…
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar producto
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortDropdown({
  sortField,
  sortDir,
  onSort,
}: {
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel =
    SORT_OPTIONS.find((o) => o.field === sortField)?.label ?? "Ordenar";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        <ArrowUpDown className="h-4 w-4 text-zinc-400" />
        {currentLabel}
        {sortDir === "asc" ? (
          <ArrowUp className="h-3.5 w-3.5 text-zinc-400" />
        ) : (
          <ArrowDown className="h-3.5 w-3.5 text-zinc-400" />
        )}
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-44 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.field}
                onClick={() => {
                  onSort(opt.field);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-zinc-50 ${
                  sortField === opt.field
                    ? "font-medium text-zinc-900"
                    : "text-zinc-600"
                }`}
              >
                {opt.label}
                {sortField === opt.field && (
                  sortDir === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5 text-zinc-400" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-zinc-400" />
                  )
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── List Row ──────────────────────────────────────────────────────────────────
function ProductoRow({
  producto,
  onDelete,
}: {
  producto: Producto;
  onDelete: (p: Producto) => void;
}) {
  const router = useRouter();

  return (
    <tr className="group border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 transition-colors">
      {/* Imagen */}
      <td className="w-14 py-3 pl-4 pr-0">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.titulo}
            className="h-10 w-10 rounded-lg object-cover ring-1 ring-zinc-200"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 ring-1 ring-zinc-200">
            <Package className="h-4 w-4 text-zinc-300" />
          </div>
        )}
      </td>

      {/* Título — clickeable para editar */}
      <td className="px-4 py-3">
        <button
          onClick={() => router.push(`/admin/productos/${producto.id}/editar`)}
          className="group/title text-left"
          title="Editar producto"
        >
          <span className="line-clamp-1 text-sm font-medium text-zinc-900 group-hover/title:text-blue-600 group-hover/title:underline underline-offset-2 transition-colors cursor-pointer">
            {producto.titulo}
          </span>
          <span className="mt-0.5 block text-xs text-zinc-400">
            /{producto.slug}
          </span>
        </button>
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <EstadoBadge estado={producto.estado} />
      </td>

      {/* SKU */}
      <td className="hidden px-4 py-3 md:table-cell">
        <span className="font-mono text-xs text-zinc-500">
          {producto.sku ?? "—"}
        </span>
      </td>

      {/* Precio */}
      <td className="hidden px-4 py-3 text-right lg:table-cell">
        <span className="text-sm text-zinc-700">
          {producto.precio != null
            ? `$${producto.precio.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}`
            : "—"}
        </span>
      </td>

      {/* Stock */}
      <td className="hidden px-4 py-3 text-right xl:table-cell">
        <span
          className={`text-sm font-medium ${
            (producto.stock ?? 0) > 0 ? "text-zinc-700" : "text-red-500"
          }`}
        >
          {producto.stock ?? 0}
        </span>
      </td>

      {/* Acciones */}
      <td className="py-3 pr-4 pl-2">
        <div className="flex items-center justify-end">
          <button
            onClick={() => onDelete(producto)}
            className="rounded-lg p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            title="Eliminar producto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Grid Card ─────────────────────────────────────────────────────────────────
function ProductoCard({
  producto,
  onDelete,
}: {
  producto: Producto;
  onDelete: (p: Producto) => void;
}) {
  const router = useRouter();

  return (
    <div className="group relative rounded-2xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md">
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(producto);
        }}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        title="Eliminar producto"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Imagen */}
      <div className="mb-3 aspect-square w-full overflow-hidden rounded-xl bg-zinc-100">
        {producto.imagen ? (
          <img
            src={producto.imagen}
            alt={producto.titulo}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-zinc-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <button
        onClick={() => router.push(`/admin/productos/${producto.id}/editar`)}
        className="w-full text-left"
        title="Editar producto"
      >
        <h3 className="line-clamp-2 text-sm font-medium text-zinc-900 hover:text-blue-600 hover:underline underline-offset-2 transition-colors cursor-pointer">
          {producto.titulo}
        </h3>
      </button>

      <div className="mt-2 flex items-center justify-between">
        <EstadoBadge estado={producto.estado} />
        {producto.precio != null && (
          <span className="text-sm font-semibold text-zinc-800">
            ${producto.precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>

      {producto.sku && (
        <p className="mt-1.5 font-mono text-xs text-zinc-400">{producto.sku}</p>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProductosTable({
  productos: initialProductos,
}: {
  productos: Producto[];
}) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<ProductoEstado | "todos">(
    "todos"
  );
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("lista");
  const [toDelete, setToDelete] = useState<Producto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [productos, setProductos] = useState(initialProductos);

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!toDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/productos/${toDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== toDelete.id));
        setToDelete(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  }, [toDelete]);

  const filtered = useMemo(() => {
    let result = [...productos];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      result = result.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    if (filtroEstado !== "todos") {
      result = result.filter((p) => p.estado === filtroEstado);
    }

    result.sort((a, b) => {
      let va: string | number = a[sortField] ?? "";
      let vb: string | number = b[sortField] ?? "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [productos, busqueda, filtroEstado, sortField, sortDir]);

  // Counts por estado
  const counts = useMemo(
    () => ({
      todos: productos.length,
      activo: productos.filter((p) => p.estado === "activo").length,
      inactivo: productos.filter((p) => p.estado === "inactivo").length,
      borrador: productos.filter((p) => p.estado === "borrador").length,
    }),
    [productos]
  );

  const FILTROS: { key: ProductoEstado | "todos"; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "activo", label: "Activos" },
    { key: "inactivo", label: "Inactivos" },
    { key: "borrador", label: "Borradores" },
  ];

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, slug o SKU…"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <SortDropdown
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
          />

          {/* View toggle */}
          <div className="flex rounded-xl border border-zinc-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode("lista")}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === "lista"
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
              title="Vista lista"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("cuadricula")}
              className={`rounded-lg p-1.5 transition-colors ${
                viewMode === "cuadricula"
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
              title="Vista cuadrícula"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Estado Filters ── */}
      <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-0.5">
        {FILTROS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFiltroEstado(key)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              filtroEstado === key
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                filtroEstado === key
                  ? "bg-white/20 text-white"
                  : "bg-zinc-200 text-zinc-500"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}

        {/* Results summary */}
        {(busqueda || filtroEstado !== "todos") && (
          <span className="ml-auto shrink-0 text-xs text-zinc-400">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
            <Package className="mb-3 h-8 w-8 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">
              No se encontraron productos
            </p>
            {(busqueda || filtroEstado !== "todos") && (
              <button
                onClick={() => {
                  setBusqueda("");
                  setFiltroEstado("todos");
                }}
                className="mt-2 text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : viewMode === "lista" ? (
          // ── List View ──
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/70">
                  <th className="w-14 py-2.5 pl-4 pr-0" />
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Producto
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Estado
                  </th>
                  <th className="hidden px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-400 md:table-cell">
                    SKU
                  </th>
                  <th className="hidden px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400 lg:table-cell">
                    Precio
                  </th>
                  <th className="hidden px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-zinc-400 xl:table-cell">
                    Stock
                  </th>
                  <th className="py-2.5 pr-4 pl-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <ProductoRow
                    key={p.id}
                    producto={p}
                    onDelete={setToDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // ── Grid View ──
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((p) => (
              <ProductoCard
                key={p.id}
                producto={p}
                onDelete={setToDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Delete Modal ── */}
      {toDelete && (
        <DeleteModal
          producto={toDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !deleteLoading && setToDelete(null)}
          loading={deleteLoading}
        />
      )}
    </>
  );
}