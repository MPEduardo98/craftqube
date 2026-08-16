"use client";
// app/admin/productos/components/ProductosTable.tsx
import { useState, useCallback, useRef, useEffect } from "react";
import Link        from "next/link";
import { useRouter } from "next/navigation";
import type { ProductoRow } from "../types";
import { resolveImageUrl } from "@/features/media/lib/resolveImageUrl";
import { useBulkEdit } from "./BulkEditContext";

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

const BULK_ESTADO_OPTIONS = [
  { value: "activo",   label: "Activo"    },
  { value: "inactivo", label: "Inactivo"  },
  { value: "borrador", label: "Borrador"  },
];

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

/* ── Dropdown genérico (componente global de select del panel) ─── */
interface DropdownOption { value: string; label: string; }

function Dropdown({
  value, onChange, options, icon, placeholder, align = "right", width = 176, disabled = false,
  triggerStyle, triggerClassName,
}: {
  value:       string;
  onChange:    (v: string) => void;
  options:     DropdownOption[];
  icon?:       React.ReactNode;
  placeholder?: string;
  align?:      "left" | "right";
  width?:      number;
  disabled?:   boolean;
  triggerStyle?:     React.CSSProperties;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <style>{`
        .cq-dd-option:hover {
          background: var(--color-cq-surface-2, #f1f5f9) !important;
        }
        .cq-dd-option.is-selected:hover {
          background: var(--color-cq-accent-glow-2, rgba(37,99,235,0.12)) !important;
        }
        .cq-dd-trigger:not(:disabled):hover {
          filter: brightness(0.96);
        }
      `}</style>
      <button
        onClick={() => !disabled && setOpen(v => !v)}
        disabled={disabled}
        className={`cq-dd-trigger ${triggerClassName ?? "flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors"}`}
        style={{
          border:     "1px solid var(--color-cq-border, #e2e8f0)",
          background: open ? "var(--color-cq-surface-2, #f1f5f9)" : "var(--color-cq-surface, #fff)",
          color:      "var(--color-cq-muted, #64748b)",
          fontFamily: "var(--font-mono, monospace)",
          cursor:     disabled ? "not-allowed" : "pointer",
          opacity:    disabled ? 0.6 : 1,
          ...triggerStyle,
        }}
      >
        {icon}
        {current?.label ?? placeholder ?? "Seleccionar"}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-1.5 rounded-xl overflow-hidden z-30 py-1`}
          style={{ width, background: "var(--color-cq-surface, #fff)", border: "1px solid var(--color-cq-border, #e2e8f0)", boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
        >
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`cq-dd-option${o.value === value ? " is-selected" : ""} w-full text-left px-4 py-2 text-[12px] transition-colors flex items-center gap-2`}
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
  const imgSrc = resolveImageUrl(p.imagen_url, p.id);
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

/* ── Fila editable (vista lista) ─────────────────────────────── */
interface VarianteRow {
  id:           number;
  nombre:       string;
  sku:          string;
  precio_final: string | number;
  stock:        number | string;
  es_default:   number | boolean;
}

function VarianteEditRow({ v, onSaved }: { v: VarianteRow; onSaved: (v: VarianteRow) => void }) {
  const [nombre, setNombre] = useState(v.nombre);
  const [precio, setPrecio] = useState(String(v.precio_final ?? ""));
  const [stock,  setStock]  = useState(String(v.stock ?? ""));
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setNombre(v.nombre);
    setPrecio(String(v.precio_final ?? ""));
    setStock(String(v.stock ?? ""));
  }, [v]);

  const save = async (field: "nombre" | "precio_final" | "stock", value: string) => {
    const original = field === "nombre" ? v.nombre : field === "precio_final" ? String(v.precio_final ?? "") : String(v.stock ?? "");
    if (value === original) return;
    if (field === "nombre" && !value.trim()) { setNombre(v.nombre); return; }

    setSaving(field);
    try {
      const body: Record<string, string | number> =
        field === "nombre"       ? { nombre: value } :
        field === "precio_final" ? { precio_final: parseFloat(value) || 0 } :
        { stock: parseInt(value, 10) || 0 };

      const res  = await fetch(`/api/admin/productos/variantes/${v.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        onSaved({
          ...v,
          nombre:       field === "nombre" ? value : v.nombre,
          precio_final: field === "precio_final" ? (body.precio_final as number) : v.precio_final,
          stock:        field === "stock" ? (body.stock as number) : v.stock,
        });
      } else {
        alert("Error al guardar la variante.");
      }
    } finally { setSaving(null); }
  };

  return (
    <tr className="ptbl-subrow">
      <td className="pl-5 pr-3 py-2" />
      <td className="px-4 py-2">
        <div className="flex items-center gap-2 pl-8">
          <span style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>↳</span>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onBlur={e => save("nombre", e.target.value)}
            disabled={saving === "nombre"}
            className="ptbl-cell-input"
            placeholder="Nombre de variante"
          />
          {v.sku && (
            <span className="text-[10px] shrink-0" style={{ color: "var(--color-cq-muted-2, #94a3b8)", fontFamily: "var(--font-mono, monospace)" }}>
              {v.sku}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-2" />
      <td className="px-4 py-2" />
      <td className="px-4 py-2" />
      <td className="px-4 py-2 text-right">
        <div className="relative inline-block">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>$</span>
          <input
            type="number" min="0" step="0.01"
            value={precio}
            onChange={e => setPrecio(e.target.value)}
            onBlur={e => save("precio_final", e.target.value)}
            disabled={saving === "precio_final"}
            className="ptbl-cell-input text-right"
            style={{ width: 90, paddingLeft: 14 }}
          />
        </div>
      </td>
      <td className="px-4 py-2 text-right">
        <input
          type="number" min="0" step="1"
          value={stock}
          onChange={e => setStock(e.target.value)}
          onBlur={e => save("stock", e.target.value)}
          disabled={saving === "stock"}
          className="ptbl-cell-input text-right"
          style={{ width: 70 }}
        />
      </td>
      <td className="px-4 py-2 pr-5" />
    </tr>
  );
}

function ProductoTableRow({
  p,
  selected,
  onToggle,
  onDelete,
  onPatched,
  onDraft,
  editMode,
  categorias,
  marcas,
}: {
  p: ProductoRow;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onPatched: (id: number, patch: Partial<ProductoRow>) => void;
  onDraft: (id: number, patch: Record<string, string | number | null>) => void;
  editMode: boolean;
  categorias: { id: number; nombre: string }[];
  marcas: { id: number; nombre: string }[];
}) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(p.titulo);
  const [estado, setEstado] = useState(p.estado);
  const [categoriaId, setCategoriaId] = useState(p.categoria_id);
  const [marcaId, setMarcaId] = useState(p.marca_id);
  const [precio, setPrecio] = useState(p.precio != null ? String(p.precio) : "");
  const [stock,  setStock]  = useState(String(p.stock));
  const [saving] = useState<string | null>(null);

  const [expanded,         setExpanded]         = useState(false);
  const [variantes,        setVariantes]        = useState<VarianteRow[] | null>(null);
  const [loadingVariantes, setLoadingVariantes]  = useState(false);

  useEffect(() => {
    setTitulo(p.titulo);
    setEstado(p.estado);
    setCategoriaId(p.categoria_id);
    setPrecio(p.precio != null ? String(p.precio) : "");
    setStock(String(p.stock));
  }, [p.titulo, p.estado, p.categoria_id, p.precio, p.stock]);

  const imgSrc = resolveImageUrl(p.imagen_url, p.id);
  const badge  = BADGES[estado as keyof typeof BADGES] ?? BADGES.borrador;

  const loadVariantes = async () => {
    setLoadingVariantes(true);
    try {
      const res  = await fetch(`/api/admin/productos/${p.id}`);
      const json = await res.json();
      if (json.success) setVariantes(json.data.variantes);
    } finally { setLoadingVariantes(false); }
  };

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next && variantes === null) void loadVariantes();
  };

  /* En modo edición masiva los cambios NO se envían al servidor: se acumulan
     en el borrador del padre y se confirman con el botón "Guardar". */

  const saveTitulo = (value: string) => {
    if (!value.trim() || value === p.titulo) { setTitulo(p.titulo); return; }
    onDraft(p.id, { titulo: value });
  };

  const saveEstado = (value: string) => {
    setEstado(value);
    onDraft(p.id, { estado: value });
  };

  const saveCategoria = (value: string) => {
    const catId = value ? Number(value) : null;
    setCategoriaId(catId);
    onDraft(p.id, { categoria_id: catId });
  };

  const saveMarca = (value: string) => {
    const mId = value ? Number(value) : null;
    setMarcaId(mId);
    onDraft(p.id, { marca_id: mId });
  };

  const savePrecio = (value: string) => {
    const original = p.precio != null ? String(p.precio) : "";
    if (value === original) return;
    onDraft(p.id, { precio: value === "" ? 0 : parseFloat(value) });
  };

  const saveStock = (value: string) => {
    const original = String(p.stock);
    if (value === original) return;
    onDraft(p.id, { stock: value === "" ? 0 : parseInt(value, 10) });
  };

  const onVarianteSaved = (updated: VarianteRow) => {
    const next = (variantes ?? []).map(v => (v.id === updated.id ? updated : v));
    setVariantes(next);
    const precios = next.map(v => parseFloat(String(v.precio_final))).filter(n => Number.isFinite(n) && n > 0);
    const nuevoPrecio = precios.length ? Math.min(...precios) : null;
    const nuevoStock  = next.reduce((s, v) => s + (parseInt(String(v.stock), 10) || 0), 0);
    onPatched(p.id, { precio: nuevoPrecio, stock: nuevoStock });
  };

  /* ── Vista de solo lectura (por defecto) ─────────────────────── */
  if (!editMode) {
    const staticBadge = BADGES[p.estado as keyof typeof BADGES] ?? BADGES.borrador;
    return (
      <tr
        className={`ptbl-row${selected ? " sel" : ""}`}
        style={{ cursor: "pointer" }}
        onClick={() => router.push(`/admin/productos/${p.id}/editar`)}
      >
        <td className="pl-5 pr-3 py-3.5" onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onToggle}
            className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600" />
        </td>

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
              <span className="ptbl-title-link" title="Editar producto">
                {p.titulo}
              </span>
            </div>
          </div>
        </td>

        <td className="px-4 py-3.5">
          <span className="text-[12px] truncate" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
            {p.marca || <span style={{ color: "var(--color-cq-muted-2)" }}>—</span>}
          </span>
        </td>

        <td className="px-4 py-3.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ background: staticBadge.bg, color: staticBadge.color, border: `1px solid ${staticBadge.border}`, fontFamily: "var(--font-mono, monospace)" }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: staticBadge.dot }} />
            {staticBadge.label}
          </span>
        </td>

        <td className="px-4 py-3.5">
          <span className="text-[12px]" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
            {p.categorias ?? <span style={{ color: "var(--color-cq-muted-2)" }}>—</span>}
          </span>
        </td>

        <td className="px-4 py-3.5 text-right">
          <span className="text-[13px] font-bold tabular-nums"
            style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
            {p.precio != null
              ? `$${Number(p.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
              : <span style={{ color: "var(--color-cq-muted-2)", fontWeight: 400 }}>—</span>}
          </span>
        </td>

        <td className="px-4 py-3.5 text-right">
          <span className="text-[13px] font-bold tabular-nums"
            style={{ fontFamily: "var(--font-display, sans-serif)", color: p.stock === 0 ? "#ef4444" : "var(--color-cq-text, #0f172a)" }}>
            {p.stock.toLocaleString("es-MX")}
          </span>
        </td>

        <td className="px-4 py-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
          <div className="ptbl-act">
            <Link href={`/producto/${p.slug}`} target="_blank" className="ptbl-btn" title="Ver en tienda">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </Link>
            <button
              onClick={onDelete}
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
  }

  /* ── Vista de edición masiva ──────────────────────────────────── */
  return (
    <>
      <tr className="ptbl-row">
        <td className="pl-5 pr-3 py-3.5" />

        {/* Producto — expandir + imagen + título editable */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleExpand}
              className="ptbl-expand-btn"
              title={expanded ? "Ocultar variantes" : "Ver variantes"}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform .15s" }}>
                <polyline points="9 6 15 12 9 18"/>
              </svg>
            </button>
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
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                onBlur={e => saveTitulo(e.target.value)}
                disabled={saving === "titulo"}
                className="ptbl-cell-input ptbl-cell-title"
              />
            </div>
          </div>
        </td>

        {/* Marca — select editable */}
        <td className="px-4 py-3.5">
          <Dropdown
            value={marcaId != null ? String(marcaId) : ""}
            onChange={v => saveMarca(v)}
            disabled={saving === "marca"}
            align="left"
            width={176}
            placeholder="Sin marca"
            options={[
              { value: "", label: "Sin marca" },
              ...marcas.map(m => ({ value: String(m.id), label: m.nombre })),
            ]}
            triggerClassName="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
          />
        </td>

        {/* Estado — select editable */}
        <td className="px-4 py-3.5">
          <Dropdown
            value={estado}
            onChange={v => saveEstado(v)}
            disabled={saving === "estado"}
            align="left"
            width={150}
            options={[
              { value: "activo",   label: "Activo"   },
              { value: "inactivo", label: "Inactivo" },
              { value: "borrador", label: "Borrador" },
            ]}
            triggerClassName="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
            triggerStyle={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
          />
        </td>

        {/* Categoría — select editable */}
        <td className="px-4 py-3.5">
          <Dropdown
            value={categoriaId != null ? String(categoriaId) : ""}
            onChange={v => saveCategoria(v)}
            disabled={saving === "categoria"}
            align="left"
            width={190}
            placeholder="Sin categoría"
            options={[
              { value: "", label: "Sin categoría" },
              ...categorias.map(c => ({ value: String(c.id), label: c.nombre })),
            ]}
            triggerClassName="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
          />
        </td>

        {/* Precio — editable (solo si el producto tiene una única variante) */}
        <td className="px-4 py-3.5 text-right">
          <div className="relative inline-block">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>$</span>
            <input
              type="number" min="0" step="0.01"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              onBlur={e => savePrecio(e.target.value)}
              disabled={saving === "precio"}
              className="ptbl-cell-input text-right"
              style={{ width: 100, paddingLeft: 14, fontWeight: 700 }}
            />
          </div>
        </td>

        {/* Stock — editable (solo si el producto tiene una única variante) */}
        <td className="px-4 py-3.5 text-right">
          <input
            type="number" min="0" step="1"
            value={stock}
            onChange={e => setStock(e.target.value)}
            onBlur={e => saveStock(e.target.value)}
            disabled={saving === "stock"}
            className="ptbl-cell-input text-right"
            style={{ width: 70, fontWeight: 700, color: p.stock === 0 ? "#ef4444" : undefined }}
          />
        </td>

        {/* Acciones */}
        <td className="px-4 py-3.5 pr-5 text-right">
          <div className="ptbl-act">
            <Link href={`/admin/productos/${p.id}/editar`} className="ptbl-btn" title="Editar completo">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </Link>
            <Link href={`/producto/${p.slug}`} target="_blank" className="ptbl-btn" title="Ver en tienda">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </Link>
            <button
              onClick={onDelete}
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

      {expanded && (
        loadingVariantes ? (
          <tr className="ptbl-subrow"><td colSpan={8} className="px-5 py-3 text-center">
            <span className="text-[11px]" style={{ color: "var(--color-cq-muted-2, #94a3b8)", fontFamily: "var(--font-mono, monospace)" }}>Cargando variantes…</span>
          </td></tr>
        ) : variantes && variantes.length > 0 ? (
          variantes.map(v => <VarianteEditRow key={v.id} v={v} onSaved={onVarianteSaved} />)
        ) : (
          <tr className="ptbl-subrow"><td colSpan={8} className="px-5 py-3 text-center">
            <span className="text-[11px]" style={{ color: "var(--color-cq-muted-2, #94a3b8)", fontFamily: "var(--font-mono, monospace)" }}>Sin variantes</span>
          </td></tr>
        )
      )}
    </>
  );
}

/* ── Componente principal ────────────────────────────────────── */
interface Props {
  initialProductos: ProductoRow[];
  initialTotal:     number;
  categorias:       { id: number; nombre: string }[];
  marcas:           { id: number; nombre: string }[];
}

export function ProductosTable({ initialProductos, initialTotal, categorias, marcas }: Props) {
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
  const { editMode, setEditMode } = useBulkEdit();

  // Borrador de la edición masiva: { [productoId]: { campo: valor } }
  const [drafts,      setDrafts]      = useState<Record<number, Record<string, string | number | null>>>({});
  const [savingBulk,  setSavingBulk]  = useState(false);
  // Fuerza el remount de las filas al cancelar, para descartar el estado local de cada input
  const [editEpoch,   setEditEpoch]   = useState(0);

  const draftCount = Object.keys(drafts).length;

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

  /** Actualiza un producto en la lista local sin refetch (edición en línea). */
  const patchLocal = (id: number, patch: Partial<ProductoRow>) =>
    setProductos(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));

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
        const res  = await fetch(`/api/admin/productos/${id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({ success: false }));
        return { id: Number(id), body, ok: Boolean(json?.success), error: json?.error as string | undefined };
      }));

      // Refleja en la lista local lo que sí se guardó
      results.filter(r => r.ok).forEach(r => {
        const patch: Partial<ProductoRow> = { ...r.body } as Partial<ProductoRow>;
        if ("categoria_id" in r.body) {
          const catId = r.body.categoria_id as number | null;
          patch.categorias = categorias.find(c => c.id === catId)?.nombre ?? null;
        }
        if ("marca_id" in r.body) {
          const mId = r.body.marca_id as number | null;
          patch.marca = marcas.find(m => m.id === mId)?.nombre ?? null;
        }
        patchLocal(r.id, patch);
      });

      const failed = results.filter(r => !r.ok);
      if (failed.length) {
        const conVariantes = failed.some(r => r.error === "MULTIPLE_VARIANTES");
        alert(
          conVariantes
            ? "Algunos productos tienen varias variantes: su precio y stock deben editarse en las variantes."
            : `${failed.length} producto${failed.length !== 1 ? "s" : ""} no se pudieron guardar.`
        );
      }

      setDrafts({});
      setEditEpoch(n => n + 1);
      setEditMode(false);
      router.refresh();
    } finally { setSavingBulk(false); }
  };

  const [bulkEstado,        setBulkEstado]        = useState("");
  const [bulkEstadoLoading, setBulkEstadoLoading]  = useState(false);

  const applyBulkEstado = async () => {
    if (!bulkEstado || selected.size === 0) return;
    setBulkEstadoLoading(true);
    try {
      const ids = Array.from(selected);
      const results = await Promise.all(ids.map(id =>
        fetch(`/api/admin/productos/${id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ estado: bulkEstado }),
        }).then(r => r.ok)
      ));
      ids.forEach((id, i) => { if (results[i]) patchLocal(id, { estado: bulkEstado }); });
      if (results.some(ok => !ok)) alert("Algunos productos no se pudieron actualizar.");
      setBulkEstado("");
      setSelected(new Set());
    } finally { setBulkEstadoLoading(false); }
  };

  const [bulkDeleteOpen,    setBulkDeleteOpen]    = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const applyBulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkDeleteLoading(true);
    try {
      const ids = Array.from(selected);
      const results = await Promise.all(ids.map(id =>
        fetch(`/api/admin/productos/${id}`, { method: "DELETE" }).then(r => r.ok)
      ));
      if (results.some(ok => !ok)) alert("Algunos productos no se pudieron eliminar.");
      setSelected(new Set());
      setBulkDeleteOpen(false);
      router.refresh();
      void fetchData({});
    } finally { setBulkDeleteLoading(false); }
  };

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
        .ptbl-act { display:flex; align-items:center; justify-content:flex-end; gap:4px; opacity:1; }
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
        .ptbl-subrow { border-bottom: 1px solid var(--color-cq-border, #e2e8f0); background: var(--color-cq-surface-2, #fafafa); }
        .ptbl-expand-btn {
          width:18px; height:18px; border-radius:5px; border:none; background:transparent; shrink:0;
          display:flex; align-items:center; justify-content:center; cursor:pointer; padding:0;
          color: var(--color-cq-muted-2, #94a3b8);
        }
        .ptbl-expand-btn:hover { background: var(--color-cq-surface-2, #f1f5f9); color: var(--color-cq-text, #0f172a); }
        .ptbl-cell-input {
          width: 100%; padding: 5px 7px; border-radius: 6px; outline: none;
          border: 1px solid var(--color-cq-border, #e2e8f0); background: transparent;
          font-size: 12.5px; color: var(--color-cq-text, #0f172a);
          font-family: var(--font-body, sans-serif);
          transition: border-color .15s, background .15s;
        }
        .ptbl-cell-input:hover:not(:disabled) {
          background: var(--color-cq-surface-2, #f1f5f9);
          border-color: var(--color-cq-muted-2, #94a3b8);
        }
        .ptbl-cell-input:focus {
          border-color: var(--color-cq-accent, #2563eb);
          background: var(--color-cq-surface, #fff);
          box-shadow: 0 0 0 3px var(--color-cq-accent-glow, rgba(37,99,235,0.12));
        }
        .ptbl-cell-input:disabled { opacity: .5; }
        .ptbl-cell-input[type=number] { -moz-appearance: textfield; appearance: textfield; }
        .ptbl-cell-input[type=number]::-webkit-outer-spin-button,
        .ptbl-cell-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; appearance: none; margin: 0; }
        .ptbl-cell-title { font-size: 13px; font-weight: 600; font-family: var(--font-display, sans-serif); }
      `}</style>

      <DeleteModal
        producto={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <DeleteModal
        producto={bulkDeleteOpen ? { id: -1, titulo: `${selected.size} producto${selected.size !== 1 ? "s" : ""}` } : null}
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
            {draftCount > 0 && ` — ${draftCount} producto${draftCount !== 1 ? "s" : ""} con cambios`}
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
      )}

      {/* ── Barra de cambio de estado masivo ────────────────────── */}
      {!editMode && selected.size > 0 && (
        <div
          className="flex items-center gap-3 flex-wrap px-5 py-3"
          style={{ background: "var(--color-cq-accent-glow, rgba(37,99,235,0.06))", borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}
        >
          <span
            className="text-[12px] font-semibold shrink-0"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-accent, #2563eb)" }}
          >
            {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-1.5">
            <Dropdown
              value={bulkEstado}
              onChange={setBulkEstado}
              options={BULK_ESTADO_OPTIONS}
              placeholder="Estado"
              align="left"
              width={160}
              disabled={bulkEstadoLoading}
            />
            <button
              onClick={applyBulkEstado}
              disabled={bulkEstadoLoading || !bulkEstado}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
              style={{ background: "var(--color-cq-accent, #2563eb)", color: "#fff", border: "none", cursor: bulkEstadoLoading || !bulkEstado ? "not-allowed" : "pointer", opacity: bulkEstadoLoading || !bulkEstado ? 0.5 : 1 }}
            >
              {bulkEstadoLoading ? "Aplicando…" : "Aplicar"}
            </button>
          </div>

          <button
            onClick={() => setBulkDeleteOpen(true)}
            disabled={bulkEstadoLoading || bulkDeleteLoading}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", cursor: bulkEstadoLoading || bulkDeleteLoading ? "not-allowed" : "pointer", opacity: bulkEstadoLoading || bulkDeleteLoading ? 0.5 : 1 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {bulkDeleteLoading ? "Eliminando…" : "Eliminar"}
          </button>

          <button
            onClick={() => setSelected(new Set())}
            disabled={bulkEstadoLoading || bulkDeleteLoading}
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
                        checked={selected.size === productos.length && productos.length > 0}
                        onChange={toggleAll} />
                    )}
                  </th>
                  {["Producto","Marca","Estado","Categoría","Precio","Stock","Acciones"].map((h, i) => (
                    <th key={h}
                      className={`px-4 py-3 text-[10px] font-bold tracking-widest uppercase ${i >= 4 ? "text-right" : "text-left"} ${i === 6 ? "pr-5" : ""}`}
                      style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-16 text-center">
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
                ) : productos.map(p => (
                  <ProductoTableRow
                    key={`${p.id}-${editEpoch}`}
                    p={p}
                    selected={selected.has(p.id)}
                    onToggle={() => toggleSelect(p.id)}
                    onDelete={() => setDeleteTarget({ id: p.id, titulo: p.titulo })}
                    onPatched={patchLocal}
                    onDraft={addDraft}
                    editMode={editMode}
                    categorias={categorias}
                    marcas={marcas}
                  />
                ))}
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