// app/admin/productos/components/ProductoForm.tsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  slugify, emptyVariante,
  type ProductoFormData,
  type VarianteForm,
  type ImagenForm,
  type MetacampoForm,
  type Categoria,
  type Marca,
  inputCls,
} from "./producto-form-types";

import { SectionCard, Field }  from "./producto-form-ui";
import { SeccionVariantes }    from "./sections/SeccionVariantes";
import { SeccionMultimedia }   from "./sections/multimedia/SeccionMultimedia";
import type { MediaItem }      from "./modals/ModalMediaLibrary";
import { SeccionSEO }          from "./sections/SeccionSEO";
import { SidebarProducto }     from "./SidebarProducto";
import { EditorDescripcion }   from "./EditorDescripcion";
import { LoadingOverlay }      from "@/app/global/components/ui/LoadingOverlay";
import { useAlert }            from "@/app/global/context/AlertContext";

export type { ProductoFormData, VarianteForm, ImagenForm, MetacampoForm, Categoria, Marca };

interface Props {
  initialData?: Partial<ProductoFormData>;
  categorias:   Categoria[];
  marcas:       Marca[];
  mode:         "crear" | "editar";
}

function buildInitialForm(initialData: Partial<ProductoFormData> | undefined, mode: "crear" | "editar"): ProductoFormData {
  return {
    id:               initialData?.id,
    titulo:           initialData?.titulo           ?? "",
    slug:             initialData?.slug             ?? "",
    estado:           initialData?.estado           ?? "borrador",
    marca_id:         initialData?.marca_id         ? String(initialData.marca_id) : "",
    descripcion:      initialData?.descripcion      ?? "",
    meta_titulo:      initialData?.meta_titulo      ?? "",
    meta_descripcion: initialData?.meta_descripcion ?? "",
    categorias:       initialData?.categorias       ?? [],
    variantes:        initialData?.variantes?.length
      ? (initialData.variantes as VarianteForm[])
      : [{ ...emptyVariante(), es_default: true }],
    imagenes:   (initialData?.imagenes   as ImagenForm[])   ?? [],
    metacampos: (initialData?.metacampos as MetacampoForm[]) ?? [],
  };
}

