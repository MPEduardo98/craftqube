// app/admin/productos/components/modals/ModalMediaLibrary.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { buildImageSrc } from "../producto-form-types";

export interface MediaItem {
  url:     string;
  nombre:  string;
  tipo:    string;
  tamaño?: number;
}

interface Props {
  onSelect:    (items: MediaItem[]) => void;
  onClose:     () => void;
  productoId?: number;
  multiple?:   boolean;
}

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SORT_OPTIONS = [
  { value: "reciente", label: "Más reciente" },
  { value: "antiguo",  label: "Más antiguo"  },
  { value: "az",       label: "A → Z"        },
  { value: "za",       label: "Z → A"        },
  { value: "tamaño",   label: "Mayor tamaño" },
];

function Dropdown({ label, value, options, onChange }: {
  label:    string;
  value:    string;
  options:  { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition ${
          value ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
        }`}
      >
        {current ? current.label : label}
        <svg className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-max" style={{ zIndex: 9999 }}>
          {value && (
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-400 hover:bg-slate-50 transition border-b border-slate-100">
              Limpiar
            </button>
          )}
          {options.map((o) => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs whitespace-nowrap transition hover:bg-slate-50 ${
                value === o.value ? "text-indigo-600 font-semibold" : "text-slate-600"
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModalMediaLibrary({ onSelect, onClose, productoId, multiple = true }: Props) {
  const [items,      setItems]      = useState<MediaItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [uploading,  setUploading]  = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [view,       setView]       = useState<"grid" | "list">("grid");
  const [sort,       setSort]       = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterSize, setFilterSize] = useState("");
  const [linkOpen,   setLinkOpen]   = useState(false);
  const [linkUrl,    setLinkUrl]    = useState("");
  const [linkError,  setLinkError]  = useState("");
  const [newUrls,    setNewUrls]    = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((j) => { if (j.success) setItems(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!productoId) return;
    setUploading(true);
    const just: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("productoId", String(productoId));
        const res  = await fetch("/api/admin/media", { method: "POST", body: fd });
        const json = await res.json();
        if (json.success && json.data) {
          setItems((prev) => [json.data, ...prev]);
          just.push(json.data.url);
        }
      }
      if (just.length) {
        setNewUrls(new Set(just));
        setTimeout(() => setNewUrls(new Set()), 3000);
      }
    } finally { setUploading(false); }
  }, [productoId]);

  const handleLinkAdd = () => {
    setLinkError("");
    const url = linkUrl.trim();
    if (!url) return;
    try { new URL(url); } catch { setLinkError("URL no válida"); return; }
    const nombre = url.split("/").pop()?.split("?")[0] || "imagen";
    const ext    = nombre.includes(".") ? nombre.split(".").pop()!.toUpperCase() : "JPG";
    setItems((prev) => [{ url, nombre, tipo: ext }, ...prev]);
    setLinkUrl(""); setLinkOpen(false);
  };

  const toggle = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else { if (!multiple) next.clear(); next.add(url); }
      return next;
    });
  };

  const tipoOptions = Array.from(new Set(items.map((i) => i.tipo))).sort().map((t) => ({ value: t, label: t }));
  const sizeOptions = [
    { value: "small",  label: "< 500 KB"     },
    { value: "medium", label: "500 KB – 2 MB" },
    { value: "large",  label: "> 2 MB"        },
  ];

  let filtered = items.filter((i) => {
    if (search && !i.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTipo && i.tipo !== filterTipo) return false;
    if (filterSize === "small"  && (i.tamaño ?? 0) >= 500_000) return false;
    if (filterSize === "medium" && ((i.tamaño ?? 0) < 500_000 || (i.tamaño ?? 0) >= 2_000_000)) return false;
    if (filterSize === "large"  && (i.tamaño ?? 0) < 2_000_000) return false;
    return true;
  });
  if (sort === "az")     filtered = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
  if (sort === "za")     filtered = [...filtered].sort((a, b) => b.nombre.localeCompare(a.nombre));
  if (sort === "tamaño") filtered = [...filtered].sort((a, b) => (b.tamaño ?? 0) - (a.tamaño ?? 0));

  const hasFilters = !!filterTipo || !!filterSize || !!sort;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "min(900px, 100%)", height: "min(88vh, 740px)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Seleccionar archivo</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 shrink-0">
          {/* Búsqueda */}
          <div className="relative" style={{ flex: "1 1 160px", minWidth: 0 }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar archivos"
              className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-7 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <Dropdown label="Tipo de archivo"    value={filterTipo} options={tipoOptions}  onChange={setFilterTipo} />
          <Dropdown label="Tamaño del archivo" value={filterSize} options={sizeOptions}  onChange={setFilterSize} />
          <Dropdown label="Ordenar por"        value={sort}       options={SORT_OPTIONS} onChange={setSort} />
          {hasFilters && (
            <button type="button" onClick={() => { setFilterTipo(""); setFilterSize(""); setSort(""); }}
              className="text-xs text-indigo-500 hover:text-indigo-700 transition whitespace-nowrap">
              Limpiar
            </button>
          )}

          <div className="ml-auto flex items-center gap-1 shrink-0">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button type="button" onClick={() => setView("grid")}
                className={`p-1.5 transition ${view === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"}`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button type="button" onClick={() => setView("list")}
                className={`p-1.5 border-l border-slate-200 transition ${view === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Upload zone — siempre visible, fuera del scroll */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
          {productoId ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); }}
              className={`border-2 border-dashed rounded-xl transition ${
                dragActive ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"
              }`}
            >
              {dragActive ? (
                <div className="flex items-center justify-center gap-2 py-4 pointer-events-none select-none">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm font-medium text-indigo-600">Suelta los archivos aquí</p>
                </div>
              ) : uploading ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <svg className="w-4 h-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <p className="text-sm text-slate-500">Subiendo imágenes…</p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 py-4">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-indigo-300 transition shadow-sm">
                    Subir archivo
                  </button>
                  <p className="text-xs text-slate-400">Arrastra y suelta o</p>
                  <div className="relative">
                    <button type="button" onClick={() => setLinkOpen((v) => !v)}
                      className="flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      agregar desde URL
                    </button>
                    {linkOpen && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-2xl p-3" style={{ width: "300px", zIndex: 9999 }}>
                        <p className="text-xs font-medium text-slate-600 mb-2">Agregar imagen desde URL</p>
                        <div className="flex gap-2">
                          <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleLinkAdd(); if (e.key === "Escape") { setLinkOpen(false); setLinkUrl(""); } }}
                            placeholder="https://..."
                            className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
                            autoFocus />
                          <button type="button" onClick={handleLinkAdd}
                            className="px-3 py-2 text-xs font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                            Agregar
                          </button>
                        </div>
                        {linkError && <p className="text-xs text-red-500 mt-1.5">{linkError}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-amber-200 bg-amber-50 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700">Guarda el producto primero para poder subir imágenes.</p>
            </div>
          )}
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-4">
          {loading ? (
            <div className="flex flex-wrap -mx-1 pt-2">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="px-1 pb-2" style={{ width: "16.666%" }}>
                  <div className="bg-slate-100 animate-pulse rounded-xl" style={{ paddingBottom: "100%" }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-400">
                {items.length === 0 ? "No hay imágenes. Sube la primera." : "Sin resultados."}
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="flex flex-wrap -mx-1 pt-2">
              {filtered.map((item) => {
                const checked = selected.has(item.url);
                const isNew   = newUrls.has(item.url);
                const src     = buildImageSrc(item.url);
                return (
                  <div key={item.url} className="px-1 pb-2" style={{ width: "16.666%" }}>
                    <button type="button" onClick={() => toggle(item.url)}
                      className={`relative block w-full rounded-xl overflow-hidden border-2 transition ${
                        checked ? "border-indigo-500" : isNew ? "border-emerald-400" : "border-transparent hover:border-slate-300"
                      }`}
                      style={{ paddingBottom: "100%", background: "#f1f5f9" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={item.nombre}
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {checked && (
                        <span style={{ position: "absolute", top: 6, left: 6, width: 18, height: 18, borderRadius: 5, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                    <p style={{ fontSize: 9, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{item.nombre}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 pt-1">
              {filtered.map((item) => {
                const checked = selected.has(item.url);
                const src     = buildImageSrc(item.url);
                return (
                  <button key={item.url} type="button" onClick={() => toggle(item.url)}
                    className={`flex items-center gap-3 py-2.5 px-2 rounded-lg transition text-left ${checked ? "bg-indigo-50" : "hover:bg-slate-50"}`}>
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${checked ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}>
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={item.nombre} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 bg-slate-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{item.nombre}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">{item.tipo}{item.tamaño ? ` · ${formatBytes(item.tamaño)}` : ""}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 shrink-0">
          <p className="text-xs text-slate-400">
            {selected.size > 0 ? `${selected.size} seleccionada${selected.size > 1 ? "s" : ""}` : `${filtered.length} archivo${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              Cancelar
            </button>
            <button type="button" onClick={() => onSelect(items.filter((i) => selected.has(i.url)))} disabled={selected.size === 0}
              className="px-5 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition">
              Listo
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}