"use client";
// app/admin/productos/components/SidebarProducto.tsx
// ─────────────────────────────────────────────────────────────
// Sidebar derecho: estado de publicación, marca y selector de
// categorías con búsqueda + creación inline.
// Fix: dropdown usa position:fixed + createPortal para escapar
// el overflow:hidden del SectionCard padre.
// ─────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { SectionCard, Field } from "./producto-form-ui";
import { inputCls, slugify, type Categoria, type Marca } from "./producto-form-types";

/* ── CategorySelector ──────────────────────────────────────── */
function CategorySelector({
  all,
  selected,
  onChange,
}: {
  all:      Categoria[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [open,      setOpen]      = useState(false);
  const [search,    setSearch]    = useState("");
  const [creating,  setCreating]  = useState(false);
  const [newName,   setNewName]   = useState("");
  const [saving,    setSaving]    = useState(false);
  const [localAll,  setLocalAll]  = useState<Categoria[]>(all);
  const [createErr, setCreateErr] = useState("");
  const [dropPos,   setDropPos]   = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef    = useRef<HTMLDivElement>(null);

  /* Calcular posición del dropdown relativa al viewport */
  const recalcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropPos({
      top:   r.bottom + window.scrollY + 4,
      left:  r.left   + window.scrollX,
      width: r.width,
    });
  }, []);

  const handleOpen = () => {
    recalcPos();
    setOpen((v) => !v);
    setCreating(false);
    setSearch("");
  };

  /* Reposicionar al hacer scroll o resize */
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", recalcPos, true);
    window.addEventListener("resize", recalcPos);
    return () => {
      window.removeEventListener("scroll", recalcPos, true);
      window.removeEventListener("resize", recalcPos);
    };
  }, [open, recalcPos]);

  /* Cerrar al hacer click fuera */
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const t = e.target as Node;
      if (
        dropRef.current    && !dropRef.current.contains(t) &&
        triggerRef.current && !triggerRef.current.contains(t)
      ) {
        setOpen(false);
        setCreating(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const filtered = localAll.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: number) => {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  };

  const handleCreate = async () => {
    const nombre = newName.trim();
    if (!nombre) return;
    setSaving(true);
    setCreateErr("");
    try {
      const res  = await fetch("/api/admin/categorias", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ nombre, slug: slugify(nombre) }),
      });
      const json = await res.json();
      if (!json.success) {
        setCreateErr(json.error ?? "Error al crear categoría");
        return;
      }
      const nueva: Categoria = json.data;
      setLocalAll((prev) => [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      onChange([...selected, nueva.id]);
      setNewName("");
      setCreating(false);
    } catch {
      setCreateErr("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const selectedNames = localAll
    .filter((c) => selected.includes(c.id))
    .map((c) => c.nombre);

  /* ── Dropdown via portal (escapa overflow:hidden) ────────── */
  const dropdown = open ? createPortal(
    <div
      ref={dropRef}
      style={{
        position: "fixed",
        top:      dropPos.top,
        left:     dropPos.left,
        width:    dropPos.width,
        zIndex:   9999,
      }}
      className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
    >
      {/* Búsqueda */}
      <div className="p-2 border-b border-slate-100">
        <input
          autoFocus
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
        />
      </div>

      {/* Lista */}
      <div className="max-h-52 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Sin resultados</p>
        ) : (
          filtered.map((cat) => {
            const checked = selected.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggle(cat.id)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-slate-50 transition"
              >
                <span className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition ${
                  checked ? "border-indigo-500 bg-indigo-500" : "border-slate-300"
                }`}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={checked ? "text-slate-800 font-medium" : "text-slate-600"}>
                  {cat.nombre}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Footer: crear nueva categoría */}
      <div className="border-t border-slate-100 p-2">
        {!creating ? (
          <button
            type="button"
            onClick={() => { setCreating(true); setCreateErr(""); }}
            className="w-full text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1.5 flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva categoría
          </button>
        ) : (
          <div className="space-y-2">
            {createErr && (
              <p className="text-xs text-red-500 px-1">{createErr}</p>
            )}
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreate(); } }}
                placeholder="Nombre de categoría"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving || !newName.trim()}
                className="px-3 py-2 bg-indigo-500 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition"
              >
                {saving ? "…" : "Crear"}
              </button>
              <button
                type="button"
                onClick={() => { setCreating(false); setCreateErr(""); setNewName(""); }}
                className="px-3 py-2 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-50 transition"
              >
                ✕
              </button>
            </div>
            {newName.trim() && (
              <p className="text-xs text-slate-400 px-1">
                Slug: <span className="font-mono">{slugify(newName)}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  /* ── Trigger ──────────────────────────────────────────────── */
  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`${inputCls} text-left flex items-center justify-between gap-2`}
      >
        <span className={`truncate ${selectedNames.length ? "text-slate-700" : "text-slate-300"}`}>
          {selectedNames.length
            ? selectedNames.join(", ")
            : "Seleccionar categorías..."}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdown}
    </div>
  );
}

/* ── SidebarProducto ───────────────────────────────────────── */
interface Props {
  estado:          "activo" | "inactivo" | "borrador";
  marca_id:        string;
  categorias:      number[];
  marcas:          Marca[];
  todasCategorias: Categoria[];
  onEstado:        (v: "activo" | "inactivo" | "borrador") => void;
  onMarca:         (v: string) => void;
  onCategorias:    (v: number[]) => void;
}

const ESTADOS = ["activo", "inactivo", "borrador"] as const;

export function SidebarProducto({
  estado,
  marca_id,
  categorias,
  marcas,
  todasCategorias,
  onEstado,
  onMarca,
  onCategorias,
}: Props) {
  return (
    <div className="space-y-5">

      {/* Estado / Publicación */}
      <SectionCard title="Publicación">
        <div className="space-y-1">
          {ESTADOS.map((est) => (
            <label
              key={est}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition ${
                estado === est ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="estado"
                value={est}
                checked={estado === est}
                onChange={() => onEstado(est)}
                className="sr-only"
              />
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                est === "activo"   ? "bg-emerald-400" :
                est === "inactivo" ? "bg-red-400"     : "bg-amber-400"
              }`} />
              <span className="text-sm text-slate-700 capitalize">{est}</span>
              {estado === est && (
                <svg className="w-3.5 h-3.5 text-indigo-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Organización */}
      <SectionCard title="Organización">
        <div className="space-y-4">

          <Field label="Marca">
            <select
              value={marca_id}
              onChange={(e) => onMarca(e.target.value)}
              className={inputCls}
            >
              <option value="">Sin marca</option>
              {marcas.map((m) => (
                <option key={m.id} value={String(m.id)}>{m.nombre}</option>
              ))}
            </select>
          </Field>

          <Field label="Categorías">
            <CategorySelector
              all={todasCategorias}
              selected={categorias}
              onChange={onCategorias}
            />
            {categorias.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                {categorias.length} categoría{categorias.length !== 1 ? "s" : ""} seleccionada{categorias.length !== 1 ? "s" : ""}
              </p>
            )}
          </Field>

        </div>
      </SectionCard>

    </div>
  );
}