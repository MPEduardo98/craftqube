"use client";
// features/admin/pedidos/components/PedidosTable.tsx
// ─────────────────────────────────────────────────────────────
// Tabla de pedidos del panel admin. Sigue el patrón global de
// ProductosTable / CategoriasTable: búsqueda, filtros por estado,
// orden, selección, cambio masivo de estado y paginación.
// El click en la fila abre el detalle en panel lateral.
// ─────────────────────────────────────────────────────────────
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/shared/context/AlertContext";
import { Dropdown } from "@/shared/components/ui/Dropdown";
import { formatPrice } from "@/shared/lib/format";
import { ModalPedido } from "./ModalPedido";
import {
  ESTADO_ORDEN, estadoMeta, metodoPagoLabel,
  type PedidoRow,
} from "../types";

/* ── Constantes ─────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "fecha_desc",  label: "Más reciente" },
  { value: "fecha_asc",   label: "Más antiguo"  },
  { value: "total_desc",  label: "Total ↓"      },
  { value: "total_asc",   label: "Total ↑"      },
  { value: "numero_desc", label: "Número Z–A"   },
  { value: "numero_asc",  label: "Número A–Z"   },
];

const ESTADO_TABS = [
  { value: "",               label: "Todos"      },
  { value: "pendiente_pago", label: "Pendientes" },
  { value: "pago_recibido",  label: "Pagados"    },
  { value: "en_proceso",     label: "En proceso" },
  { value: "listo_envio",    label: "Por enviar" },
  { value: "enviado",        label: "Enviados"   },
  { value: "entregado",      label: "Entregados" },
  { value: "cancelado",      label: "Cancelados" },
  { value: "reembolsado",    label: "Reembolsados" },
];

const METODO_OPTIONS = [
  { value: "",              label: "Todos los métodos" },
  { value: "tarjeta",       label: "Tarjeta"           },
  { value: "transferencia", label: "Transferencia"     },
  { value: "oxxo",          label: "OXXO"              },
];

const LIMIT = 20;

/* ── Utilidades ─────────────────────────────────────────────── */
function fechaCorta(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "2-digit" });
}

