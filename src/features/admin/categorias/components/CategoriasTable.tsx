"use client";
// features/admin/categorias/components/CategoriasTable.tsx
// ─────────────────────────────────────────────────────────────
// Tabla de categorías del panel admin. Replica el patrón global de
// ProductosTable: selección, click en la fila, iconos de acción,
// edición masiva con borrador, búsqueda, orden, vistas y paginación.
// ─────────────────────────────────────────────────────────────
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAlert } from "@/shared/context/AlertContext";
import { resolveImageUrl } from "@/features/media/lib/resolveImageUrl";
import { Dropdown } from "@/shared/components/ui/Dropdown";
import { useBulkEdit } from "@/shared/components/ui/BulkEditContext";
import { slugify } from "@/features/admin/productos/components/producto-form-types";
import { ModalCategoria } from "./ModalCategoria";
import type { CategoriaRow } from "../types";

/* ── Constantes ─────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "nombre_asc",     label: "Nombre A–Z"   },
  { value: "nombre_desc",    label: "Nombre Z–A"   },
  { value: "productos_desc", label: "Productos ↓"  },
  { value: "productos_asc",  label: "Productos ↑"  },
  { value: "id_desc",        label: "Más reciente" },
  { value: "id_asc",         label: "Más antiguo"  },
];

const TIPO_TABS = [
  { value: "",          label: "Todas"           },
  { value: "principal", label: "Principales"     },
  { value: "sub",       label: "Subcategorías"   },
];

const LIMIT = 20;

/* ── Modal de confirmación de borrado ─────────────────────────── */
function DeleteModal({
  categoria,
  onConfirm,
  onCancel,
  loading,
}: {
  categoria: { id: number; nombre: string } | null;
  onConfirm: () => void;
  onCancel:  () => void;
  loading:   boolean;
}) {
  if (!categoria) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5"
        style={{ background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </div>
        </div>

        <div className="text-center flex flex-col gap-1.5">
          <p className="text-[15px] font-bold" style={{ color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-display, sans-serif)" }}>
            Eliminar categoría
          </p>
          <p className="text-[13px]" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)", lineHeight: 1.5 }}>
            ¿Estás seguro de que quieres eliminar{" "}
            <span className="font-semibold" style={{ color: "var(--color-cq-text, #0f172a)" }}>{categoria.nombre}</span>
            ? Esta acción no se puede deshacer.
          </p>
        </div>

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
  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={SORT_OPTIONS}
      width={176}
      icon={
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/>
        </svg>
      }
    />
  );
}

/* ── Miniatura de categoría ──────────────────────────────────── */
function CategoriaThumb({ c, size = 36 }: { c: CategoriaRow; size?: number }) {
  const src = c.imagen ? (resolveImageUrl(c.imagen, undefined) ?? c.imagen) : null;
  return (
    <div
      className="rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
      style={{ width: size, height: size, background: "var(--color-cq-surface-2, #f1f5f9)", border: "1px solid var(--color-cq-border, #e2e8f0)" }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={c.nombre} className="w-full h-full object-cover" />
      ) : (
        <svg width={size * 0.39} height={size * 0.39} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #cbd5e1)" }}>
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      )}
    </div>
  );
}

