// app/admin/productos/components/SidebarProducto.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { SectionCard, Field } from "./producto-form-ui";
import { inputCls, type Categoria, type Marca } from "./producto-form-types";
import { ModalCrearMarca } from "./modals/ModalCrearMarca";
import { ModalCrearCategoria } from "./modals/ModalCrearCategoria";

/* ── MarcaSelector ─────────────────────────────────────────── */
function MarcaSelector({
  all,
  value,
  onChange,
}: {
  all:      Marca[];
  value:    string;
  onChange: (id: string) => void;
}) {
  const [open,    setOpen]    = useState(false);
  const [search,  setSearch]  = useState("");
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef    = useRef<HTMLDivElement>(null);

  const recalcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
  }, []);

  const handleOpen = () => { recalcPos(); setOpen((v) => !v); setSearch(""); };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", recalcPos, true);
    window.addEventListener("resize", recalcPos);
    return () => { window.removeEventListener("scroll", recalcPos, true); window.removeEventListener("resize", recalcPos); };
  }, [open, recalcPos]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const t = e.target as Node;
      if (dropRef.current && !dropRef.current.contains(t) && triggerRef.current && !triggerRef.current.contains(t)) {
        setOpen(false); setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const filtered  = all.filter((m) => m.nombre.toLowerCase().includes(search.toLowerCase()));
  const selected  = all.find((m) => String(m.id) === value);

  const dropdown = open ? createPortal(
    <div
      ref={dropRef}
      style={{ position: "fixed", top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
      className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
    >
      {/* Búsqueda */}
      <div className="p-2 border-b border-slate-100">
        <input
          autoFocus
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar marca..."
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
        />
      </div>

      {/* Lista */}
      <div className="max-h-52 overflow-y-auto">
        {/* Opción "Sin marca" */}
        <button
          type="button"
          onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-slate-50 transition"
        >
          <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition ${
            value === "" ? "border-indigo-500 bg-indigo-500" : "border-slate-300"
          }`}>
            {value === "" && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </span>
          <span className={value === "" ? "text-slate-800 font-medium" : "text-slate-500 italic"}>
            Sin marca
          </span>
        </button>

        {filtered.length === 0 && search ? (
          <p className="text-xs text-slate-400 text-center py-4">Sin resultados</p>
        ) : (
          filtered.map((m) => {
            const checked = String(m.id) === value;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => { onChange(String(m.id)); setOpen(false); setSearch(""); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-slate-50 transition"
              >
                <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition ${
                  checked ? "border-indigo-500 bg-indigo-500" : "border-slate-300"
                }`}>
                  {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className={checked ? "text-slate-800 font-medium" : "text-slate-600"}>
                  {m.nombre}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={`${inputCls} text-left flex items-center justify-between gap-2`}
      >
        <span className={`truncate ${selected ? "text-slate-700" : "text-slate-300"}`}>
          {selected ? selected.nombre : "Sin marca"}
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
  const [open,    setOpen]    = useState(false);
  const [search,  setSearch]  = useState("");
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef    = useRef<HTMLDivElement>(null);

  const recalcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
  }, []);

  const handleOpen = () => { recalcPos(); setOpen((v) => !v); setSearch(""); };

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", recalcPos, true);
    window.addEventListener("resize", recalcPos);
    return () => { window.removeEventListener("scroll", recalcPos, true); window.removeEventListener("resize", recalcPos); };
  }, [open, recalcPos]);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const t = e.target as Node;
      if (dropRef.current && !dropRef.current.contains(t) && triggerRef.current && !triggerRef.current.contains(t)) {
        setOpen(false); setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const filtered = all.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const selectedNames = all.filter((c) => selected.includes(c.id)).map((c) => c.nombre);

  const dropdown = open ? createPortal(
    <div
      ref={dropRef}
      style={{ position: "fixed", top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
      className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
    >
      <div className="p-2 border-b border-slate-100">
        <input
          autoFocus type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar categoría..."
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
        />
      </div>

      <div className="max-h-52 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Sin resultados</p>
        ) : (
          filtered.map((cat) => {
            const checked = selected.includes(cat.id);
            return (
              <button key={cat.id} type="button" onClick={() => toggle(cat.id)}
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
                <span className={checked ? "text-slate-800 font-medium" : "text-slate-600"}>{cat.nombre}</span>
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      <button ref={triggerRef} type="button" onClick={handleOpen}
        className={`${inputCls} text-left flex items-center justify-between gap-2`}
      >
        <span className={`truncate ${selectedNames.length ? "text-slate-700" : "text-slate-300"}`}>
          {selectedNames.length ? selectedNames.join(", ") : "Seleccionar categorías..."}
        </span>
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
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
  estado, marca_id, categorias, marcas, todasCategorias,
  onEstado, onMarca, onCategorias,
}: Props) {
  // Marcas locales: parten de las del servidor y crecen al crear una nueva.
  const [localMarcas, setLocalMarcas] = useState<Marca[]>(marcas);
  const [marcaModalOpen, setMarcaModalOpen] = useState(false);

  const handleMarcaCreated = (marca: Marca) => {
    setLocalMarcas((prev) =>
      [...prev, marca].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    onMarca(String(marca.id)); // seleccionar la marca recién creada
  };

  // Categorías locales: igual que marcas, crecen al crear una nueva.
  const [localCategorias, setLocalCategorias] = useState<Categoria[]>(todasCategorias);
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);

  const handleCategoriaCreated = (categoria: Categoria) => {
    setLocalCategorias((prev) =>
      [...prev, categoria].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    onCategorias([...categorias, categoria.id]); // seleccionar la recién creada
  };

  return (
    <div className="space-y-5">

      <SectionCard title="Publicación">
        <div className="space-y-1">
          {ESTADOS.map((est) => (
            <label key={est}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition ${
                estado === est ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <input type="radio" name="estado" value={est} checked={estado === est}
                onChange={() => onEstado(est)} className="sr-only"
              />
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                est === "activo" ? "bg-emerald-400" : est === "inactivo" ? "bg-red-400" : "bg-amber-400"
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

      <SectionCard title="Organización">
        <div className="space-y-4">

          <Field label="Marca">
            <div className="flex items-stretch gap-2">
              <div className="flex-1 min-w-0">
                <MarcaSelector all={localMarcas} value={marca_id} onChange={onMarca} />
              </div>
              <button
                type="button"
                onClick={() => setMarcaModalOpen(true)}
                aria-label="Crear marca"
                title="Crear nueva marca"
                className="shrink-0 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition"
                style={{ width: "38px" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </Field>

          <Field label="Categorías">
            <div className="flex items-stretch gap-2">
              <div className="flex-1 min-w-0">
                <CategorySelector all={localCategorias} selected={categorias} onChange={onCategorias} />
              </div>
              <button
                type="button"
                onClick={() => setCategoriaModalOpen(true)}
                aria-label="Crear categoría"
                title="Crear nueva categoría"
                className="shrink-0 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition"
                style={{ width: "38px" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {categorias.length > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                {categorias.length} categoría{categorias.length !== 1 ? "s" : ""} seleccionada{categorias.length !== 1 ? "s" : ""}
              </p>
            )}
          </Field>

        </div>
      </SectionCard>

      <ModalCrearMarca
        open={marcaModalOpen}
        onClose={() => setMarcaModalOpen(false)}
        onCreated={handleMarcaCreated}
      />

      <ModalCrearCategoria
        open={categoriaModalOpen}
        onClose={() => setCategoriaModalOpen(false)}
        onCreated={handleCategoriaCreated}
      />

    </div>
  );
}