function horaCorta(v: string): string {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

/* ── Insignia de estado ─────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: string }) {
  const m = estadoMeta(estado);
  return (
    <span className="px-2 py-1 rounded-md text-[10.5px] font-bold whitespace-nowrap"
      style={{ background: m.bg, color: m.color, fontFamily: "var(--font-mono, monospace)" }}>
      {m.label}
    </span>
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

/* ── Fila de la tabla ───────────────────────────────────────── */
function PedidoTableRow({
  p, selected, onToggle, onOpen,
}: {
  p: PedidoRow;
  selected: boolean;
  onToggle: () => void;
  onOpen:   () => void;
}) {
  const mon = p.moneda === "USD" ? "USD" : "MXN";
  return (
    <tr className={`ptbl-row${selected ? " sel" : ""}`} style={{ cursor: "pointer" }} onClick={onOpen}>
      <td className="pl-5 pr-3 py-3.5" onClick={e => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={onToggle}
          className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600" />
      </td>

      {/* Pedido */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="ptbl-title-link" title="Ver detalle">{p.numero}</span>
          <span className="text-[10.5px]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
            {p.total_items} artículo{Number(p.total_items) !== 1 ? "s" : ""}
          </span>
        </div>
      </td>

      {/* Cliente */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[12.5px] font-semibold truncate max-w-[180px]"
            style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
            {p.cliente}
          </span>
          <span className="text-[10.5px] truncate max-w-[180px]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
            {p.email}
          </span>
        </div>
      </td>

      {/* Estado */}
      <td className="px-4 py-3.5">
        <EstadoBadge estado={p.estado} />
      </td>

      {/* Pago */}
      <td className="px-4 py-3.5">
        <span className="text-[12px]"
          style={{ fontFamily: "var(--font-body, sans-serif)", color: p.metodo_pago ? "var(--color-cq-text, #0f172a)" : "var(--color-cq-muted-2, #94a3b8)" }}>
          {metodoPagoLabel(p.metodo_pago)}
        </span>
      </td>

      {/* Envío */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[12px] truncate max-w-[150px]"
            style={{ fontFamily: "var(--font-body, sans-serif)", color: "var(--color-cq-muted, #64748b)" }}>
            {p.envio_ciudad}, {p.envio_estado}
          </span>
          {p.numero_guia && (
            <span className="text-[10.5px] truncate max-w-[150px]"
              style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
              {p.paqueteria ? `${p.paqueteria} · ` : ""}{p.numero_guia}
            </span>
          )}
        </div>
      </td>

      {/* Fecha */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] whitespace-nowrap"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-text, #0f172a)" }}>
            {fechaCorta(p.created_at)}
          </span>
          <span className="text-[10.5px]"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
            {horaCorta(p.created_at)}
          </span>
        </div>
      </td>

      {/* Total */}
      <td className="px-4 py-3.5 pr-5 text-right">
        <span className="text-[13px] font-bold tabular-nums whitespace-nowrap"
          style={{ fontFamily: "var(--font-display, sans-serif)", color: "var(--color-cq-text, #0f172a)" }}>
          {formatPrice(Number(p.total), mon)}
        </span>
      </td>
    </tr>
  );
}

/* ── Componente principal ───────────────────────────────────── */
interface Props {
  initialPedidos: PedidoRow[];
  initialTotal:   number;
}

export function PedidosTable({ initialPedidos, initialTotal }: Props) {
  const router = useRouter();
  const alert  = useAlert();

  const [pedidos, setPedidos] = useState<PedidoRow[]>(initialPedidos);
  const [total,   setTotal]   = useState(initialTotal);
  const [q,       setQ]       = useState("");
  const [estado,  setEstado]  = useState("");
  const [metodo,  setMetodo]  = useState("");
  const [sort,    setSort]    = useState("fecha_desc");
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(Math.max(1, Math.ceil(initialTotal / LIMIT)));
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // Detalle
  const [detalleId, setDetalleId] = useState<number | null>(null);

  // Cambio masivo de estado
  const [bulkEstado,        setBulkEstado]        = useState("");
  const [bulkEstadoLoading, setBulkEstadoLoading] = useState(false);

  // Debounce búsqueda
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (p: { q?: string; estado?: string; metodo?: string; sort?: string; page?: number }) => {
    setLoading(true);
    const sp = new URLSearchParams({
      q:      p.q      ?? q,
      estado: p.estado ?? estado,
      metodo: p.metodo ?? metodo,
      sort:   p.sort   ?? sort,
      page:   String(p.page ?? page),
      limit:  String(LIMIT),
    });
    try {
      const res  = await fetch(`/api/admin/pedidos?${sp}`);
      const json = await res.json();
      if (json.success) {
        setPedidos(json.data);
        setTotal(json.meta.total);
        setPages(json.meta.pages);
      }
    } finally { setLoading(false); }
  }, [q, estado, metodo, sort, page]);

  const toggleSelect = (id: number) =>
    setSelected(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });

  const toggleAll = () =>
    setSelected(prev => prev.size === pedidos.length ? new Set() : new Set(pedidos.map(p => p.id)));

  /** Actualiza un pedido en la lista local sin refetch. */
  const patchLocal = useCallback((id: number, patch: Partial<PedidoRow>) =>
    setPedidos(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p))), []);

  /* ── Cambio masivo de estado ──────────────────────────────── */
  const applyBulkEstado = async () => {
    if (!bulkEstado || selected.size === 0) return;
    setBulkEstadoLoading(true);
    try {
      const ids = Array.from(selected);
      const results = await Promise.all(ids.map(async id => {
        const res  = await fetch(`/api/admin/pedidos/${id}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ estado: bulkEstado, notificar: false }),
        });
        const json = await res.json().catch(() => ({ success: false }));
        return { id, ok: Boolean(json?.success), error: json?.error as string | undefined };
      }));

      results.filter(r => r.ok).forEach(r =>
        patchLocal(r.id, { estado: bulkEstado as PedidoRow["estado"] })
      );

      const failed = results.filter(r => !r.ok);
      if (failed.length) {
        alert.error(failed[0].error ?? `${failed.length} pedido${failed.length !== 1 ? "s" : ""} no se pudieron actualizar.`);
      } else {
        alert.success(`${results.length} pedido${results.length !== 1 ? "s" : ""} → ${estadoMeta(bulkEstado).label}`);
      }

      setBulkEstado("");
      setSelected(new Set());
      void fetchData({});
      router.refresh();
    } finally { setBulkEstadoLoading(false); }
  };

  /* ── Handlers de la barra de herramientas ─────────────────── */
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

  const handleMetodo = (value: string) => {
    setMetodo(value);
    setPage(1);
    void fetchData({ metodo: value, page: 1 });
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
    void fetchData({ sort: value, page: 1 });
  };

  /** Al cerrar el detalle refresca las métricas del encabezado. */
  const cerrarDetalle = () => {
    setDetalleId(null);
    router.refresh();
  };

  return (
    <>
      <style>{`
        .ptbl-row { border-bottom: 1px solid var(--color-cq-border, #e2e8f0); transition: background .1s; }
        .ptbl-row:hover { background: var(--color-cq-surface-2, #f8fafc); }
        .ptbl-row.sel { background: var(--color-cq-accent-glow, rgba(37,99,235,0.05)); }
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
          font-family: var(--font-mono, monospace);
          letter-spacing: .02em;
          text-decoration: none; cursor: pointer;
          transition: color .15s;
        }
        .ptbl-row:hover .ptbl-title-link { color: var(--color-cq-accent, #2563eb); text-decoration: underline; }
      `}</style>

      {/* ── Barra de herramientas ─────────────────────────────── */}
      <div className="flex flex-col gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}>

        {/* Fila 1: búsqueda + método + orden + contador */}
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
              placeholder="Buscar por número, cliente, email, teléfono o guía…"
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

          {/* Método de pago */}
          <Dropdown
            value={metodo}
            onChange={handleMetodo}
            options={METODO_OPTIONS}
            width={190}
            placeholder="Todos los métodos"
            icon={
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            }
          />

          {/* Ordenar */}
          <SortDropdown value={sort} onChange={handleSort} />

          {/* Contador */}
          <span className="text-[11px] tabular-nums shrink-0"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2, #94a3b8)" }}>
            {total} resultado{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Fila 2: filtros por estado */}
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

      {/* ── Barra de acciones sobre la selección ──────────────── */}
      {selected.size > 0 && (
        <div
          className="flex items-center gap-3 flex-wrap px-5 py-3"
          style={{ background: "var(--color-cq-accent-glow, rgba(37,99,235,0.06))", borderBottom: "1px solid var(--color-cq-border, #e2e8f0)" }}
        >
          <span className="text-[12px] font-semibold shrink-0"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-accent, #2563eb)" }}>
            {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
          </span>

          <div className="flex items-center gap-1.5">
            <Dropdown
              value={bulkEstado}
              onChange={setBulkEstado}
              placeholder="Cambiar estado"
              align="left"
              width={210}
              disabled={bulkEstadoLoading}
              options={ESTADO_ORDEN.map(e => ({ value: e, label: estadoMeta(e).label }))}
            />
            <button
              onClick={applyBulkEstado}
              disabled={bulkEstadoLoading || !bulkEstado}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
              style={{
                background: "var(--color-cq-accent, #2563eb)", color: "#fff", border: "none",
                cursor:  bulkEstadoLoading || !bulkEstado ? "not-allowed" : "pointer",
                opacity: bulkEstadoLoading || !bulkEstado ? 0.5 : 1,
              }}
            >
              {bulkEstadoLoading ? "Aplicando…" : "Aplicar"}
            </button>
          </div>

          <button
            onClick={() => setSelected(new Set())}
            disabled={bulkEstadoLoading}
            className="ml-auto text-[12px] font-semibold"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-cq-muted, #64748b)" }}
          >
            Limpiar selección
          </button>
        </div>
      )}

      {/* ── Tabla ────────────────────────────────────────────── */}
      <div className={`transition-opacity duration-150 ${loading ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-cq-border, #e2e8f0)", background: "var(--color-cq-surface-2, #fafafa)" }}>
                <th className="pl-5 pr-3 py-3 w-10">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600"
                    checked={selected.size === pedidos.length && pedidos.length > 0}
                    onChange={toggleAll} />
                </th>
                {["Pedido","Cliente","Estado","Pago","Envío","Fecha","Total"].map((h, i) => (
                  <th key={h}
                    className={`px-4 py-3 text-[10px] font-bold tracking-widest uppercase ${i === 6 ? "text-right pr-5" : "text-left"}`}
                    style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted, #64748b)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: "var(--color-cq-surface-2, #f1f5f9)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}>
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                    </div>
                    <p className="text-[13px] font-medium"
                      style={{ color: "var(--color-cq-muted, #64748b)", fontFamily: "var(--font-body, sans-serif)" }}>
                      {q || estado || metodo ? "No se encontraron pedidos con esos filtros" : "Todavía no hay pedidos"}
                    </p>
                    {(q || estado || metodo) && (
                      <button
                        onClick={() => {
                          setQ(""); setEstado(""); setMetodo(""); setPage(1);
                          void fetchData({ q: "", estado: "", metodo: "", page: 1 });
                        }}
                        className="text-[12px] font-semibold"
                        style={{ color: "var(--color-cq-accent, #2563eb)", fontFamily: "var(--font-mono, monospace)", background: "none", border: "none", cursor: "pointer" }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                </td></tr>
              ) : pedidos.map(p => (
                <PedidoTableRow
                  key={p.id}
                  p={p}
                  selected={selected.has(p.id)}
                  onToggle={() => toggleSelect(p.id)}
                  onOpen={() => setDetalleId(p.id)}
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

      <ModalPedido
        pedidoId={detalleId}
        onClose={cerrarDetalle}
        onUpdated={patchLocal}
      />
    </>
  );
}
