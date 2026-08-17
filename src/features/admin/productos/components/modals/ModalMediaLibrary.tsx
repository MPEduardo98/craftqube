// app/admin/productos/components/modals/ModalMediaLibrary.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { resolveImageUrl } from "@/features/media/lib/resolveImageUrl";

export interface MediaItem {
  url:     string;
  nombre:  string;
  tipo:    string;
  tamaño?: number;
  key?:    string;
}

export interface MediaFolder {
  prefix: string;
  nombre: string;
}

interface Props {
  onSelect:    (items: MediaItem[]) => void;
  onClose:     () => void;
  productoId?: number;
  multiple?:   boolean;
  /** Carpeta inicial del explorador. Ej: "categorias/". */
  initialPrefix?: string;
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
          value ? "" : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
        }`}
        style={value ? {
          borderColor: "var(--color-cq-accent)",
          background:  "var(--color-cq-accent-glow)",
          color:       "var(--color-cq-accent)",
        } : undefined}
      >
        {current ? current.label : label}
        <svg className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50" style={{ minWidth: 140 }}>
          {value && (
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 border-b border-slate-100">
              Limpiar
            </button>
          )}
          {options.map((o) => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition ${
                o.value === value ? "font-semibold" : "text-slate-600"
              }`}
              style={o.value === value ? { color: "var(--color-cq-accent)" } : undefined}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModalMediaLibrary({ onSelect, onClose, multiple = true, initialPrefix = "" }: Props) {
  const [prefix,     setPrefix]     = useState(initialPrefix);
  const [items,      setItems]      = useState<MediaItem[]>([]);
  const [folders,    setFolders]    = useState<MediaFolder[]>([]);
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
  const [error,      setError]      = useState("");

  // Crear carpeta
  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  // Renombrar
  const [renaming,    setRenaming]    = useState<MediaItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameBusy,  setRenameBusy]  = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Cargar el nivel actual ─────────────────────────────── */
  const cargar = useCallback((pfx: string) => {
    setLoading(true);
    setError("");
    fetch(`/api/admin/media?prefix=${encodeURIComponent(pfx)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setItems(j.data.files);
          setFolders(j.data.folders);
        } else {
          setError(j.error ?? "Error al cargar archivos");
        }
      })
      .catch(() => setError("Error de conexión"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { cargar(prefix); }, [prefix, cargar]);

  const navegarA = (nuevoPrefix: string) => {
    setSelected(new Set());
    setSearch("");
    setPrefix(nuevoPrefix);
  };

  /* ── Subida (a la carpeta actual) ───────────────────────── */
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    const just: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("prefix", prefix);
        const res  = await fetch("/api/admin/media", { method: "POST", body: fd });
        const json = await res.json();
        if (json.success && json.data) {
          setItems((prev) => [json.data, ...prev]);
          just.push(json.data.url);
        } else {
          setError(json.error ?? "Error al subir el archivo");
        }
      }
      if (just.length) {
        setNewUrls(new Set(just));
        setTimeout(() => setNewUrls(new Set()), 3000);
      }
    } finally { setUploading(false); }
  }, [prefix]);

  /* ── Crear carpeta ──────────────────────────────────────── */
  const handleCreateFolder = async () => {
    const nombre = folderName.trim();
    if (!nombre) return;
    setError("");
    try {
      const res = await fetch("/api/admin/media", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ prefix, nombre }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Error al crear la carpeta"); return; }
      setFolders((prev) => [...prev, json.data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setFolderName("");
      setFolderOpen(false);
    } catch {
      setError("Error de conexión");
    }
  };

  /* ── Renombrar archivo ──────────────────────────────────── */
  const handleRename = async () => {
    if (!renaming) return;
    const nuevo = renameValue.trim();
    if (!nuevo || nuevo === renaming.nombre) { setRenaming(null); return; }

    setRenameBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/media/rename", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url: renaming.url, nuevoNombre: nuevo }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Error al renombrar"); return; }

      const viejaUrl = renaming.url;
      setItems((prev) => prev.map((i) =>
        i.url === viejaUrl
          ? { ...i, url: json.data.url, nombre: json.data.nombre, key: json.data.key }
          : i
      ));
      // Mantener la selección apuntando al archivo renombrado.
      setSelected((prev) => {
        if (!prev.has(viejaUrl)) return prev;
        const next = new Set(prev);
        next.delete(viejaUrl);
        next.add(json.data.url);
        return next;
      });
      setRenaming(null);
    } catch {
      setError("Error de conexión");
    } finally {
      setRenameBusy(false);
    }
  };

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

  const foldersFiltrados = search
    ? folders.filter((f) => f.nombre.toLowerCase().includes(search.toLowerCase()))
    : folders;

  // Breadcrumb: raíz + cada segmento acumulado.
  const segmentos = prefix.split("/").filter(Boolean);
  const migas = segmentos.map((seg, i) => ({
    nombre: seg,
    prefix: `${segmentos.slice(0, i + 1).join("/")}/`,
  }));

  const vacio = foldersFiltrados.length === 0 && filtered.length === 0;

  return createPortal(
    // admin-shell: el modal vive en un portal fuera del <main>, así que
    // necesita la clase para heredar el remap de tema oscuro.
    <div className="admin-shell fixed inset-0 z-[1000] flex items-center justify-center p-4">
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

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-slate-100 shrink-0 text-xs overflow-x-auto">
          <button type="button" onClick={() => navegarA("")}
            className={`px-2 py-1 rounded-md whitespace-nowrap transition ${
              prefix === "" ? "text-slate-700 font-semibold" : "hover:bg-[var(--color-cq-accent-glow)]"
            }`}
            style={prefix === "" ? undefined : { color: "var(--color-cq-accent)" }}>
            Todos los archivos
          </button>
          {migas.map((m, i) => (
            <span key={m.prefix} className="flex items-center gap-1 shrink-0">
              <span className="text-slate-300">/</span>
              <button type="button" onClick={() => navegarA(m.prefix)}
                className={`px-2 py-1 rounded-md whitespace-nowrap transition ${
                  i === migas.length - 1 ? "text-slate-700 font-semibold" : "hover:bg-[var(--color-cq-accent-glow)]"
                }`}
                style={i === migas.length - 1 ? undefined : { color: "var(--color-cq-accent)" }}>
                {m.nombre}
              </button>
            </span>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en esta carpeta…"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none cq-focus-accent transition"
            />
          </div>

          <Dropdown label="Tipo"   value={filterTipo} options={tipoOptions} onChange={setFilterTipo} />
          <Dropdown label="Tamaño" value={filterSize} options={sizeOptions} onChange={setFilterSize} />
          <Dropdown label="Orden"  value={sort}       options={SORT_OPTIONS} onChange={setSort} />

          {hasFilters && (
            <button type="button" onClick={() => { setFilterTipo(""); setFilterSize(""); setSort(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 transition whitespace-nowrap">
              Limpiar
            </button>
          )}

          <div className="ml-auto flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
            <button type="button" onClick={() => setView("grid")}
              className={`p-1.5 rounded-md transition ${view === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button type="button" onClick={() => setView("list")}
              className={`p-1.5 rounded-md transition ${view === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Upload zone — siempre visible, fuera del scroll */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed rounded-xl transition ${
              dragActive ? "" : "border-slate-200 cq-hover-border-accent hover:bg-slate-50/50"
            }`}
            style={dragActive ? {
              borderColor: "var(--color-cq-accent)",
              background:  "var(--color-cq-accent-glow)",
            } : undefined}
          >
            {dragActive ? (
              <div className="flex items-center justify-center gap-2 py-4 pointer-events-none select-none">
                <svg className="w-5 h-5" style={{ color: "var(--color-cq-accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-sm font-medium" style={{ color: "var(--color-cq-accent)" }}>Suelta los archivos aquí</p>
              </div>
            ) : uploading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <svg className="w-4 h-4 animate-spin" style={{ color: "var(--color-cq-accent)" }} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <p className="text-sm text-slate-500">Subiendo imágenes…</p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-4 py-4 flex-wrap">
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-700 cq-hover-border-accent transition shadow-sm">
                  Subir archivo
                </button>

                {/* Crear carpeta */}
                <div className="relative">
                  <button type="button" onClick={() => setFolderOpen((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-700 cq-hover-border-accent transition shadow-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v4M10 13h4" />
                    </svg>
                    Nueva carpeta
                  </button>
                  {folderOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white border border-slate-200 rounded-xl shadow-2xl p-3" style={{ width: "290px", zIndex: 9999 }}>
                      <p className="text-xs font-medium text-slate-600 mb-2">
                        Nueva carpeta en <span className="font-mono text-slate-400">{prefix || "raíz"}</span>
                      </p>
                      <div className="flex gap-2">
                        <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); handleCreateFolder(); }
                            if (e.key === "Escape") { setFolderOpen(false); setFolderName(""); }
                          }}
                          placeholder="categorias"
                          className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none cq-focus-accent transition placeholder:text-slate-300"
                          autoFocus />
                        <button type="button" onClick={handleCreateFolder}
                          className="px-3 py-2 text-xs font-medium cq-btn-accent text-white rounded-lg transition">
                          Crear
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400">Arrastra y suelta o</p>
                <div className="relative">
                  <button type="button" onClick={() => setLinkOpen((v) => !v)}
                    className="flex items-center gap-1 text-xs font-medium cq-link-accent transition">
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
                          className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none cq-focus-accent transition placeholder:text-slate-300"
                          autoFocus />
                        <button type="button" onClick={handleLinkAdd}
                          className="px-3 py-2 text-xs font-medium cq-btn-accent text-white rounded-lg transition">
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

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
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
          ) : vacio ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-400">
                {items.length === 0 && folders.length === 0 ? "Esta carpeta está vacía." : "Sin resultados."}
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="flex flex-wrap -mx-1 pt-2">
              {/* Carpetas primero */}
              {foldersFiltrados.map((f) => (
                <div key={f.prefix} className="px-1 pb-2" style={{ width: "16.666%" }}>
                  <button type="button" onDoubleClick={() => navegarA(f.prefix)} onClick={() => navegarA(f.prefix)}
                    className="relative block w-full rounded-xl overflow-hidden border-2 border-transparent cq-hover-border-accent transition"
                    style={{ paddingBottom: "100%", background: "var(--color-cq-surface-2, #f1f5f9)" }}
                    title={f.nombre}
                  >
                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                      </svg>
                    </span>
                  </button>
                  <p className="text-[9px] text-slate-600 font-medium truncate mt-0.5">{f.nombre}</p>
                </div>
              ))}

              {filtered.map((item) => {
                const checked = selected.has(item.url);
                const isNew   = newUrls.has(item.url);
                const src = resolveImageUrl(item.url, undefined) ?? undefined;
                return (
                  <div key={item.url} className="px-1 pb-2" style={{ width: "16.666%" }}>
                    <div className="relative group">
                      <button type="button" onClick={() => toggle(item.url)}
                        className={`relative block w-full rounded-xl overflow-hidden border-2 transition ${
                          checked ? "" : isNew ? "border-emerald-400" : "border-transparent hover:border-slate-300"
                        }`}
                        style={{
                          paddingBottom: "100%",
                          background: "var(--color-cq-surface-2, #f1f5f9)",
                          ...(checked ? { borderColor: "var(--color-cq-accent)" } : null),
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={item.nombre}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {checked && (
                          <span style={{ position: "absolute", top: 6, left: 6, width: 18, height: 18, borderRadius: 5, background: "var(--color-cq-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </button>

                      {/* Renombrar */}
                      {item.key && (
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); setRenaming(item); setRenameValue(item.nombre); }}
                          title="Renombrar"
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-white/90 border border-slate-200 items-center justify-center text-slate-500 cq-hover-text-accent transition hidden group-hover:flex">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: 9, color: "var(--color-cq-muted, #64748b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{item.nombre}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 pt-1">
              {foldersFiltrados.map((f) => (
                <button key={f.prefix} type="button" onClick={() => navegarA(f.prefix)}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg transition text-left hover:bg-slate-50">
                  <span className="w-5 h-5 shrink-0" />
                  <svg className="w-10 h-10 p-2 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{f.nombre}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Carpeta</p>
                  </div>
                </button>
              ))}

              {filtered.map((item) => {
                const checked = selected.has(item.url);
                const src = resolveImageUrl(item.url, undefined) ?? undefined;
                return (
                  <div key={item.url}
                    className={`flex items-center gap-3 py-2.5 px-2 rounded-lg transition ${checked ? "" : "hover:bg-slate-50"}`}
                    style={checked ? { background: "var(--color-cq-accent-glow)" } : undefined}>
                    <button type="button" onClick={() => toggle(item.url)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${checked ? "" : "border-slate-300"}`}
                        style={checked ? { background: "var(--color-cq-accent)", borderColor: "var(--color-cq-accent)" } : undefined}>
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
                    {item.key && (
                      <button type="button" onClick={() => { setRenaming(item); setRenameValue(item.nombre); }}
                        title="Renombrar"
                        className="shrink-0 w-7 h-7 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 cq-hover-text-accent cq-hover-border-accent transition">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 shrink-0">
          <p className="text-xs text-slate-400">
            {selected.size > 0
              ? `${selected.size} seleccionada${selected.size > 1 ? "s" : ""}`
              : `${foldersFiltrados.length ? `${foldersFiltrados.length} carpeta${foldersFiltrados.length !== 1 ? "s" : ""} · ` : ""}${filtered.length} archivo${filtered.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              Cancelar
            </button>
            <button type="button" onClick={() => onSelect(items.filter((i) => selected.has(i.url)))} disabled={selected.size === 0}
              className="px-5 py-2 text-sm font-semibold cq-btn-accent text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition">
              Listo
            </button>
          </div>
        </div>

        {/* Renombrar — capa propia sobre el gestor */}
        {renaming && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px]"
            onClick={() => !renameBusy && setRenaming(null)}>
            <div className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-sm flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}>
              <p className="text-sm font-semibold text-slate-800">Renombrar archivo</p>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")  { e.preventDefault(); handleRename(); }
                  if (e.key === "Escape") setRenaming(null);
                }}
                disabled={renameBusy}
                autoFocus
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none cq-focus-accent transition"
              />
              <p className="text-[11px] text-slate-400">
                Si el archivo ya se usa en productos o categorías, las referencias se actualizan solas.
              </p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRenaming(null)} disabled={renameBusy}
                  className="px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="button" onClick={handleRename} disabled={renameBusy || !renameValue.trim()}
                  className="px-4 py-1.5 text-xs font-semibold cq-btn-accent text-white rounded-lg disabled:opacity-40 transition">
                  {renameBusy ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
