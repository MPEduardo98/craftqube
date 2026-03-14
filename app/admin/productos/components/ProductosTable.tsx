"use client";
// app/(admin)/admin/productos/_components/ProductosTable.tsx
// ─────────────────────────────────────────────────────────────
// Tabla interactiva de productos con búsqueda, filtros y
// paginación client-side que llama a /api/admin/productos.
// ─────────────────────────────────────────────────────────────
import { useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ProductoRow } from "../page";

const ESTADO_BADGE: Record<string, { label: string; cls: string }> = {
  activo:    { label: "Activo",    cls: "bg-green-100 text-green-700" },
  inactivo:  { label: "Inactivo",  cls: "bg-slate-100 text-slate-500" },
  borrador:  { label: "Borrador",  cls: "bg-amber-100 text-amber-700" },
};

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "/uploads/";

interface Props {
  initialProductos: ProductoRow[];
  initialTotal:     number;
}

export function ProductosTable({ initialProductos, initialTotal }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [productos, setProductos] = useState<ProductoRow[]>(initialProductos);
  const [total, setTotal]         = useState(initialTotal);
  const [q, setQ]                 = useState("");
  const [estado, setEstado]       = useState("");
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(Math.ceil(initialTotal / 20));
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState<Set<number>>(new Set());

  const limit = 20;

  const fetchData = useCallback(
    async (params: { q?: string; estado?: string; page?: number }) => {
      setLoading(true);
      const sp = new URLSearchParams({
        q:      params.q      ?? q,
        estado: params.estado ?? estado,
        page:   String(params.page ?? page),
        limit:  String(limit),
      });
      const res  = await fetch(`/api/admin/productos?${sp.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProductos(json.data);
        setTotal(json.meta.total);
        setPages(json.meta.pages);
      }
      setLoading(false);
    },
    [q, estado, page]
  );

  const handleSearch = (val: string) => {
    setQ(val);
    setPage(1);
    void fetchData({ q: val, page: 1 });
  };

  const handleEstado = (val: string) => {
    setEstado(val);
    setPage(1);
    void fetchData({ estado: val, page: 1 });
  };

  const handlePage = (p: number) => {
    setPage(p);
    void fetchData({ page: p });
  };

  const handleDelete = async (id: number, titulo: string) => {
    if (!confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) return;
    const res = await fetch(`/api/admin/productos/${id}`, { method: "DELETE" });
    if (res.ok) {
      startTransition(() => router.refresh());
      void fetchData({});
    } else {
      alert("Error al eliminar el producto");
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === productos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(productos.map((p) => p.id)));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Barra de herramientas */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
          />
        </div>

        {/* Filtro estado */}
        <select
          value={estado}
          onChange={(e) => handleEstado(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition text-slate-700"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="borrador">Borrador</option>
        </select>

        {/* Acciones masivas */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-500">{selected.size} seleccionados</span>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition">
              Eliminar
            </button>
          </div>
        )}

        <div className="ml-auto text-sm text-slate-500">
          {total} producto{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="pl-4 pr-2 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selected.size === productos.length && productos.length > 0}
                  onChange={toggleAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Producto</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Categoría</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Precio</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Stock</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 ${loading ? "opacity-50" : ""}`}>
            {productos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="font-medium text-slate-500">No se encontraron productos</p>
                    <Link href="/admin/productos/crear" className="text-indigo-600 hover:underline text-sm">
                      Crear el primero
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              productos.map((p) => {
                const badge = ESTADO_BADGE[p.estado] ?? ESTADO_BADGE.borrador;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="pl-4 pr-2 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>

                    {/* Producto */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                          {p.imagen_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`${IMAGE_BASE}${p.imagen_url}`}
                              alt={p.titulo}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate max-w-[280px]">{p.titulo}</p>
                          <p className="text-xs text-slate-400 truncate">{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[160px] truncate">
                      {p.categorias ?? "—"}
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-3 text-right font-medium text-slate-800">
                      {p.precio != null
                        ? `$${Number(p.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
                        : <span className="text-slate-400">—</span>}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${p.stock_total === 0 ? "text-red-600" : p.stock_total < 10 ? "text-amber-600" : "text-slate-700"}`}>
                        {p.stock_total}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/productos/editar/${p.id}`}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/productos/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Ver en tienda"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.titulo)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Página {page} de {pages} — {total} resultados
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page === 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`w-8 h-8 text-sm rounded-lg transition ${
                    p === page
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page === pages || loading}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}