export function ProductoForm({ initialData, categorias, marcas, mode }: Props) {
  const router    = useRouter();
  const alert     = useAlert();
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimer                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initial = useMemo(() => buildInitialForm(initialData, mode), []);
  const [savedForm, setSavedForm] = useState<ProductoFormData>(initial);
  const [form,      setForm]      = useState<ProductoFormData>(initial);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm]
  );

  const set = useCallback(<K extends keyof ProductoFormData>(k: K, v: ProductoFormData[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  }, []);

  const handleTitulo = (val: string) => {
    set("titulo", val);
    if (mode === "crear") set("slug", slugify(val));
  };

  /* ── Variantes ─────────────────────────────────────────── */
  const handleVarianteChange = (i: number, k: keyof VarianteForm, v: string | boolean) => {
    const next = form.variantes.map((vr, idx) => {
      if (idx !== i) return k === "es_default" && v === true ? { ...vr, es_default: false } : vr;
      return { ...vr, [k]: v };
    });
    set("variantes", next);
  };
  const addVariante    = ()          => set("variantes", [...form.variantes, { ...emptyVariante() }]);
  const removeVariante = (i: number) => set("variantes", form.variantes.filter((_, idx) => idx !== i));

  /* ── Imágenes ──────────────────────────────────────────── */
  const addImagenes = (items: MediaItem[]) => {
    const nuevas: ImagenForm[] = items.map((item) => ({ url: item.url, alt: "", orden: 0 }));
    set("imagenes", [...form.imagenes, ...nuevas].map((img, i) => ({ ...img, orden: i })));
  };
  const removeImagen = (i: number) =>
    set("imagenes", form.imagenes.filter((_, idx) => idx !== i).map((img, o) => ({ ...img, orden: o })));
  const changeAlt = (i: number, alt: string) =>
    set("imagenes", form.imagenes.map((img, idx) => idx === i ? { ...img, alt } : img));
  const reorderImagenes = (from: number, to: number) => {
    const next = [...form.imagenes];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    set("imagenes", next.map((img, i) => ({ ...img, orden: i })));
  };

  /* ── Metacampos ────────────────────────────────────────── */
  const addMetacampo    = ()          => set("metacampos", [...form.metacampos, { llave: "", valor: "" }]);
  const removeMetacampo = (i: number) => set("metacampos", form.metacampos.filter((_, idx) => idx !== i));
  const changeMetacampo = (i: number, k: "llave" | "valor", v: string) =>
    set("metacampos", form.metacampos.map((m, idx) => idx === i ? { ...m, [k]: v } : m));

  /* ── Delete ────────────────────────────────────────────── */
  const handleDeleteClick = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    if (confirmTimer.current) clearTimeout(confirmTimer.current ?? undefined);
    setConfirmDelete(false);
    void handleDeleteConfirm();
  };

  const handleDeleteConfirm = async () => {
    if (!form.id) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/admin/productos/${form.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        alert.success("Producto eliminado correctamente");
        router.push("/admin/productos");
        router.refresh();
      } else {
        alert.error(json.error ?? "No se pudo eliminar el producto");
      }
    } catch {
      alert.error("Error de red al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Submit ────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.titulo.trim()) { alert.error("El título es obligatorio");           return; }
    if (!form.slug.trim())   { alert.error("El slug es obligatorio");             return; }
    if (form.variantes.length === 0) { alert.error("Debe haber al menos una variante"); return; }

    setSaving(true);
    try {
      const url    = mode === "crear" ? "/api/admin/productos" : `/api/admin/productos/${form.id}`;
      const method = mode === "crear" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let json: { success: boolean; error?: string; data?: { id: number } };
      try {
        json = await res.json();
      } catch {
        alert.error(`Error del servidor (HTTP ${res.status})`);
        return;
      }

      if (!json.success) {
        alert.error(json.error ?? "Error al guardar");
        return;
      }

      if (mode === "crear" && json.data?.id) {
        const newForm = { ...form, id: json.data.id };
        setForm(newForm);
        setSavedForm(newForm);
        alert.success("Producto creado correctamente");
        router.replace(`/admin/productos/${json.data.id}/editar`);
      } else {
        setSavedForm({ ...form });
        alert.success("Cambios guardados correctamente");
      }

      router.refresh();
    } catch {
      alert.error("Error de red al guardar");
    } finally {
      setSaving(false);
    }
  };

  const isProcessing = saving || deleting;
  const storeSlug    = form.slug ? `/producto/${form.slug}` : null;

  /* ── Render ────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate style={{ position: "relative" }}>
      <LoadingOverlay
        visible={isProcessing}
        message={deleting ? "Eliminando…" : "Guardando…"}
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-display" style={{ fontSize: "1.25rem", color: "var(--color-cq-text)" }}>
            {mode === "crear" ? "Nuevo producto" : "Editar producto"}
          </h1>
          {isDirty && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--color-cq-muted)", marginTop: 4 }}>
              Cambios sin guardar
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {storeSlug && (
            <a
              href={storeSlug}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: "1px solid var(--color-cq-border)", color: "var(--color-cq-muted)", textDecoration: "none" }}
            >
              Ver tienda ↗
            </a>
          )}
          {mode === "editar" && form.id && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="rounded-lg px-3 py-2 text-sm transition-colors"
              style={{
                border:     "1px solid",
                borderColor: confirmDelete ? "rgba(239,68,68,0.5)" : "var(--color-cq-border)",
                color:       confirmDelete ? "#EF4444" : "var(--color-cq-muted)",
                background:  confirmDelete ? "rgba(239,68,68,0.07)" : "transparent",
                cursor:      "pointer",
              }}
            >
              {confirmDelete ? "¿Confirmar eliminación?" : "Eliminar"}
            </button>
          )}
          <button
            type="submit"
            disabled={isProcessing}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{ background: "var(--color-cq-accent)", color: "#fff", border: "none", cursor: isProcessing ? "not-allowed" : "pointer", opacity: isProcessing ? 0.7 : 1 }}
          >
            {saving ? "Guardando…" : mode === "crear" ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex gap-6 items-start">
        {/* Columna principal */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Información básica */}
          <SectionCard title="Información básica">
            <Field label="Título *">
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => handleTitulo(e.target.value)}
                placeholder="Nombre del producto"
                className={inputCls}
              />
            </Field>
            <Field label="Slug *">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="url-del-producto"
                className={inputCls}
              />
            </Field>
            <Field label="Descripción">
              <EditorDescripcion
                value={form.descripcion}
                onChange={(v) => set("descripcion", v)}
              />
            </Field>
          </SectionCard>

          {/* Variantes */}
          <SeccionVariantes
            variantes={form.variantes}
            onChange={handleVarianteChange}
            onAdd={addVariante}
            onRemove={removeVariante}
          />

          {/* Multimedia */}
          <SeccionMultimedia
            imagenes={form.imagenes}
            productoId={form.id}
            onAdd={addImagenes}
            onRemove={removeImagen}
            onChangeAlt={changeAlt}
            onReorder={reorderImagenes}
          />

          {/* SEO */}
          <SeccionSEO
            slug={form.slug}
            meta_titulo={form.meta_titulo}
            meta_descripcion={form.meta_descripcion}
            tituloFallback={form.titulo}
            descripcionFallback={form.descripcion}
            onMetaTitulo={(v) => set("meta_titulo", v)}
            onMetaDescripcion={(v) => set("meta_descripcion", v)}
          />

          {/* Metacampos */}
          <SectionCard title="Metacampos">
            {form.metacampos.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={m.llave}
                  onChange={(e) => changeMetacampo(i, "llave", e.target.value)}
                  placeholder="Clave"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={m.valor}
                  onChange={(e) => changeMetacampo(i, "valor", e.target.value)}
                  placeholder="Valor"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeMetacampo(i)}
                  style={{
                    flexShrink:   0,
                    width:        "32px",
                    height:       "32px",
                    borderRadius: "8px",
                    border:       "1px solid var(--color-cq-border)",
                    background:   "transparent",
                    color:        "var(--color-cq-muted)",
                    cursor:       "pointer",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMetacampo}
              className="text-sm"
              style={{
                marginTop:  4,
                color:      "var(--color-cq-accent)",
                background: "none",
                border:     "none",
                cursor:     "pointer",
                padding:    0,
                fontFamily: "var(--font-mono)",
                fontSize:   "0.72rem",
                letterSpacing: "0.06em",
              }}
            >
              + Agregar metacampo
            </button>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div style={{ width: "320px", flexShrink: 0 }}>
          <SidebarProducto
            estado={form.estado}
            marca_id={form.marca_id}
            categorias={form.categorias}
            marcas={marcas}
            todasCategorias={categorias}
            onEstado={(v) => set("estado", v)}
            onMarca={(v) => set("marca_id", v)}
            onCategorias={(v) => set("categorias", v)}
          />
        </div>
      </div>
    </form>
  );
}