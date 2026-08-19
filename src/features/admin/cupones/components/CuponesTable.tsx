"use client";
// features/admin/cupones/components/CuponesTable.tsx
// ─────────────────────────────────────────────────────────────
// Tabla de cupones del panel admin. Replica el patrón global de
// CategoriasTable: selección, click en la fila, iconos de acción,
// edición masiva con borrador, búsqueda, orden y paginación.
// ─────────────────────────────────────────────────────────────
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/shared/context/AlertContext";
import { Dropdown } from "@/shared/components/ui/Dropdown";
import { useBulkEdit } from "@/shared/components/ui/BulkEditContext";
import { formatPrice } from "@/shared/lib/format";
import { ModalCupon } from "./ModalCupon";
import {
  cuponEstado, estadoMeta, valorLabel, TIPO_LABEL, APLICA_LABEL,
  type CuponRow, type CuponTipo,
} from "../types";

/* ── Constantes ─────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "fecha_desc",  label: "Más reciente" },
  { value: "fecha_asc",   label: "Más antiguo"  },
  { value: "codigo_asc",  label: "Código A–Z"   },
  { value: "codigo_desc", label: "Código Z–A"   },
  { value: "usos_desc",   label: "Usos ↓"       },
  { value: "usos_asc",    label: "Usos ↑"       },
  { value: "valor_desc",  label: "Valor ↓"      },
  { value: "valor_asc",   label: "Valor ↑"      },
];

const ESTADO_TABS = [
  { value: "",           label: "Todos"       },
  { value: "activo",     label: "Activos"     },
  { value: "programado", label: "Programados" },
  { value: "expirado",   label: "Expirados"   },
  { value: "agotado",    label: "Agotados"    },
  { value: "inactivo",   label: "Inactivos"   },
];

const TIPO_OPTIONS = [
  { value: "",             label: "Todos los tipos" },
  { value: "porcentaje",   label: "Porcentaje"      },
  { value: "monto_fijo",   label: "Monto fijo"      },
  { value: "envio_gratis", label: "Envío gratis"    },
  { value: "2x1",          label: "2x1"             },
];

const TIPO_EDIT_OPTIONS = (Object.keys(TIPO_LABEL) as CuponTipo[])
  .map(v => ({ value: v, label: TIPO_LABEL[v] }));

const LIMIT = 20;

/* ── Utilidades ─────────────────────────────────────────────── */
function fechaCorta(v: string | null): string {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "2-digit" });
}

/** Rango de vigencia en una línea: "12 ene 26 → 31 ene 26". */
function vigenciaLabel(c: CuponRow): string {
  if (!c.valido_desde && !c.valido_hasta) return "Sin límite";
  if (c.valido_desde && !c.valido_hasta)  return `Desde ${fechaCorta(c.valido_desde)}`;
  if (!c.valido_desde && c.valido_hasta)  return `Hasta ${fechaCorta(c.valido_hasta)}`;
  return `${fechaCorta(c.valido_desde)} → ${fechaCorta(c.valido_hasta)}`;
}

/* ── Modal de confirmación de borrado ───────────────────────── */
function DeleteModal({
  cupon, onConfirm, onCancel, loading,
}: {
  cupon: { id: number; codigo: string } | null;
  onConfirm: () => void;
  onCancel:  () => void;
  loading:   boolean;
}) {
  if (!cupon) return null;
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
            Eliminar cupón
          </p>
          <p className="text-[13px]" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)", lineHeight: 1.5 }}>
            ¿Estás seguro de que quieres eliminar{" "}
            <span className="font-semibold" style={{ color: "var(--color-cq-text, #0f172a)" }}>{cupon.codigo}</span>
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

/* ── Dropdown ordenar ───────────────────────────────────────── */
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

/* ── Insignia de estado ─────────────────────────────────────── */
function EstadoBadge({ c }: { c: CuponRow }) {
  const m = estadoMeta(cuponEstado(c));
  return (
    <span className="px-2 py-1 rounded-md text-[10.5px] font-bold whitespace-nowrap"
      style={{ background: m.bg, color: m.color, fontFamily: "var(--font-mono, monospace)" }}>
      {m.label}
    </span>
  );
}