/* ── Vista cuadrícula — card de categoría ────────────────────── */
function CategoriaCard({
  c,
  selected,
  onToggle,
  onEdit,
  onDelete,
}: {
  c: CategoriaRow;
  selected: boolean;
  onToggle: () => void;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  const src = c.imagen ? (resolveImageUrl(c.imagen, undefined) ?? c.imagen) : null;
  return (
    <div
      className="group rounded-xl overflow-hidden flex flex-col transition-shadow"
      style={{
        border:     selected ? "1.5px solid var(--color-cq-accent, #2563eb)" : "1px solid var(--color-cq-border, #e2e8f0)",
        background: selected ? "var(--color-cq-accent-glow, rgba(37,99,235,0.03))" : "var(--color-cq-surface, #fff)",
        boxShadow:  "var(--shadow-card)",
        cursor:     "pointer",
      }}
      onClick={onEdit}
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden" style={{ background: "var(--color-cq-surface-2, #f1f5f9)" }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={c.nombre} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
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
          <Link href={`/categoria/${c.slug}`} target="_blank"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "var(--color-cq-surface-overlay, rgba(255,255,255,0.9))", backdropFilter: "blur(4px)", color: "var(--color-cq-muted, #64748b)" }}
            onClick={e => e.stopPropagation()}
            title="Ver en tienda"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </Link>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "var(--color-cq-surface-overlay, rgba(255,255,255,0.9))", backdropFilter: "blur(4px)", color: "#ef4444", border: "none", cursor: "pointer" }}
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
        <span
          className="text-[13px] font-semibold leading-snug line-clamp-2"
          style={{ color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-display, sans-serif)" }}
        >
          {c.nombre}
        </span>
        <div className="flex items-center justify-between mt-auto gap-2">
          <span className="text-[10px] truncate" style={{ color: "var(--color-cq-muted-2, #94a3b8)", fontFamily: "var(--font-mono, monospace)" }}>
            {c.parent_nombre ?? "Principal"}
          </span>
          <span className="text-[13px] font-bold tabular-nums shrink-0" style={{ color: "var(--color-cq-text, #0f172a)", fontFamily: "var(--font-display, sans-serif)" }}>
            {Number(c.total_productos).toLocaleString("es-MX")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Fila de la tabla ────────────────────────────────────────── */
function CategoriaTableRow({
  c,
  selected,
  onToggle,
  onEdit,
  onDelete,
  onDraft,
  editMode,
  categorias,
}: {
  c: CategoriaRow;
  selected: boolean;
  onToggle: () => void;
  onEdit:   () => void;
  onDelete: () => void;
  onDraft:  (id: number, patch: Record<string, string | number | null>) => void;
  editMode: boolean;
  categorias: CategoriaRow[];
}) {
  /* El padre remonta las filas (key = `${id}-${editEpoch}`) al cancelar la
     edición o al recargar datos, así que este estado local se reinicializa
     solo: no hace falta sincronizarlo con un efecto. */
  const [nombre,   setNombre]   = useState(c.nombre);
  const [slug,     setSlug]     = useState(c.slug);
  const [parentId, setParentId] = useState(c.parent_id);

  /* En modo edición masiva los cambios NO se envían al servidor: se acumulan
     en el borrador del padre y se confirman con el botón "Guardar". */

  const saveNombre = (value: string) => {
    if (!value.trim() || value === c.nombre) { setNombre(c.nombre); return; }
    onDraft(c.id, { nombre: value.trim() });
  };

  const saveSlug = (value: string) => {
    const next = slugify(value) || slugify(nombre);
    if (!next) { setSlug(c.slug); return; }
    setSlug(next);
    if (next === c.slug) return;
    onDraft(c.id, { slug: next });
  };

  const saveParent = (value: string) => {
    const pid = value ? Number(value) : null;
    setParentId(pid);
    onDraft(c.id, { parent_id: pid });
  };

  /* ── Vista de solo lectura (por defecto) ─────────────────────── */
  if (!editMode) {
    return (
      <tr
        className={`ctbl-row${selected ? " sel" : ""}`}
        style={{ cursor: "pointer" }}
        onClick={onEdit}
      >
        <td className="pl-5 pr-3 py-3.5" onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onToggle}
            className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600" />
        </td>

        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <CategoriaThumb c={c} />
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="ctbl-title-link" title="Editar categoría">{c.nombre}</span>
            </div>
          </div>
        </td>

        <td className="px-4 py-3.5">
          <span className="text-[12px]" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-mono, monospace)" }}>
            {c.slug}
          </span>
        </td>

        <td className="px-4 py-3.5">
          <span className="text-[12px]" style={{ color: c.parent_nombre ? "var(--color-cq-text, #0f172a)" : "var(--color-cq-muted-2, #94a3b8)", fontFamily: "var(--font-body, sans-serif)" }}>
            {c.parent_nombre ?? "—"}
          </span>
        </td>

        <td className="px-4 py-3.5">
          <span className="text-[12px] truncate block max-w-[280px]" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
            {c.descripcion || <span style={{ color: "var(--color-cq-muted-2)" }}>—</span>}
          </span>
        </td>

        <td className="px-4 py-3.5 text-right">
          <span className="text-[13px] font-bold tabular-nums"
            style={{ fontFamily: "var(--font-display, sans-serif)", color: Number(c.total_productos) === 0 ? "var(--color-cq-muted-2, #94a3b8)" : "var(--color-cq-text, #0f172a)" }}>
            {Number(c.total_productos).toLocaleString("es-MX")}
          </span>
        </td>

        <td className="px-4 py-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
          <div className="ctbl-act">
            <Link href={`/categoria/${c.slug}`} target="_blank" className="ctbl-btn" title="Ver en tienda">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </Link>
            <button onClick={onDelete} className="ctbl-btn del" title="Eliminar">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  /* ── Vista de edición masiva ──────────────────────────────────── */
  const opcionesPadre = categorias.filter(o => o.id !== c.id);

  return (
    <tr className="ctbl-row">
      <td className="pl-5 pr-3 py-3.5" />

      {/* Categoría — imagen + nombre editable */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <CategoriaThumb c={c} />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              onBlur={e => saveNombre(e.target.value)}
              className="ctbl-cell-input ctbl-cell-title"
            />
          </div>
        </div>
      </td>

      {/* Slug — editable */}
      <td className="px-4 py-3.5">
        <input
          value={slug}
          onChange={e => setSlug(e.target.value)}
          onBlur={e => saveSlug(e.target.value)}
          className="ctbl-cell-input"
          style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11.5 }}
        />
      </td>

      {/* Categoría padre — select editable */}
      <td className="px-4 py-3.5">
        <Dropdown
          value={parentId != null ? String(parentId) : ""}
          onChange={saveParent}
          align="left"
          width={190}
          placeholder="Sin categoría padre"
          options={[
            { value: "", label: "Sin categoría padre" },
            ...opcionesPadre.map(o => ({ value: String(o.id), label: o.nombre })),
          ]}
          triggerClassName="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
        />
      </td>

      {/* Descripción — editable */}
      <td className="px-4 py-3.5">
        <input
          defaultValue={c.descripcion ?? ""}
          onBlur={e => {
            const value = e.target.value.trim();
            if (value === (c.descripcion ?? "")) return;
            onDraft(c.id, { descripcion: value });
          }}
          placeholder="Sin descripción"
          className="ctbl-cell-input"
        />
      </td>

      {/* Productos — solo lectura */}
      <td className="px-4 py-3.5 text-right">
        <span className="text-[13px] font-bold tabular-nums"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-muted, #64748b)" }}>
          {Number(c.total_productos).toLocaleString("es-MX")}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3.5 pr-5 text-right">
        <div className="ctbl-act">
          <button onClick={onEdit} className="ctbl-btn" title="Editar completo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <Link href={`/categoria/${c.slug}`} target="_blank" className="ctbl-btn" title="Ver en tienda">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </Link>
          <button onClick={onDelete} className="ctbl-btn del" title="Eliminar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Componente principal ────────────────────────────────────── */
interface Props {
  initialCategorias: CategoriaRow[];
  initialTotal:      number;
}

export function CategoriasTable({ initialCategorias, initialTotal }: Props) {
  const router = useRouter();
  const alert  = useAlert();

  const [categorias, setCategorias] = useState<CategoriaRow[]>(initialCategorias);
  const [total,      setTotal]      = useState(initialTotal);
  const [q,          setQ]          = useState("");
  const [tipo,       setTipo]       = useState("");
  const [sort,       setSort]       = useState("nombre_asc");
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(Math.max(1, Math.ceil(initialTotal / LIMIT)));
  const [loading,    setLoading]    = useState(false);
  const [selected,   setSelected]   = useState<Set<number>>(new Set());
  const [view,       setView]       = useState<"list" | "grid">("list");
  const { editMode, setEditMode } = useBulkEdit();

  // Opciones de "categoría padre": lista completa, independiente del filtro/página.
  const [todas, setTodas] = useState<CategoriaRow[]>(initialCategorias);

  // Borrador de la edición masiva: { [categoriaId]: { campo: valor } }
  const [drafts,     setDrafts]     = useState<Record<number, Record<string, string | number | null>>>({});
  const [savingBulk, setSavingBulk] = useState(false);
  // Fuerza el remount de las filas al cancelar, para descartar el estado local de cada input
  const [editEpoch,  setEditEpoch]  = useState(0);

  const draftCount = Object.keys(drafts).length;

  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editando,  setEditando]  = useState<CategoriaRow | null>(null);

  // Modal eliminar
  const [deleteTarget,  setDeleteTarget]  = useState<{ id: number; nombre: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce búsqueda
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (p: { q?: string; tipo?: string; sort?: string; page?: number }) => {
    setLoading(true);
    const sp = new URLSearchParams({
      q:     p.q    ?? q,
      tipo:  p.tipo ?? tipo,
      sort:  p.sort ?? sort,
      page:  String(p.page ?? page),
      limit: String(LIMIT),
    });
    try {
      const res  = await fetch(`/api/admin/categorias?${sp}`);
      const json = await res.json();
      if (json.success) {
        setCategorias(json.data);
        setTotal(json.meta.total);
        setPages(json.meta.pages);
        // Remonta las filas para que sus inputs tomen los valores recién cargados
        setEditEpoch(n => n + 1);
      }
    } finally { setLoading(false); }
  }, [q, tipo, sort, page]);

  /** Lista completa para el selector de categoría padre. */
  const fetchTodas = useCallback(async () => {
    const res  = await fetch("/api/admin/categorias?limit=100&sort=nombre_asc");
    const json = await res.json();
    if (json.success) setTodas(json.data);
  }, []);

  // La página sólo entrega la primera tanda: completa las opciones de padre.
  useEffect(() => {
    if (initialTotal > initialCategorias.length) void fetchTodas();
  }, [initialTotal, initialCategorias.length, fetchTodas]);

  const toggleSelect = (id: number) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () =>
    setSelected(prev => prev.size === categorias.length ? new Set() : new Set(categorias.map(c => c.id)));

  /** Actualiza una categoría en la lista local sin refetch. */
  const patchLocal = (id: number, patch: Partial<CategoriaRow>) =>
    setCategorias(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));

  const enterEditMode = () => {
    setDrafts({});
    setSelected(new Set());
    setEditMode(true);
  };

  /** Registra un cambio en el borrador (no toca el servidor). */
  const addDraft = (id: number, patch: Record<string, string | number | null>) =>
    setDrafts(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const cancelEdit = () => {
    setDrafts({});
    setEditEpoch(n => n + 1);
    setEditMode(false);
  };

  const saveEdit = async () => {
    const entries = Object.entries(drafts);
    if (entries.length === 0) { setEditMode(false); return; }

    setSavingBulk(true);
    try {
      const results = await Promise.all(entries.map(async ([id, body]) => {
        const res  = await fetch(`/api/admin/categorias/${id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({ success: false }));
        return { id: Number(id), body, ok: Boolean(json?.success), error: json?.error as string | undefined };
      }));

      // Refleja en la lista local lo que sí se guardó
      results.filter(r => r.ok).forEach(r => {
        const patch: Partial<CategoriaRow> = { ...r.body } as Partial<CategoriaRow>;
        if ("parent_id" in r.body) {
          const pid = r.body.parent_id as number | null;
          patch.parent_nombre = todas.find(o => o.id === pid)?.nombre ?? null;
        }
        patchLocal(r.id, patch);
      });

      const failed = results.filter(r => !r.ok);
      if (failed.length) {
        alert.error(failed[0].error ?? `${failed.length} categoría${failed.length !== 1 ? "s" : ""} no se pudieron guardar.`);
      } else {
        alert.success(`${results.length} categoría${results.length !== 1 ? "s" : ""} actualizada${results.length !== 1 ? "s" : ""} correctamente`);
      }

      setDrafts({});
      setEditEpoch(n => n + 1);
      setEditMode(false);
      void fetchTodas();
      router.refresh();
    } finally { setSavingBulk(false); }
  };

  /* ── Cambio masivo de categoría padre ─────────────────────── */
  const [bulkParent,        setBulkParent]        = useState("");
  const [bulkParentLoading, setBulkParentLoading] = useState(false);

  const applyBulkParent = async () => {
    if (!bulkParent || selected.size === 0) return;
    setBulkParentLoading(true);
    try {
      const ids   = Array.from(selected);
      const pid   = bulkParent === "__none__" ? null : Number(bulkParent);
      const results = await Promise.all(ids.map(async id => {
        const res  = await fetch(`/api/admin/categorias/${id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ parent_id: pid }),
        });
        const json = await res.json().catch(() => ({ success: false }));
        return { id, ok: Boolean(json?.success), error: json?.error as string | undefined };
      }));

      results.filter(r => r.ok).forEach(r =>
        patchLocal(r.id, { parent_id: pid, parent_nombre: todas.find(o => o.id === pid)?.nombre ?? null })
      );

      const failed = results.filter(r => !r.ok);
      if (failed.length) alert.error(failed[0].error ?? "Algunas categorías no se pudieron actualizar.");
      else alert.success("Categoría padre actualizada");

      setBulkParent("");
      setSelected(new Set());
      void fetchTodas();
      router.refresh();
    } finally { setBulkParentLoading(false); }
  };

  /* ── Eliminación masiva ───────────────────────────────────── */
  const [bulkDeleteOpen,    setBulkDeleteOpen]    = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const applyBulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkDeleteLoading(true);
    try {
      const ids = Array.from(selected);
      const results = await Promise.all(ids.map(async id => {
        const res  = await fetch(`/api/admin/categorias/${id}`, { method: "DELETE" });
        const json = await res.json().catch(() => ({ success: false }));
        return { id, ok: Boolean(json?.success), error: json?.error as string | undefined };
      }));

      const failed = results.filter(r => !r.ok);
      if (failed.length) alert.error(failed[0].error ?? "Algunas categorías no se pudieron eliminar.");
      else alert.success(`${results.length} categoría${results.length !== 1 ? "s" : ""} eliminada${results.length !== 1 ? "s" : ""}`);

      setSelected(new Set());
      setBulkDeleteOpen(false);
      void fetchData({});
      void fetchTodas();
      router.refresh();
    } finally { setBulkDeleteLoading(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`/api/admin/categorias/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({ success: false }));
      if (!json.success) {
        alert.error(json.error ?? "Error al eliminar la categoría");
        return;
      }
      alert.success("Categoría eliminada correctamente");
      setDeleteTarget(null);
      void fetchData({});
      void fetchTodas();
      router.refresh();
    } catch {
      alert.error("Error de conexión");
    } finally { setDeleteLoading(false); }
  };

  /* ── Crear / editar con el modal ──────────────────────────── */
  const abrirCrear  = () => { setEditando(null); setModalOpen(true); };
  const abrirEditar = (c: CategoriaRow) => { setEditando(c); setModalOpen(true); };

  const handleSaved = (categoria: CategoriaRow) => {
    setCategorias(prev =>
      prev.some(c => c.id === categoria.id)
        ? prev.map(c => (c.id === categoria.id ? { ...c, ...categoria } : c))
        : prev
    );
    void fetchData({});
    void fetchTodas();
    router.refresh();
  };

  const handleSearchChange = (value: string) => {
    setQ(value);
    setPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { void fetchData({ q: value, page: 1 }); }, 350);
  };

  const handleTipo = (value: string) => {
    setTipo(value);
    setPage(1);
    void fetchData({ tipo: value, page: 1 });
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
    void fetchData({ sort: value, page: 1 });
  };

  return (
    <>
      <style>{`
        .ctbl-row { border-bottom: 1px solid var(--color-cq-border, #e2e8f0); transition: background .1s; }
        .ctbl-row:hover { background: var(--color-cq-surface-2, #f8fafc); }
        .ctbl-row.sel { background: var(--color-cq-accent-glow, rgba(37,99,235,0.05)); }
        .ctbl-act { display:flex; align-items:center; justify-content:flex-end; gap:4px; opacity:1; }
        .ctbl-btn {
          width:28px; height:28px; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          color: var(--color-cq-muted, #64748b);
          background: transparent; border: none; cursor: pointer;
          transition: color .15s, background .15s;
        }
        .ctbl-btn:hover { color: var(--color-cq-text, #0f172a); background: var(--color-cq-surface-2, #f1f5f9); }
        .ctbl-btn.del:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
        .ctbl-input {
          width: 100%; padding: 8px 12px 8px 32px;
          background: var(--color-cq-surface-2, #f1f5f9);
          border: 1px solid var(--color-cq-border, #e2e8f0);
          border-radius: 8px; outline: none;
          font-size: 13px; color: var(--color-cq-text, #0f172a);
          font-family: var(--font-body, sans-serif);
          transition: border-color .15s, box-shadow .15s;
        }
        .ctbl-input:focus {
          border-color: var(--color-cq-accent, #2563eb);
          box-shadow: 0 0 0 3px var(--color-cq-accent-glow, rgba(37,99,235,0.12));
          background: var(--color-cq-surface, #fff);
        }
        .ctbl-pgbtn {
          width:30px; height:30px; border-radius:7px; border:1px solid var(--color-cq-border, #e2e8f0);
          display:flex; align-items:center; justify-content:center;
          font-size:12px; cursor:pointer; transition:all .15s;
          font-family: var(--font-mono, monospace);
          color: var(--color-cq-muted, #64748b);
          background: var(--color-cq-surface, #fff);
        }
        .ctbl-pgbtn:hover:not(:disabled) { border-color:var(--color-cq-accent,#2563eb); color:var(--color-cq-accent,#2563eb); }
        .ctbl-pgbtn.act { background:var(--color-cq-accent,#2563eb); color:#fff; border-color:var(--color-cq-accent,#2563eb); }
        .ctbl-pgbtn:disabled { opacity:.35; cursor:not-allowed; }
        .ctbl-title-link {
          font-size:13px; font-weight:600; line-height:1.35;
          color: var(--color-cq-text, #0f172a);
          font-family: var(--font-display, sans-serif);
          text-decoration: none; cursor: pointer;
          transition: color .15s;
        }
        .ctbl-title-link:hover { color: var(--color-cq-accent, #2563eb); text-decoration: underline; }
        .ctbl-view-btn {
          width:32px; height:32px; border-radius:8px; border:1px solid var(--color-cq-border,#e2e8f0);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .15s;
          color: var(--color-cq-muted,#64748b);
          background: var(--color-cq-surface,#fff);
        }
        .ctbl-view-btn.act { background:var(--color-cq-accent,#2563eb); color:#fff; border-color:var(--color-cq-accent,#2563eb); }
        .ctbl-view-btn:hover:not(.act) { background:var(--color-cq-surface-2,#f1f5f9); }
        .ctbl-cell-input {
          width: 100%; padding: 5px 7px; border-radius: 6px; outline: none;
          border: 1px solid var(--color-cq-border, #e2e8f0); background: transparent;
          font-size: 12.5px; color: var(--color-cq-text, #0f172a);
          font-family: var(--font-body, sans-serif);
          transition: border-color .15s, background .15s;
        }
        .ctbl-cell-input:hover:not(:disabled) {
          background: var(--color-cq-surface-2, #f1f5f9);
          border-color: var(--color-cq-muted-2, #94a3b8);
        }
        .ctbl-cell-input:focus {
          border-color: var(--color-cq-accent, #2563eb);
          background: var(--color-cq-surface, #fff);
          box-shadow: 0 0 0 3px var(--color-cq-accent-glow, rgba(37,99,235,0.12));
        }
        .ctbl-cell-input:disabled { opacity: .5; }
        .ctbl-cell-title { font-size: 13px; font-weight: 600; font-family: var(--font-display, sans-serif); }
      `}</style>

      <DeleteModal
        categoria={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <DeleteModal
        categoria={bulkDeleteOpen ? { id: -1, nombre: `${selected.size} categoría${selected.size !== 1 ? "s" : ""}` } : null}
        onConfirm={applyBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        loading={bulkDeleteLoading}
      />

      {/* ── Barra de edición masiva (reemplaza toda la barra de herramientas) ── */}
      {editMode && (
        <div
          className="flex items-center gap-3 flex-wrap px-5 py-3.5"
          style={{ background: "var(--color-cq-accent-glow, rgba(37,99,235,0.06))", borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}
        >
          <span
            className="text-[12px] font-semibold shrink-0"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-accent, #2563eb)" }}
          >
            Edición masiva
            {draftCount > 0 && ` — ${draftCount} categoría${draftCount !== 1 ? "s" : ""} con cambios`}
          </span>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              onClick={cancelEdit}
              disabled={savingBulk}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors"
              style={{
                border:     "1px solid var(--color-cq-border, #e2e8f0)",
                background: "var(--color-cq-surface, #fff)",
                color:      "var(--color-cq-muted, #64748b)",
                fontFamily: "var(--font-mono, monospace)",
                cursor:     savingBulk ? "not-allowed" : "pointer",
                opacity:    savingBulk ? 0.5 : 1,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={saveEdit}
              disabled={savingBulk}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors"
              style={{
                border:     "1px solid var(--color-cq-accent, #2563eb)",
                background: "var(--color-cq-accent, #2563eb)",
                color:      "#fff",
                fontFamily: "var(--font-mono, monospace)",
                cursor:     savingBulk ? "not-allowed" : "pointer",
                opacity:    savingBulk ? 0.6 : 1,
              }}
            >
              {savingBulk ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* ── Barra de herramientas ─────────────────────────────── */}
      {!editMode && (
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
              placeholder="Buscar por nombre, slug, categoría padre…"
              value={q}
              className="ctbl-input"
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

          {/* Editar masivamente */}
          {view === "list" && (
            <button
              onClick={enterEditMode}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors shrink-0"
              style={{
                border:     "1px solid var(--color-cq-border, #e2e8f0)",
                background: "var(--color-cq-surface, #fff)",
                color:      "var(--color-cq-muted, #64748b)",
                fontFamily: "var(--font-mono, monospace)",
                cursor:     "pointer",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar masivamente
            </button>
          )}

          {/* Toggle vista */}
          <div className="flex items-center gap-1">
            <button
              title="Vista lista"
              className={`ctbl-view-btn${view === "list" ? " act" : ""}`}
              onClick={() => setView("list")}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
            <button
              title="Vista cuadrícula"
              className={`ctbl-view-btn${view === "grid" ? " act" : ""}`}
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

        {/* Fila 2: filtros de tipo */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TIPO_TABS.map(tab => {
            const active = tipo === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => handleTipo(tab.value)}
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
      )}

      {/* ── Barra de acciones sobre la selección ────────────────── */}
      {!editMode && selected.size > 0 && (
        <div
          className="flex items-center gap-3 flex-wrap px-5 py-3"
          style={{ background: "var(--color-cq-accent-glow, rgba(37,99,235,0.06))", borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}
        >
          <span
            className="text-[12px] font-semibold shrink-0"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-accent, #2563eb)" }}
          >
            {selected.size} seleccionada{selected.size !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-1.5">
            <Dropdown
              value={bulkParent}
              onChange={setBulkParent}
              placeholder="Categoría padre"
              align="left"
              width={200}
              disabled={bulkParentLoading}
              options={[
                { value: "__none__", label: "Sin categoría padre" },
                ...todas.filter(o => !selected.has(o.id)).map(o => ({ value: String(o.id), label: o.nombre })),
              ]}
            />
            <button
              onClick={applyBulkParent}
              disabled={bulkParentLoading || !bulkParent}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
              style={{ background: "var(--color-cq-accent, #2563eb)", color: "#fff", border: "none", cursor: bulkParentLoading || !bulkParent ? "not-allowed" : "pointer", opacity: bulkParentLoading || !bulkParent ? 0.5 : 1 }}
            >
              {bulkParentLoading ? "Aplicando…" : "Aplicar"}
            </button>
          </div>

          <button
            onClick={() => setBulkDeleteOpen(true)}
            disabled={bulkParentLoading || bulkDeleteLoading}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", cursor: bulkParentLoading || bulkDeleteLoading ? "not-allowed" : "pointer", opacity: bulkParentLoading || bulkDeleteLoading ? 0.5 : 1 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {bulkDeleteLoading ? "Eliminando…" : "Eliminar"}
          </button>

          <button
            onClick={() => setSelected(new Set())}
            disabled={bulkParentLoading || bulkDeleteLoading}
            className="ml-auto text-[12px] font-semibold"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-cq-muted, #64748b)" }}
          >
            Limpiar selección
          </button>
        </div>
      )}

      {/* ── Contenido ─────────────────────────────────────────── */}
      <div className={`transition-opacity duration-150 ${loading ? "opacity-40 pointer-events-none" : ""}`}>

        {/* Vista lista */}
        {view === "list" && (
          <div className={editMode ? "overflow-visible" : "overflow-x-auto"}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)", background: "var(--color-cq-surface-2, #fafafa)" }}>
                  <th className="pl-5 pr-3 py-3 w-10">
                    {!editMode && (
                      <input type="checkbox" className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600"
                        checked={selected.size === categorias.length && categorias.length > 0}
                        onChange={toggleAll} />
                    )}
                  </th>
                  {["Categoría","Slug","Categoría padre","Descripción","Productos","Acciones"].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-[10px] font-bold tracking-widest uppercase ${i >= 4 ? "text-right" : "text-left"} ${i === 5 ? "pr-5" : ""}`}
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categorias.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: "var(--color-cq-surface-2, #f1f5f9)" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                      <p className="text-[13px] font-medium" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
                        No se encontraron categorías
                      </p>
                      <button onClick={abrirCrear} className="text-[12px] font-semibold"
                        style={{ color: "var(--color-cq-accent, #2563eb)", fontFamily: "var(--font-mono, monospace)", background: "none", border: "none", cursor: "pointer" }}>
                        + Crear la primera
                      </button>
                    </div>
                  </td></tr>
                ) : categorias.map(c => (
                  <CategoriaTableRow
                    key={`${c.id}-${editEpoch}`}
                    c={c}
                    selected={selected.has(c.id)}
                    onToggle={() => toggleSelect(c.id)}
                    onEdit={() => abrirEditar(c)}
                    onDelete={() => setDeleteTarget({ id: c.id, nombre: c.nombre })}
                    onDraft={addDraft}
                    editMode={editMode}
                    categorias={todas}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vista cuadrícula */}
        {view === "grid" && (
          <div className="p-5">
            {categorias.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--color-cq-surface-2, #f1f5f9)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="text-[13px] font-medium" style={{ color: "var(--color-cq-muted, #64748b)" }}>No se encontraron categorías</p>
                <button onClick={abrirCrear} className="text-[12px] font-semibold"
                  style={{ color: "var(--color-cq-accent, #2563eb)", background: "none", border: "none", cursor: "pointer" }}>
                  + Crear la primera
                </button>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                {categorias.map(c => (
                  <CategoriaCard
                    key={c.id}
                    c={c}
                    selected={selected.has(c.id)}
                    onToggle={() => toggleSelect(c.id)}
                    onEdit={() => abrirEditar(c)}
                    onDelete={() => setDeleteTarget({ id: c.id, nombre: c.nombre })}
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
            <button className="ctbl-pgbtn" disabled={page === 1 || loading}
              onClick={() => { const p = page - 1; setPage(p); void fetchData({ page: p }); }}>←</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, pages - 4));
              const pg = start + i;
              return (
                <button key={pg} className={`ctbl-pgbtn${pg === page ? " act" : ""}`}
                  disabled={loading}
                  onClick={() => { setPage(pg); void fetchData({ page: pg }); }}>
                  {pg}
                </button>
              );
            })}
            <button className="ctbl-pgbtn" disabled={page === pages || loading}
              onClick={() => { const p = page + 1; setPage(p); void fetchData({ page: p }); }}>→</button>
          </div>
        </div>
      )}

      <ModalCategoria
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        categoria={editando}
        categorias={todas}
      />
    </>
  );
}
