"use client";
// app/admin/productos/components/ModalMediaLibrary.tsx
// ─────────────────────────────────────────────────────────────
// Modal para seleccionar archivos del servidor o subir nuevos.
// Llama a GET /api/admin/media para listar imágenes existentes.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { buildImageSrc } from "./producto-form-types";

/* ── Tipos ─────────────────────────────────────────────────── */
export interface MediaItem {
  url:      string;
  nombre:   string;
  tipo:     string;
  tamaño?:  number;
}

interface Props {
  onSelect:  (items: MediaItem[]) => void;
  onClose:   () => void;
  multiple?: boolean;
}

/* ── Helpers ───────────────────────────────────────────────── */
function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ext(nombre: string) {
  return nombre.split(".").pop()?.toUpperCase() ?? "";
}

/* ── Componente ────────────────────────────────────────────── */
export function ModalMediaLibrary({ onSelect, onClose, multiple = true }: Props) {
  const [items,      setItems]      = useState<MediaItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [uploading,  setUploading]  = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Cargar medios del servidor */
  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((j) => { if (j.success) setItems(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Subir archivo(s) */
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    setUploading(true);
    const arr = Array.from(files);
    try {
      for (const file of arr) {
        const fd = new FormData();
        fd.append("file", file);
        const res  = await fetch("/api/admin/media", { method: "POST", body: fd });
        const json = await res.json();
        if (json.success && json.data) {
          setItems((prev) => [json.data, ...prev]);
        }
      }
    } finally {
      setUploading(false);
    }
  }, []);

  /* Toggle selección */
  const toggle = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        if (!multiple) next.clear();
        next.add(url);
      }
      return next;
    });
  };

  /* Confirmar */
  const handleListo = () => {
    const elegidos = items.filter((i) => selected.has(i.url));
    onSelect(elegidos);
  };

  /* Drag & drop */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  };

  const filtered = items.filter((i) =>
    i.nombre.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Render ────────────────────────────────────────────── */
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Seleccionar archivo</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="px-6 py-3 border-b border-slate-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar archivos"
              className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* Zona upload + grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition ${
              dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />
            {uploading ? (
              <p className="text-sm text-slate-500">Subiendo...</p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition shadow-sm"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Agregar multimedia
                  </button>
                </div>
                <p className="text-xs text-slate-400">Arrastra y suelta imágenes, videos, modelos 3D y archivos</p>
              </>
            )}
          </div>

          {/* Grid de imágenes */}
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sin archivos</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filtered.map((item) => {
                const checked = selected.has(item.url);
                const src     = buildImageSrc(item.url);
                return (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => toggle(item.url)}
                    className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition ${
                      checked ? "border-indigo-500" : "border-transparent hover:border-slate-300"
                    } bg-slate-100`}
                  >
                    {/* Imagen */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />

                    {/* Checkbox */}
                    <span className={`absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      checked
                        ? "bg-indigo-500 border-indigo-500"
                        : "bg-white/80 border-slate-300 opacity-0 group-hover:opacity-100"
                    }`}>
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>

                    {/* Nombre + tipo */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-4 opacity-0 group-hover:opacity-100 transition">
                      <p className="text-white text-[10px] truncate leading-tight">{item.nombre}</p>
                      <p className="text-white/70 text-[9px] uppercase tracking-wide">{ext(item.nombre)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {selected.size > 0 ? `${selected.size} archivo${selected.size > 1 ? "s" : ""} seleccionado${selected.size > 1 ? "s" : ""}` : ""}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleListo}
              disabled={selected.size === 0}
              className="px-5 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Listo
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}