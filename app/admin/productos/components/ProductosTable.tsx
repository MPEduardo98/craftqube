"use client";
// app/admin/productos/components/ProductosTable.tsx
import { useState, useCallback, useRef, useEffect } from "react";
import Link        from "next/link";
import { useRouter } from "next/navigation";
import type { ProductoRow } from "../types";

/* ── Constantes ─────────────────────────────────────────────── */
const BADGES = {
  activo:   { label: "Activo",   dot: "#059669", color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.2)"  },
  inactivo: { label: "Inactivo", dot: "#94a3b8", color: "#475569", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" },
  borrador: { label: "Borrador", dot: "#d97706", color: "#92400e", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)"  },
};

const SORT_OPTIONS = [
  { value: "updated_at_desc", label: "Más reciente" },
  { value: "updated_at_asc",  label: "Más antiguo"  },
  { value: "titulo_asc",      label: "Nombre A–Z"   },
  { value: "titulo_desc",     label: "Nombre Z–A"   },
  { value: "precio_asc",      label: "Precio ↑"     },
  { value: "precio_desc",     label: "Precio ↓"     },
  { value: "stock_asc",       label: "Stock ↑"      },
  { value: "stock_desc",      label: "Stock ↓"      },
];

function getImageUrl(id: number, filename: string | null): string | null {
  if (!filename) return null;
  return filename.startsWith("http") ? filename : `/productos/${id}/${filename}`;
}

/* ── Modal de confirmación ───────────────────────────────────── */
function DeleteModal({
  producto,
  onConfirm,
  onCancel,
  loading,
}: {
  producto: { id: number; titulo: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!producto) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
        style={{
          background:  "var(--color-cq-surface, #fff)",
          border:      "1px solid var(--color-cq-border, #e2e8f0)",
          boxShadow:   "0 20px 60px rgba(0,0,0,0.18)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icono */}
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
        </div>

        {/* Texto */}
        <div className="text-center flex flex-col gap-1.5">
          <p className="text-[15px] font-bold" style={{ color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-display, sans-serif)" }}>
            Eliminar producto
          </p>
          <p className="text-[13px]" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)", lineHeight: 1.5 }}>
            ¿Estás seguro de que quieres eliminar{" "}
            <span className="font-semibold" style={{ color: "var(--color-cq-text, #0f172a)" }}>
              {producto.titulo}
            </span>
            ? Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
            style={{ border: "1px solid var(--color-cq-border, #e2e8f0)", background: "var(--color-cq-surface-2, #f8fafc)", color: "var(--color-cq-muted, #64748b)", cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
            style={{ background: loading ? "rgba(239,68,68,0.6)" : "#ef4444", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Dropdown ordenar ────────────────────────────────────────── */
function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find(o => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors"
        style={{
          border:     "1px solid var(--color-cq-border, #e2e8f0)",
          background: open ? "var(--color-cq-surface-2, #f1f5f9)" : "var(--color-cq-surface, #fff)",
          color:      "var(--color-cq-muted, #64748b)",
          fontFamily: "var(--font-mono, monospace)",
          cursor:     "pointer",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/>
        </svg>
        {current.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden z-30 py-1"
          style={{ background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
        >
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-[12px] transition-colors flex items-center gap-2"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color:      o.value === value ? "var(--color-cq-accent, #2563eb)" : "var(--color-cq-text, #0f172a)",
                background: o.value === value ? "var(--color-cq-accent-glow, rgba(37,99,235,0.06))" : "transparent",
                cursor:     "pointer",
              }}
            >
              {o.value === value && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
              <span style={{ marginLeft: o.value === value ? 0 : 14 }}>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Vista cuadrícula — card de producto ─────────────────────── */
function ProductoCard({
  p,
  selected,
  onToggle,
  onDelete,
}: {
  p: ProductoRow;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const badge  = BADGES[p.estado as keyof typeof BADGES] ?? BADGES.borrador;
  const imgSrc = getImageUrl(p.id, p.imagen_url);
  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col transition-shadow"
      style={{
        border:     selected ? "1.5px solid var(--color-cq-accent, #2563eb)" : "1px solid var(--color-cq-border, #e2e8f0)",
        background: selected ? "var(--color-cq-accent-glow, rgba(37,99,235,0.03))" : "var(--color-cq-surface, #fff)",
        boxShadow:  "var(--shadow-card)",
      }}
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden" style={{ background: "var(--color-cq-surface-2, #f1f5f9)" }}>
        {imgSrc ? (
          <img src={imgSrc} alt={p.titulo} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #cbd5e1)" }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        {/* Checkbox */}
        <div className="absolute top-2.5 left-2.5">
          <input type="checkbox" checked={selected} onChange={onToggle}
            className="w-4 h-4 rounded cursor-pointer accent-blue-600"
            style={{ opacity: selected ? 1 : 0, transition: "opacity .15s" }}
            onClick={e => e.stopPropagation()}
          />
        </div>
        <div className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/producto/${p.slug}`} target="_blank"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", color: "var(--color-cq-muted, #64748b)" }}
            onClick={e => e.stopPropagation()}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </Link>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(4px)", color: "#ef4444", border: "none", cursor: "pointer" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link
          href={`/admin/productos/${p.id}/editar`}
          className="text-[13px] font-semibold leading-snug hover:underline line-clamp-2"
          style={{ color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-display, sans-serif)", textDecoration: "none" }}
        >
          {p.titulo}
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontFamily: "var(--font-mono, monospace)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: badge.dot }} />
            {badge.label}
          </span>
          <span className="text-[13px] font-bold tabular-nums" style={{ color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-display, sans-serif)" }}>
            {p.precio != null ? `$${Number(p.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────── */
interface Props {
  initialProductos: ProductoRow[];
  initialTotal:     number;
}

export function ProductosTable({ initialProductos, initialTotal }: Props) {
  const router = useRouter();

  const [productos, setProductos] = useState<ProductoRow[]>(initialProductos);
  const [total,     setTotal]     = useState(initialTotal);
  const [q,         setQ]         = useState("");
  const [estado,    setEstado]    = useState("");
  const [sort,      setSort]      = useState("updated_at_desc");
  const [page,      setPage]      = useState(1);
  const [pages,     setPages]     = useState(Math.ceil(initialTotal / 20));
  const [loading,   setLoading]   = useState(false);
  const [selected,  setSelected]  = useState<Set<number>>(new Set());
  const [view,      setView]      = useState<"list" | "grid">("list");

  // Modal eliminar
  const [deleteTarget,  setDeleteTarget]  = useState<{ id: number; titulo: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce búsqueda
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limit = 20;

  const fetchData = useCallback(async (p: { q?: string; estado?: string; sort?: string; page?: number }) => {
    setLoading(true);
    const sp = new URLSearchParams({
      q:      p.q      ?? q,
      estado: p.estado ?? estado,
      sort:   p.sort   ?? sort,
      page:   String(p.page ?? page),
      limit:  String(limit),
    });
    try {
      const res  = await fetch(`/api/admin/productos?${sp}`);
      const json = await res.json();
      if (json.success) {
        setProductos(json.data);
        setTotal(json.meta.total);
        setPages(json.meta.pages);
      }
    } finally { setLoading(false); }
  }, [q, estado, sort, page]);

  const toggleSelect = (id: number) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () =>
    setSelected(prev => prev.size === productos.length ? new Set() : new Set(productos.map(p => p.id)));

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/productos/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) { router.refresh(); void fetchData({}); }
      else alert("Error al eliminar.");
    } finally { setDeleteLoading(false); setDeleteTarget(null); }
  };

  const handleSearchChange = (value: string) => {
    setQ(value);
    setPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      void fetchData({ q: value, page: 1 });
    }, 350);
  };

  const handleEstado = (value: string) => {
    setEstado(value);
    setPage(1);
    void fetchData({ estado: value, page: 1 });
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
    void fetchData({ sort: value, page: 1 });
  };

  const ESTADO_TABS = [
    { value: "",         label: "Todos"    },
    { value: "activo",   label: "Activos"  },
    { value: "inactivo", label: "Inactivos"},
    { value: "borrador", label: "Borradores"},
  ];

  return (
    <>
      <style>{`
        .ptbl-row { border-bottom: 1px solid var(--color-cq-border, #e2e8f0); transition: background .1s; }
        .ptbl-row:hover { background: var(--color-cq-surface-2, #f8fafc); }
        .ptbl-row.sel { background: var(--color-cq-accent-glow, rgba(37,99,235,0.05)); }
        .ptbl-act { display:flex; align-items:center; justify-content:flex-end; gap:4px; opacity:0; transition:opacity .15s; }
        .ptbl-row:hover .ptbl-act { opacity: 1; }
        .ptbl-btn {
          width:28px; height:28px; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          color: var(--color-cq-muted, #64748b);
          background: transparent; border: none; cursor: pointer;
          transition: color .15s, background .15s;
        }
        .ptbl-btn:hover { color: var(--color-cq-text, #0f172a); background: var(--color-cq-surface-2, #f1f5f9); }
        .ptbl-btn.del:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
        .ptbl-input {
          width: 100%; padding: 8px 12px 8px 32px;
          background: var(--color-cq-surface-2, #f1f5f9);
          border: 1px solid var(--color-cq-border, #e2e8f0);
          border-radius: 8px; outline: none;
          font-size: 13px; color: var(--color-cq-text, #0f172a);
          font-family: var(--font-body, sans-serif);
          transition: border-color .15s, box-shadow .15s;
        }
        .ptbl-input:focus {
          border-color: var(--color-cq-accent, #2563eb);
          box-shadow: 0 0 0 3px var(--color-cq-accent-glow, rgba(37,99,235,0.12));
          background: var(--color-cq-surface, #fff);
        }
        .ptbl-pgbtn {
          width:30px; height:30px; border-radius:7px; border:1px solid var(--color-cq-border, #e2e8f0);
          display:flex; align-items:center; justify-content:center;
          font-size:12px; cursor:pointer; transition:all .15s;
          font-family: var(--font-mono, monospace);
          color: var(--color-cq-muted, #64748b);
          background: var(--color-cq-surface, #fff);
        }
        .ptbl-pgbtn:hover:not(:disabled) { border-color:var(--color-cq-accent,#2563eb); color:var(--color-cq-accent,#2563eb); }
        .ptbl-pgbtn.act { background:var(--color-cq-accent,#2563eb); color:#fff; border-color:var(--color-cq-accent,#2563eb); }
        .ptbl-pgbtn:disabled { opacity:.35; cursor:not-allowed; }
        .ptbl-title-link {
          font-size:13px; font-weight:600; line-height:1.35;
          color: var(--color-cq-text, #0f172a);
          font-family: var(--font-display, sans-serif);
          text-decoration: none; cursor: pointer;
          transition: color .15s;
        }
        .ptbl-title-link:hover { color: var(--color-cq-accent, #2563eb); text-decoration: underline; }
        .ptbl-view-btn {
          width:32px; height:32px; border-radius:8px; border:1px solid var(--color-cq-border,#e2e8f0);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .15s;
          color: var(--color-cq-muted,#64748b);
          background: var(--color-cq-surface,#fff);
        }
        .ptbl-view-btn.act { background:var(--color-cq-accent,#2563eb); color:#fff; border-color:var(--color-cq-accent,#2563eb); }
        .ptbl-view-btn:hover:not(.act) { background:var(--color-cq-surface-2,#f1f5f9); }
      `}</style>

      <DeleteModal
        producto={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      {/* ── Barra de herramientas ─────────────────────────────── */}
      <div className="flex flex-col gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}>

        {/* Fila 1: búsqueda + sort + vistas */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, categoría, marca…"
              value={q}
              className="ptbl-input"
              onChange={e => handleSearchChange(e.target.value)}
            />
            {q && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-cq-muted-2, #94a3b8)", padding: 0, display: "flex" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Ordenar */}
          <SortDropdown value={sort} onChange={handleSort} />

          {/* Toggle vista */}
          <div className="flex items-center gap-1">
            <button
              title="Vista lista"
              className={`ptbl-view-btn${view === "list" ? " act" : ""}`}
              onClick={() => setView("list")}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button
              title="Vista cuadrícula"
              className={`ptbl-view-btn${view === "grid" ? " act" : ""}`}
              onClick={() => setView("grid")}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
          </div>

          {/* Contador */}
          <span className="text-[11px] tabular-nums ml-auto shrink-0"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
            {total} resultado{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Fila 2: filtros de estado */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ESTADO_TABS.map(tab => {
            const active = estado === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleEstado(tab.value)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  border:     active ? "1px solid var(--color-cq-accent, #2563eb)" : "1px solid var(--color-cq-border, #e2e8f0)",
                  background: active ? "var(--color-cq-accent-glow, rgba(37,99,235,0.08))" : "transparent",
                  color:      active ? "var(--color-cq-accent, #2563eb)" : "var(--color-cq-muted, #64748b)",
                  cursor:     "pointer",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contenido ─────────────────────────────────────────── */}
      <div className={`transition-opacity duration-150 ${loading ? "opacity-40 pointer-events-none" : ""}`}>

        {/* Vista lista */}
        {view === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)", background: "var(--color-cq-surface-2, #fafafa)" }}>
                  <th className="pl-5 pr-3 py-3 w-10">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600"
                      checked={selected.size === productos.length && productos.length > 0}
                      onChange={toggleAll} />
                  </th>
                  {["Producto","Estado","Categoría","Precio","Stock","Acciones"].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-[10px] font-bold tracking-widest uppercase ${i >= 3 ? "text-right" : "text-left"} ${i === 5 ? "pr-5" : ""}`}
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
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
                ) : productos.map(p => {
                  const badge  = BADGES[p.estado as keyof typeof BADGES] ?? BADGES.borrador;
                  const sel    = selected.has(p.id);
                  const imgSrc = getImageUrl(p.id, p.imagen_url);
                  return (
                    <tr key={p.id} className={`ptbl-row${sel ? " sel" : ""}`}>
                      <td className="pl-5 pr-3 py-3.5">
                        <input type="checkbox" checked={sel} onChange={() => toggleSelect(p.id)}
                          className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600" />
                      </td>

                      {/* Producto — título clickable para editar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                            style={{ background: "var(--color-cq-surface-2, #f1f5f9)", border: "1px solid var(--color-cq-border, #e2e8f0)" }}>
                            {imgSrc ? (
                              <img src={imgSrc} alt={p.titulo} className="w-full h-full object-cover" />
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #cbd5e1)" }}>
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <Link href={`/admin/productos/${p.id}/editar`} className="ptbl-title-link" title="Editar producto">
                              {p.titulo}
                            </Link>
                            {p.marca && (
                              <span className="text-[11px] truncate" style={{ color: "var(--color-cq-muted-2, #94a3b8)", fontFamily: "var(--font-mono, monospace)" }}>
                                {p.marca}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, fontFamily: "var(--font-mono, monospace)" }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: badge.dot }} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Categoría */}
                      <td className="px-4 py-3.5">
                        <span className="text-[12px]" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
                          {p.categorias ?? <span style={{ color: "var(--color-cq-muted-2)" }}>—</span>}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] font-bold tabular-nums"
                          style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
                          {p.precio != null
                            ? `$${Number(p.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
                            : <span style={{ color: "var(--color-cq-muted-2)", fontWeight: 400 }}>—</span>}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] font-bold tabular-nums"
                          style={{ fontFamily: "var(--font-display, sans-serif)", color: p.stock === 0 ? "#ef4444" : "var(--color-cq-text, #0f172a)" }}>
                          {p.stock.toLocaleString("es-MX")}
                        </span>
                      </td>

                      {/* Acciones — sin botón editar, solo ojo y eliminar */}
                      <td className="px-4 py-3.5 pr-5 text-right">
                        <div className="ptbl-act">
                          <Link href={`/producto/${p.slug}`} target="_blank" className="ptbl-btn" title="Ver en tienda">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </Link>
                          <button
                            onClick={() => setDeleteTarget({ id: p.id, titulo: p.titulo })}
                            className="ptbl-btn del"
                            title="Eliminar"
                          >
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
        )}

        {/* Vista cuadrícula */}
        {view === "grid" && (
          <div className="p-5">
            {productos.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--color-cq-surface-2, #f1f5f9)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <p className="text-[13px] font-medium" style={{ color: "var(--color-cq-muted, #64748b)" }}>No se encontraron productos</p>
                <Link href="/admin/productos/crear" className="text-[12px] font-semibold" style={{ color: "var(--color-cq-accent, #2563eb)" }}>
                  + Crear el primero
                </Link>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {productos.map(p => (
                  <ProductoCard
                    key={p.id}
                    p={p}
                    selected={selected.has(p.id)}
                    onToggle={() => toggleSelect(p.id)}
                    onDelete={() => setDeleteTarget({ id: p.id, titulo: p.titulo })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Paginación ────────────────────────────────────────── */}
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
                <button key={pg} className={`ptbl-pgbtn${pg === page ? " act" : ""}`}
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