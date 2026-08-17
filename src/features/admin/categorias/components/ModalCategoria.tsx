// features/admin/categorias/components/ModalCategoria.tsx
// ─────────────────────────────────────────────────────────────
// Modal de crear/editar categoría. Usa el Modal global y
// POST/PUT /api/admin/categorias.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useEffect } from "react";
import { Modal }             from "@/shared/components/ui/Modal";
import { Loader }            from "@/shared/components/ui/Loader";
import { Dropdown }          from "@/shared/components/ui/Dropdown";
import { useAlert }          from "@/shared/context/AlertContext";
import { resolveImageUrl }   from "@/features/media/lib/resolveImageUrl";
import { ModalMediaLibrary } from "@/features/admin/productos/components/modals/ModalMediaLibrary";
import { inputCls, textareaCls, slugify } from "@/features/admin/productos/components/producto-form-types";
import type { CategoriaRow } from "../types";

interface Props {
  open:        boolean;
  onClose:     () => void;
  onSaved:     (categoria: CategoriaRow) => void;
  categoria?:  CategoriaRow | null;
  categorias:  CategoriaRow[];
}

export function ModalCategoria({ open, onClose, onSaved, categoria, categorias }: Props) {
  const alert = useAlert();
  const isEdit = !!categoria;

  const [nombre, setNombre]           = useState("");
  const [slug, setSlug]               = useState("");
  const [slugTocado, setSlugTocado]   = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen]           = useState("");
  const [parentId, setParentId]       = useState<string>("");
  const [saving, setSaving]           = useState(false);
  const [mediaOpen, setMediaOpen]     = useState(false);

  useEffect(() => {
    if (!open) return;
    setNombre(categoria?.nombre ?? "");
    setSlug(categoria?.slug ?? "");
    setSlugTocado(false);
    setDescripcion(categoria?.descripcion ?? "");
    setImagen(categoria?.imagen ?? "");
    setParentId(categoria?.parent_id ? String(categoria.parent_id) : "");
  }, [open, categoria]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const opcionesPadre = categorias.filter(c => c.id !== categoria?.id);

  const handleSave = async () => {
    const value = nombre.trim();
    if (!value) return;
    setSaving(true);
    try {
      const url    = isEdit ? `/api/admin/categorias/${categoria!.id}` : "/api/admin/categorias";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre:      value,
          slug:        slug.trim() || slugify(value),
          descripcion: descripcion.trim(),
          imagen:      imagen.trim(),
          parent_id:   parentId || null,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        alert.error(json.error ?? "Error al guardar la categoría");
        return;
      }
      onSaved({
        id:              json.data.id,
        nombre:          json.data.nombre,
        slug:            json.data.slug,
        descripcion:     json.data.descripcion,
        imagen:          json.data.imagen,
        parent_id:       json.data.parent_id,
        parent_nombre:   categorias.find(c => c.id === json.data.parent_id)?.nombre ?? null,
        total_productos: categoria?.total_productos ?? 0,
      });
      alert.success(isEdit ? "Categoría actualizada correctamente" : "Categoría creada correctamente");
      onClose();
    } catch {
      alert.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Editar categoría" : "Nueva categoría"}
      maxWidth="28rem"
      closeOnBackdrop={!saving}
      footer={saving ? undefined : (
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ background: "transparent", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-muted)", cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!nombre.trim()}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{
              background: "var(--color-cq-accent)",
              border:     "none",
              color:      "#fff",
              cursor:     !nombre.trim() ? "not-allowed" : "pointer",
              opacity:    !nombre.trim() ? 0.6 : 1,
            }}
          >
            {isEdit ? "Guardar cambios" : "Crear categoría"}
          </button>
        </>
      )}
    >
      {saving ? (
        <div className="py-6">
          <Loader text={isEdit ? "Guardando cambios…" : "Creando categoría…"} />
        </div>
      ) : (
      <>
        <label className="flex flex-col gap-1.5">
          <span className="cq-field-label">Nombre</span>
          <input
            autoFocus
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (!slugTocado) setSlug(slugify(e.target.value));
            }}
            placeholder="Ej. Herramientas"
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="cq-field-label">Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTocado(true); }}
            placeholder={slugify(nombre) || "slug-de-la-categoria"}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="cq-field-label">Descripción</span>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción opcional"
            rows={3}
            className={textareaCls}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="cq-field-label">Imagen</span>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
              style={{ background: "var(--color-cq-surface-2, #f1f5f9)", border: "1px solid var(--color-cq-border, #e2e8f0)" }}
            >
              {imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveImageUrl(imagen, undefined) ?? imagen} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-cq-muted, #64748b)" }}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                </svg>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setMediaOpen(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ background: "transparent", border: "1px solid var(--color-cq-border)", color: "var(--color-cq-text)", cursor: "pointer" }}
              >
                {imagen ? "Cambiar imagen" : "Seleccionar imagen"}
              </button>
              {imagen && (
                <button
                  type="button"
                  onClick={() => setImagen("")}
                  className="text-xs text-left transition-colors"
                  style={{ color: "var(--color-cq-muted)", cursor: "pointer" }}
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="cq-field-label">Categoría padre</span>
          <Dropdown
            value={parentId}
            onChange={setParentId}
            align="left"
            width={352}
            placeholder="Sin categoría padre"
            options={[
              { value: "", label: "Sin categoría padre" },
              ...opcionesPadre.map(c => ({ value: String(c.id), label: c.nombre })),
            ]}
            triggerClassName="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-normal transition-colors"
          />
        </label>

        <style>{`
          .cq-field-label {
            font-family: var(--font-mono);
            font-size: 0.68rem;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--color-cq-muted);
          }
        `}</style>
      </>
      )}
    </Modal>

    {mediaOpen && (
      <ModalMediaLibrary
        multiple={false}
        initialPrefix="categorias/"
        onSelect={(items) => {
          if (items[0]) setImagen(items[0].url);
          setMediaOpen(false);
        }}
        onClose={() => setMediaOpen(false)}
      />
    )}
    </>
  );
}