/* ── Barra de progreso de usos ──────────────────────────────── */
function UsosBar({ c }: { c: CuponRow }) {
  const usados = Number(c.usos_actuales);
  const tope   = c.uso_maximo_total;

  if (tope == null) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-[13px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display, sans-serif)", color: usados === 0 ? "var(--color-cq-muted-2, #94a3b8)" : "var(--color-cq-text, #0f172a)" }}>
          {usados.toLocaleString("es-MX")}
        </span>
        <span className="text-[9.5px] uppercase tracking-wider" style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
          Ilimitado
        </span>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((usados / Number(tope)) * 100));
  const col = pct >= 100 ? "#d97706" : "var(--color-cq-accent, #2563eb)";

  return (
    <div className="flex flex-col items-end gap-1 min-w-[70px]">
      <span className="text-[12.5px] font-bold tabular-nums" style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
        {usados.toLocaleString("es-MX")}<span style={{ color: "var(--color-cq-muted-2, #94a3b8)", fontWeight: 500 }}> / {Number(tope).toLocaleString("es-MX")}</span>
      </span>
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "var(--color-cq-surface-2, #f1f5f9)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col, transition: "width .2s" }} />
      </div>
    </div>
  );
}

/* ── Fila de la tabla ───────────────────────────────────────── */
function CuponTableRow({
  c, selected, onToggle, onEdit, onDelete, onDraft, onToggleActivo, editMode,
}: {
  c: CuponRow;
  selected: boolean;
  onToggle: () => void;
  onEdit:   () => void;
  onDelete: () => void;
  onDraft:  (id: number, patch: Record<string, string | number | null>) => void;
  onToggleActivo: () => void;
  editMode: boolean;
}) {
  /* El padre remonta las filas (key = `${id}-${editEpoch}`) al cancelar la
     edición o al recargar datos, así que este estado local se reinicializa
     solo: no hace falta sincronizarlo con un efecto. */
  const [codigo, setCodigo] = useState(c.codigo);
  const [tipo,   setTipo]   = useState<CuponTipo>(c.tipo);
  const [valor,  setValor]  = useState(String(c.valor ?? ""));

  /* En modo edición masiva los cambios NO se envían al servidor: se acumulan
     en el borrador del padre y se confirman con el botón "Guardar". */

  const saveCodigo = (value: string) => {
    const next = value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (!next || next === c.codigo) { setCodigo(c.codigo); return; }
    setCodigo(next);
    onDraft(c.id, { codigo: next });
  };

  const saveTipo = (value: string) => {
    setTipo(value as CuponTipo);
    const patch: Record<string, string | number | null> = { tipo: value };
    // Envío gratis y 2x1 no llevan importe: se refleja de inmediato en la celda.
    if (value === "envio_gratis" || value === "2x1") { patch.valor = 0; setValor("0"); }
    onDraft(c.id, patch);
  };

  const saveValor = (value: string) => {
    const next = Number(value);
    if (Number.isNaN(next) || next === Number(c.valor)) { setValor(String(c.valor ?? "")); return; }
    onDraft(c.id, { valor: next });
  };

  const necesitaValor = tipo === "porcentaje" || tipo === "monto_fijo";

  /* ── Vista de solo lectura (por defecto) ──────────────────── */
  if (!editMode) {
    return (
      <tr className={`cptbl-row${selected ? " sel" : ""}`} style={{ cursor: "pointer" }} onClick={onEdit}>
        <td className="pl-5 pr-3 py-3.5" onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={onToggle}
            className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600" />
        </td>

        {/* Código + descripción */}
        <td className="px-4 py-3.5">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="cptbl-title-link" title="Editar cupón">{c.codigo}</span>
            <span className="text-[10.5px] truncate max-w-[220px]"
              style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
              {c.descripcion || APLICA_LABEL[c.aplica_a]}
            </span>
          </div>
        </td>

        {/* Tipo + valor */}
        <td className="px-4 py-3.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold" style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
              {valorLabel(c)}
            </span>
            <span className="text-[10px] uppercase tracking-wider"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
              {TIPO_LABEL[c.tipo]}
            </span>
          </div>
        </td>

        {/* Compra mínima */}
        <td className="px-4 py-3.5">
          <span className="text-[12px]" style={{ fontFamily: "var(--font-body, sans-serif)", color: c.minimo_compra ? "var(--color-cq-text, #0f172a)" : "var(--color-cq-muted-2, #94a3b8)" }}>
            {c.minimo_compra ? formatPrice(Number(c.minimo_compra)).replace(" MXN", "") : "—"}
          </span>
        </td>

        {/* Vigencia */}
        <td className="px-4 py-3.5">
          <span className="text-[11.5px] whitespace-nowrap"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}>
            {vigenciaLabel(c)}
          </span>
        </td>

        {/* Estado */}
        <td className="px-4 py-3.5"><EstadoBadge c={c} /></td>

        {/* Usos */}
        <td className="px-4 py-3.5 text-right"><UsosBar c={c} /></td>

        {/* Acciones */}
        <td className="px-4 py-3.5 pr-5 text-right" onClick={e => e.stopPropagation()}>
          <div className="cptbl-act">
            <button
              onClick={onToggleActivo}
              className="cptbl-btn"
              title={Number(c.activo) ? "Desactivar cupón" : "Activar cupón"}
            >
              {Number(c.activo) ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              )}
            </button>
            <button onClick={onDelete} className="cptbl-btn del" title="Eliminar">
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

  /* ── Vista de edición masiva ──────────────────────────────── */
  return (
    <tr className="cptbl-row">
      <td className="pl-5 pr-3 py-3.5" />

      {/* Código — editable */}
      <td className="px-4 py-3.5">
        <input
          value={codigo}
          onChange={e => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
          onBlur={e => saveCodigo(e.target.value)}
          className="cptbl-cell-input cptbl-cell-title"
          style={{ fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.03em" }}
        />
      </td>

      {/* Tipo — select editable */}
      <td className="px-4 py-3.5">
        <Dropdown
          value={tipo}
          onChange={saveTipo}
          align="left"
          width={170}
          options={TIPO_EDIT_OPTIONS}
          triggerClassName="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
        />
      </td>

      {/* Valor — editable */}
      <td className="px-4 py-3.5">
        <input
          type="number" min="0" step={tipo === "porcentaje" ? "1" : "0.01"}
          value={necesitaValor ? valor : ""}
          onChange={e => setValor(e.target.value)}
          onBlur={e => saveValor(e.target.value)}
          disabled={!necesitaValor}
          placeholder={necesitaValor ? "0" : "N/A"}
          className="cptbl-cell-input"
          style={{ maxWidth: 90 }}
        />
      </td>

      {/* Compra mínima — editable */}
      <td className="px-4 py-3.5">
        <input
          type="number" min="0" step="0.01"
          defaultValue={c.minimo_compra ?? ""}
          onBlur={e => {
            const raw = e.target.value.trim();
            const next = raw === "" ? null : Number(raw);
            if (next === (c.minimo_compra ?? null)) return;
            onDraft(c.id, { minimo_compra: next });
          }}
          placeholder="Sin mínimo"
          className="cptbl-cell-input"
          style={{ maxWidth: 110 }}
        />
      </td>

      {/* Usos totales — editable */}
      <td className="px-4 py-3.5">
        <input
          type="number" min="1" step="1"
          defaultValue={c.uso_maximo_total ?? ""}
          onBlur={e => {
            const raw = e.target.value.trim();
            const next = raw === "" ? null : Number(raw);
            if (next === (c.uso_maximo_total ?? null)) return;
            onDraft(c.id, { uso_maximo_total: next });
          }}
          placeholder="Ilimitado"
          className="cptbl-cell-input"
          style={{ maxWidth: 100 }}
        />
      </td>

      {/* Activo — toggle en borrador */}
      <td className="px-4 py-3.5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked={Boolean(Number(c.activo))}
            onChange={e => onDraft(c.id, { activo: e.target.checked ? 1 : 0 })}
            className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600"
          />
          <span className="text-[11px]" style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}>
            Activo
          </span>
        </label>
      </td>

      {/* Usos — solo lectura */}
      <td className="px-4 py-3.5 text-right">
        <span className="text-[13px] font-bold tabular-nums"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-muted, #64748b)" }}>
          {Number(c.usos_actuales).toLocaleString("es-MX")}
        </span>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3.5 pr-5 text-right">
        <div className="cptbl-act">
          <button onClick={onEdit} className="cptbl-btn" title="Editar completo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onClick={onDelete} className="cptbl-btn del" title="Eliminar">
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

/* ── Componente principal ───────────────────────────────────── */
interface Props {
  initialCupones: CuponRow[];
  initialTotal:   number;
}

export function CuponesTable({ initialCupones, initialTotal }: Props) {
  const router = useRouter();
  const alert  = useAlert();

  const [cupones,  setCupones]  = useState<CuponRow[]>(initialCupones);
  const [total,    setTotal]    = useState(initialTotal);
  const [q,        setQ]        = useState("");
  const [estado,   setEstado]   = useState("");
  const [tipo,     setTipo]     = useState("");
  const [sort,     setSort]     = useState("fecha_desc");
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(Math.max(1, Math.ceil(initialTotal / LIMIT)));
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { editMode, setEditMode } = useBulkEdit();

  // Borrador de la edición masiva: { [cuponId]: { campo: valor } }
  const [drafts,     setDrafts]     = useState<Record<number, Record<string, string | number | null>>>({});
  const [savingBulk, setSavingBulk] = useState(false);
  // Fuerza el remount de las filas al cancelar, para descartar el estado local de cada input
  const [editEpoch,  setEditEpoch]  = useState(0);

  const draftCount = Object.keys(drafts).length;

  // Modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editando,  setEditando]  = useState<CuponRow | null>(null);

  // Modal eliminar
  const [deleteTarget,  setDeleteTarget]  = useState<{ id: number; codigo: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Acciones masivas sobre la selección
  const [bulkLoading,    setBulkLoading]    = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Debounce búsqueda
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (p: { q?: string; estado?: string; tipo?: string; sort?: string; page?: number }) => {
    setLoading(true);
    const sp = new URLSearchParams({
      q:      p.q      ?? q,
      estado: p.estado ?? estado,
      tipo:   p.tipo   ?? tipo,
      sort:   p.sort   ?? sort,
      page:   String(p.page ?? page),
      limit:  String(LIMIT),
    });
    try {
      const res  = await fetch(`/api/admin/cupones?${sp}`);
      const json = await res.json();
      if (json.success) {
        setCupones(json.data);
        setTotal(json.meta.total);
        setPages(json.meta.pages);
        // Remonta las filas para que sus inputs tomen los valores recién cargados
        setEditEpoch(n => n + 1);
      }
    } finally { setLoading(false); }
  }, [q, estado, tipo, sort, page]);

  const toggleSelect = (id: number) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () =>
    setSelected(prev => prev.size === cupones.length ? new Set() : new Set(cupones.map(c => c.id)));

  /** Actualiza un cupón en la lista local sin refetch. */
  const patchLocal = (id: number, patch: Partial<CuponRow>) =>
    setCupones(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));

  /* ── Búsqueda / filtros / orden ───────────────────────────── */
  const handleSearchChange = (value: string) => {
    setQ(value);
    setPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { void fetchData({ q: value, page: 1 }); }, 350);
  };

  const handleEstado = (value: string) => {
    setEstado(value);
    setPage(1);
    void fetchData({ estado: value, page: 1 });
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

  /* ── Crear / editar ───────────────────────────────────────── */
  const abrirCrear = () => { setEditando(null); setModalOpen(true); };
  const abrirEditar = (c: CuponRow) => { setEditando(c); setModalOpen(true); };

  const handleSaved = (cupon: CuponRow) => {
    if (editando) patchLocal(cupon.id, cupon);
    else          void fetchData({});
    router.refresh();
  };

  /* ── Activar / desactivar en un clic ──────────────────────── */
  const toggleActivo = async (c: CuponRow) => {
    const next = Number(c.activo) ? 0 : 1;
    patchLocal(c.id, { activo: next });   // optimista
    try {
      const res  = await fetch(`/api/admin/cupones/${c.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ activo: next }),
      });
      const json = await res.json().catch(() => ({ success: false }));
      if (!json.success) {
        patchLocal(c.id, { activo: c.activo }); // revierte
        alert.error(json.error ?? "No se pudo cambiar el estado del cupón");
        return;
      }
      alert.success(next ? `Cupón ${c.codigo} activado` : `Cupón ${c.codigo} desactivado`);
      router.refresh();
    } catch {
      patchLocal(c.id, { activo: c.activo });
      alert.error("Error de conexión");
    }
  };

  /* ── Eliminar ─────────────────────────────────────────────── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res  = await fetch(`/api/admin/cupones/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({ success: false }));
      if (!json.success) {
        alert.error(json.error ?? "No se pudo eliminar el cupón");
        return;
      }
      setCupones(prev => prev.filter(c => c.id !== deleteTarget.id));
      setTotal(t => Math.max(0, t - 1));
      setSelected(prev => { const s = new Set(prev); s.delete(deleteTarget.id); return s; });
      alert.success("Cupón eliminado correctamente");
      router.refresh();
    } catch {
      alert.error("Error de conexión");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  /* ── Edición masiva ───────────────────────────────────────── */
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
        const res  = await fetch(`/api/admin/cupones/${id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({ success: false }));
        return { id: Number(id), body, ok: Boolean(json?.success), error: json?.error as string | undefined };
      }));

      // Refleja en la lista local lo que sí se guardó
      results.filter(r => r.ok).forEach(r => patchLocal(r.id, r.body as Partial<CuponRow>));

      const failed = results.filter(r => !r.ok);
      if (failed.length) {
        alert.error(failed[0].error ?? `${failed.length} cupón${failed.length !== 1 ? "es" : ""} no se pudieron guardar.`);
      } else {
        alert.success(`${results.length} cupón${results.length !== 1 ? "es" : ""} actualizado${results.length !== 1 ? "s" : ""} correctamente`);
      }

      setDrafts({});
      setEditEpoch(n => n + 1);
      setEditMode(false);
      router.refresh();
    } finally { setSavingBulk(false); }
  };

  /* ── Activar/desactivar masivo ────────────────────────────── */
  const applyBulkActivo = async (next: 0 | 1) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selected);
      const results = await Promise.all(ids.map(async id => {
        const res  = await fetch(`/api/admin/cupones/${id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ activo: next }),
        });
        const json = await res.json().catch(() => ({ success: false }));
        return { id, ok: Boolean(json?.success), error: json?.error as string | undefined };
      }));

      results.filter(r => r.ok).forEach(r => patchLocal(r.id, { activo: next }));

      const failed = results.filter(r => !r.ok);
      if (failed.length) alert.error(failed[0].error ?? `${failed.length} cupones no se pudieron actualizar.`);
      else               alert.success(`${results.length} cupón${results.length !== 1 ? "es" : ""} ${next ? "activado" : "desactivado"}${results.length !== 1 ? "s" : ""}`);

      setSelected(new Set());
      router.refresh();
    } finally { setBulkLoading(false); }
  };

  /* ── Eliminar masivo ──────────────────────────────────────── */
  const applyBulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selected);
      const results = await Promise.all(ids.map(async id => {
        const res  = await fetch(`/api/admin/cupones/${id}`, { method: "DELETE" });
        const json = await res.json().catch(() => ({ success: false }));
        return { id, ok: Boolean(json?.success), error: json?.error as string | undefined };
      }));

      const okIds = new Set(results.filter(r => r.ok).map(r => r.id));
      if (okIds.size) {
        setCupones(prev => prev.filter(c => !okIds.has(c.id)));
        setTotal(t => Math.max(0, t - okIds.size));
      }

      const failed = results.filter(r => !r.ok);
      if (failed.length) alert.error(failed[0].error ?? `${failed.length} cupones no se pudieron eliminar.`);
      else               alert.success(`${okIds.size} cupón${okIds.size !== 1 ? "es" : ""} eliminado${okIds.size !== 1 ? "s" : ""} correctamente`);

      setSelected(new Set());
      setBulkDeleteOpen(false);
      router.refresh();
    } finally { setBulkLoading(false); }
  };

  return (
    <>
      <style>{`
        .cptbl-row { border-bottom: 1px solid var(--color-cq-border, #e2e8f0); transition: background .1s; }
        .cptbl-row:hover { background: var(--color-cq-surface-2, #f8fafc); }
        .cptbl-row.sel { background: var(--color-cq-accent-glow, rgba(37,99,235,0.05)); }
        .cptbl-act { display:flex; align-items:center; justify-content:flex-end; gap:4px; opacity:1; }
        .cptbl-btn {
          width:28px; height:28px; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          color: var(--color-cq-muted, #64748b);
          background: transparent; border: none; cursor: pointer;
          transition: color .15s, background .15s;
        }
        .cptbl-btn:hover { color: var(--color-cq-text, #0f172a); background: var(--color-cq-surface-2, #f1f5f9); }
        .cptbl-btn.del:hover { color: #ef4444; background: rgba(239,68,68,0.08); }
        .cptbl-input {
          width: 100%; padding: 8px 12px 8px 32px;
          background: var(--color-cq-surface-2, #f1f5f9);
          border: 1px solid var(--color-cq-border, #e2e8f0);
          border-radius: 8px; outline: none;
          font-size: 13px; color: var(--color-cq-text, #0f172a);
          font-family: var(--font-body, sans-serif);
          transition: border-color .15s, box-shadow .15s;
        }
        .cptbl-input:focus {
          border-color: var(--color-cq-accent, #2563eb);
          box-shadow: 0 0 0 3px var(--color-cq-accent-glow, rgba(37,99,235,0.12));
          background: var(--color-cq-surface, #fff);
        }
        .cptbl-pgbtn {
          width:30px; height:30px; border-radius:7px; border:1px solid var(--color-cq-border, #e2e8f0);
          display:flex; align-items:center; justify-content:center;
          font-size:12px; cursor:pointer; transition:all .15s;
          font-family: var(--font-mono, monospace);
          color: var(--color-cq-muted, #64748b);
          background: var(--color-cq-surface, #fff);
        }
        .cptbl-pgbtn:hover:not(:disabled) { border-color:var(--color-cq-accent,#2563eb); color:var(--color-cq-accent,#2563eb); }
        .cptbl-pgbtn.act { background:var(--color-cq-accent,#2563eb); color:#fff; border-color:var(--color-cq-accent,#2563eb); }
        .cptbl-pgbtn:disabled { opacity:.35; cursor:not-allowed; }
        .cptbl-title-link {
          font-size:13px; font-weight:700; line-height:1.35;
          letter-spacing: 0.03em;
          color: var(--color-cq-text, #0f172a);
          font-family: var(--font-mono, monospace);
          text-decoration: none; cursor: pointer;
          transition: color .15s;
        }
        .cptbl-title-link:hover { color: var(--color-cq-accent, #2563eb); text-decoration: underline; }
        .cptbl-cell-input {
          width: 100%; padding: 5px 7px; border-radius: 6px; outline: none;
          border: 1px solid var(--color-cq-border, #e2e8f0); background: transparent;
          font-size: 12.5px; color: var(--color-cq-text, #0f172a);
          font-family: var(--font-body, sans-serif);
          transition: border-color .15s, background .15s;
        }
        .cptbl-cell-input:hover:not(:disabled) {
          background: var(--color-cq-surface-2, #f1f5f9);
          border-color: var(--color-cq-muted-2, #94a3b8);
        }
        .cptbl-cell-input:focus {
          border-color: var(--color-cq-accent, #2563eb);
          background: var(--color-cq-surface, #fff);
          box-shadow: 0 0 0 3px var(--color-cq-accent-glow, rgba(37,99,235,0.12));
        }
        .cptbl-cell-input:disabled { opacity: .5; }
        .cptbl-cell-title { font-size: 13px; font-weight: 700; }
      `}</style>

      <DeleteModal
        cupon={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />

      <DeleteModal
        cupon={bulkDeleteOpen ? { id: -1, codigo: `${selected.size} cupón${selected.size !== 1 ? "es" : ""}` } : null}
        onConfirm={applyBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        loading={bulkLoading}
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
            {draftCount > 0 && ` — ${draftCount} cupón${draftCount !== 1 ? "es" : ""} con cambios`}
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

      {/* ── Barra de herramientas ────────────────────────────── */}
      {!editMode && (
      <div className="flex flex-col gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}>

        {/* Fila 1: búsqueda + tipo + sort */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por código o descripción…"
              value={q}
              className="cptbl-input"
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

          {/* Tipo */}
          <Dropdown value={tipo} onChange={handleTipo} options={TIPO_OPTIONS} width={180} placeholder="Todos los tipos" />

          {/* Ordenar */}
          <SortDropdown value={sort} onChange={handleSort} />

          {/* Editar masivamente */}
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

      {/* ── Barra de acciones sobre la selección ─────────────── */}
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

          <button
            onClick={() => applyBulkActivo(1)}
            disabled={bulkLoading}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
            style={{ background: "var(--color-cq-accent, #2563eb)", color: "#fff", border: "none", cursor: bulkLoading ? "not-allowed" : "pointer", opacity: bulkLoading ? 0.5 : 1 }}
          >
            Activar
          </button>

          <button
            onClick={() => applyBulkActivo(0)}
            disabled={bulkLoading}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
            style={{ background: "var(--color-cq-surface, #fff)", color: "var(--color-cq-muted, #64748b)", border: "1px solid var(--color-cq-border, #e2e8f0)", cursor: bulkLoading ? "not-allowed" : "pointer", opacity: bulkLoading ? 0.5 : 1 }}
          >
            Desactivar
          </button>

          <button
            onClick={() => setBulkDeleteOpen(true)}
            disabled={bulkLoading}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center gap-1.5"
            style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", cursor: bulkLoading ? "not-allowed" : "pointer", opacity: bulkLoading ? 0.5 : 1 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Eliminar
          </button>

          <button
            onClick={() => setSelected(new Set())}
            disabled={bulkLoading}
            className="ml-auto text-[12px] font-semibold"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-cq-muted, #64748b)" }}
          >
            Limpiar selección
          </button>
        </div>
      )}

      {/* ── Tabla ────────────────────────────────────────────── */}
      <div className={`transition-opacity duration-150 ${loading ? "opacity-40 pointer-events-none" : ""}`}>
        <div className={editMode ? "overflow-visible" : "overflow-x-auto"}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)", background: "var(--color-cq-surface-2, #fafafa)" }}>
                <th className="pl-5 pr-3 py-3 w-10">
                  {!editMode && (
                    <input type="checkbox" className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600"
                      checked={selected.size === cupones.length && cupones.length > 0}
                      onChange={toggleAll} />
                  )}
                </th>
                {(editMode
                  ? ["Código","Tipo","Valor","Compra mínima","Usos totales","Activo","Usos","Acciones"]
                  : ["Cupón","Descuento","Compra mínima","Vigencia","Estado","Usos","Acciones"]
                ).map((h, i, arr) => (
                  <th key={h}
                    className={`px-4 py-3 text-[10px] font-bold tracking-widest uppercase ${i >= arr.length - 2 ? "text-right" : "text-left"} ${i === arr.length - 1 ? "pr-5" : ""}`}
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cupones.length === 0 ? (
                <tr><td colSpan={9} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--color-cq-surface-2, #f1f5f9)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                      </svg>
                    </div>
                    <p className="text-[13px] font-medium" style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
                      No se encontraron cupones
                    </p>
                    <button onClick={abrirCrear} className="text-[12px] font-semibold"
                      style={{ color: "var(--color-cq-accent, #2563eb)", fontFamily: "var(--font-mono, monospace)", background: "none", border: "none", cursor: "pointer" }}>
                      + Crear el primero
                    </button>
                  </div>
                </td></tr>
              ) : cupones.map(c => (
                <CuponTableRow
                  key={`${c.id}-${editEpoch}`}
                  c={c}
                  selected={selected.has(c.id)}
                  onToggle={() => toggleSelect(c.id)}
                  onEdit={() => abrirEditar(c)}
                  onDelete={() => setDeleteTarget({ id: c.id, codigo: c.codigo })}
                  onDraft={addDraft}
                  onToggleActivo={() => void toggleActivo(c)}
                  editMode={editMode}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Paginación ───────────────────────────────────────── */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--color-cq-border, #e2e8f0)" }}>
          <p className="text-[11px]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
            Página {page} de {pages}
          </p>
          <div className="flex items-center gap-1">
            <button className="cptbl-pgbtn" disabled={page === 1 || loading}
              onClick={() => { const p = page - 1; setPage(p); void fetchData({ page: p }); }}>←</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, pages - 4));
              const pg = start + i;
              return (
                <button key={pg} className={`cptbl-pgbtn${pg === page ? " act" : ""}`}
                  disabled={loading}
                  onClick={() => { setPage(pg); void fetchData({ page: pg }); }}>
                  {pg}
                </button>
              );
            })}
            <button className="cptbl-pgbtn" disabled={page === pages || loading}
              onClick={() => { const p = page + 1; setPage(p); void fetchData({ page: p }); }}>→</button>
          </div>
        </div>
      )}

      <ModalCupon
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        cupon={editando}
      />
    </>
  );
}
