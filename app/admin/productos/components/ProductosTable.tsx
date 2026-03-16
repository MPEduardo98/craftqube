// app/admin/productos/components/ProductosTable.tsx
"use client";
import { useState, useCallback } from "react";
import Link                       from "next/link";
import { useRouter }              from "next/navigation";
import type { ProductoRow } from "../types";
import { resolveImageUrl }  from "@/app/global/lib/resolveImageUrl";

const BADGES = {
  activo:   { label: "Activo",   dot: "#059669", color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.2)"  },
  inactivo: { label: "Inactivo", dot: "#94a3b8", color: "#475569", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" },
  borrador: { label: "Borrador", dot: "#d97706", color: "#92400e", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)"  },
};

interface Props {
  initialProductos: ProductoRow[];
  initialTotal:     number;
}

export function ProductosTable({ initialProductos, initialTotal }: Props) {
  const router = useRouter();
  const [productos, setProductos] = useState<ProductoRow[]>(initialProductos);
  const [total, setTotal]         = useState(initialTotal);
  const [q, setQ]                 = useState("");
  const [estado, setEstado]       = useState("");
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(Math.ceil(initialTotal / 20));
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const limit = 20;

  const fetchData = useCallback(async (p: { q?: string; estado?: string; page?: number }) => {
    setLoading(true);
    const sp = new URLSearchParams({ q: p.q ?? q, estado: p.estado ?? estado, page: String(p.page ?? page), limit: String(limit) });
    try {
      const res  = await fetch(`/api/admin/productos?${sp}`);
      const json = await res.json();
      if (json.success) { setProductos(json.data); setTotal(json.meta.total); setPages(json.meta.pages); }
    } finally { setLoading(false); }
  }, [q, estado, page]);

  const toggleSelect = (id: number) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () =>
    setSelected(prev => prev.size === productos.length ? new Set() : new Set(productos.map(p => p.id)));

  const handleDelete = async (id: number, titulo: string) => {
    if (!confirm(`¿Eliminar "${titulo}"?`)) return;
    const res = await fetch(`/api/admin/productos/${id}`, { method: "DELETE" });
    if (res.ok) { router.refresh(); void fetchData({}); }
    else alert("Error al eliminar.");
  };

  const HEADERS = ["", "Producto", "Estado", "Precio", "Stock", "Acciones"];

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}>
        <input
          type="search" value={q} placeholder="Buscar producto…"
          onChange={(e) => { setQ(e.target.value); void fetchData({ q: e.target.value, page: 1 }); setPage(1); }}
          className="flex-1 min-w-0 text-[13px] px-3 py-2 rounded-lg outline-none"
          style={{ background: "var(--color-cq-surface-2, #f8fafc)", border: "1px solid var(--color-cq-border, #e2e8f0)", color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-body, sans-serif)" }}
        />
        <select value={estado}
          onChange={(e) => { setEstado(e.target.value); void fetchData({ estado: e.target.value, page: 1 }); setPage(1); }}
          className="text-[12px] px-3 py-2 rounded-lg outline-none"
          style={{ background: "var(--color-cq-surface-2, #f8fafc)", border: "1px solid var(--color-cq-border, #e2e8f0)", color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-mono, monospace)" }}>
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="borrador">Borrador</option>
        </select>
        {selected.size > 0 && (
          <span className="text-[11px] px-2.5 py-1 rounded-full"
            style={{ background: "var(--color-cq-accent-glow, #eff6ff)", color: "var(--color-cq-accent, #2563eb)", fontFamily: "var(--font-mono, monospace)" }}>
            {selected.size} sel.
          </span>
        )}
      </div>

      {/* ── Tabla ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)", background: "var(--color-cq-surface-2, #f8fafc)" }}>
              <th className="pl-5 pr-3 py-3">
                <input type="checkbox"
                  checked={selected.size === productos.length && productos.length > 0}
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600" />
              </th>
              {HEADERS.slice(1).map((h, i) => (
                <th key={h} className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider ${i >= 2 ? "text-right" : ""} ${i === 4 ? "pr-5" : ""}`}
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--color-cq-surface-2, #f1f5f9)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
                    No se encontraron productos
                  </p>
                  <Link href="/admin/productos/crear" className="text-[12px] font-semibold"
                    style={{ color: "var(--color-cq-accent, #2563eb)", fontFamily: "var(--font-mono, monospace)" }}>
                    + Crear el primero
                  </Link>
                </div>
              </td></tr>
            ) : productos.map((p) => {
              const badge  = BADGES[p.estado as keyof typeof BADGES] ?? BADGES.borrador;
              const sel    = selected.has(p.id);
              // resolveImageUrl maneja URLs R2 completas y nombres de archivo locales
              const imgSrc = resolveImageUrl(p.imagen_url, p.id);
              return (
                <tr key={p.id} className={`ptbl-row${sel ? " sel" : ""}`}>
                  <td className="pl-5 pr-3 py-3.5">
                    <input type="checkbox" checked={sel} onChange={() => toggleSelect(p.id)}
                      className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ background: "var(--color-cq-surface-2, #f1f5f9)", border: "1px solid var(--color-cq-border, #e2e8f0)" }}>
                        {imgSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgSrc} alt={p.titulo} className="w-full h-full object-contain p-1" />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                            style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold truncate max-w-[220px]"
                          style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
                          {p.titulo}
                        </p>
                        <p className="text-[11px] truncate max-w-[220px]"
                          style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
                          {p.categorias ?? p.marca ?? p.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontFamily: "var(--font-mono, monospace)" }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: badge.dot }} />
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-[13px] font-bold tabular-nums"
                      style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
                      {p.precio !== null
                        ? `$${Number(p.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
                        : <span style={{ color: "var(--color-cq-muted-2, #94a3b8)", fontWeight: 400 }}>—</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-[13px] font-bold tabular-nums"
                      style={{ fontFamily: "var(--font-display, sans-serif)", color: p.stock === 0 ? "#ef4444" : "var(--color-cq-text, #0f172a)" }}>
                      {p.stock.toLocaleString("es-MX")}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 pr-5 text-right">
                    <div className="ptbl-act">
                      <Link href={`/admin/productos/${p.id}/editar`} className="ptbl-btn" title="Editar">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </Link>
                      <Link href={`/producto/${p.slug}`} target="_blank" className="ptbl-btn eye" title="Ver en tienda">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.titulo)} className="ptbl-btn del" title="Eliminar">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ── */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--color-cq-border, #e2e8f0)" }}>
          <p className="text-[11px]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
            Página {page} de {pages}
          </p>
          <div className="flex items-center gap-1">
            <button className="ptbl-pgbtn" disabled={page === 1 || loading}
              onClick={() => { const p = page - 1; setPage(p); void fetchData({ page: p }); }}>←</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, pages - 4));
              const pg = start + i;
              return (
                <button key={pg} className={`ptbl-pgbtn${pg === page ? " active" : ""}`}
                  disabled={loading}
                  onClick={() => { setPage(pg); void fetchData({ page: pg }); }}>
                  {pg}
                </button>
              );
            })}
            <button className="ptbl-pgbtn" disabled={page === pages || loading}
              onClick={() => { const p = page + 1; setPage(p); void fetchData({ page: p }); }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}