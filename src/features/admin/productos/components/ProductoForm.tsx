// app/admin/productos/components/ProductoForm.tsx
"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  slugify, emptyVariante, emptyEnvio,
  type ProductoFormData,
  type VarianteForm,
  type ImagenForm,
  type MetacampoForm,
  type EnvioForm,
  type Categoria,
  type Marca,
  inputCls,
} from "./producto-form-types";

import { SectionCard, Field }  from "./producto-form-ui";
import { SeccionVariantes }    from "./sections/SeccionVariantes";
import { SeccionPrecios, type PricingHint } from "./sections/SeccionPrecios";
import { SeccionInventario }   from "./sections/SeccionInventario";
import { SeccionEnvio }        from "./sections/SeccionEnvio";
import { SeccionMultimedia }   from "./sections/multimedia/SeccionMultimedia";
import type { MediaItem }      from "./modals/ModalMediaLibrary";
import { SeccionSEO }          from "./sections/SeccionSEO";
import { SidebarProducto }     from "./SidebarProducto";
import { EditorDescripcion }   from "./EditorDescripcion";
import { ModalUnsavedChanges } from "@/shared/components/ui/ModalUnsavedChanges";
import { useAlert }            from "@/shared/context/AlertContext";
import { useUnsavedChanges }   from "@/shared/hooks/useUnsavedChanges";

export type { ProductoFormData, VarianteForm, ImagenForm, MetacampoForm, EnvioForm, Categoria, Marca };

interface Props {
  initialData?: Partial<ProductoFormData>;
  categorias:   Categoria[];
  marcas:       Marca[];
  mode:         "crear" | "editar";
  pricing?:     PricingHint;
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
    envio:      (initialData?.envio       as EnvioForm)       ?? emptyEnvio(),
  };
}

export function ProductoForm({ initialData, categorias, marcas, mode, pricing }: Props) {
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

  const { showModal, confirmLeave, cancelLeave } = useUnsavedChanges(isDirty);

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

  // Helper: reemplaza una lista anidada (atributos | metacampos) de la variante i
  const setVarianteLista = <K extends "atributos" | "metacampos">(
    i: number, key: K, list: VarianteForm[K],
  ) => set("variantes", form.variantes.map((vr, idx) => idx === i ? { ...vr, [key]: list } : vr));

  /* Atributos por variante (Color, Talla, …) */
  const addVarAtributo    = (i: number) =>
    setVarianteLista(i, "atributos", [...form.variantes[i].atributos, { nombre: "", valor: "" }]);
  const removeVarAtributo = (i: number, ai: number) =>
    setVarianteLista(i, "atributos", form.variantes[i].atributos.filter((_, idx) => idx !== ai));
  const changeVarAtributo = (i: number, ai: number, k: "nombre" | "valor", v: string) =>
    setVarianteLista(i, "atributos", form.variantes[i].atributos.map((a, idx) => idx === ai ? { ...a, [k]: v } : a));

  /* Metacampos por variante */
  const addVarMetacampo    = (i: number) =>
    setVarianteLista(i, "metacampos", [...form.variantes[i].metacampos, { llave: "", valor: "" }]);
  const removeVarMetacampo = (i: number, mi: number) =>
    setVarianteLista(i, "metacampos", form.variantes[i].metacampos.filter((_, idx) => idx !== mi));
  const changeVarMetacampo = (i: number, mi: number, k: "llave" | "valor", v: string) =>
    setVarianteLista(i, "metacampos", form.variantes[i].metacampos.map((m, idx) => idx === mi ? { ...m, [k]: v } : m));

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

  /* ── Envío (a nivel producto) ──────────────────────────── */
  const setEnvio = (k: keyof EnvioForm, v: string | boolean) =>
    set("envio", { ...form.envio, [k]: v });

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

  const isProcessing  = saving || deleting;
  /* En "crear" el form arranca limpio pero siempre debe poder enviarse. */
  const canSubmit     = !isProcessing && (mode === "crear" || isDirty);
  const storeSlug     = form.slug ? `/producto/${form.slug}` : null;
  const baseIndex     = Math.max(0, form.variantes.findIndex((v) => v.es_default));
  const baseVariante  = form.variantes[baseIndex] ?? form.variantes[0];

  /* ── Render ────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate style={{ position: "relative" }}>
      {showModal && (
        <ModalUnsavedChanges onConfirm={confirmLeave} onCancel={cancelLeave} />
      )}

      {/* ── Header (sticky: la barra de acciones siempre visible) ── */}
      <div
        className="flex items-center justify-between gap-4 mb-6"
        style={{
          position:     "sticky",
          top:          0,
          zIndex:       30,
          background:   "var(--color-cq-bg, #f8fafc)",
          borderBottom: "1px solid var(--color-cq-border)",
          /* Sangra el padding del contenedor para cubrir todo el ancho */
          margin:       "-1.5rem -1.5rem 1.5rem",
          padding:      "1rem 1.5rem",
        }}
      >
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
              disabled={isProcessing}
              className="rounded-lg px-3 py-2 text-sm transition-colors"
              style={{
                border:     "1px solid",
                borderColor: confirmDelete ? "rgba(239,68,68,0.5)" : "var(--color-cq-border)",
                color:       confirmDelete ? "#EF4444" : "var(--color-cq-muted)",
                background:  confirmDelete ? "rgba(239,68,68,0.07)" : "transparent",
                cursor:      isProcessing ? "not-allowed" : "pointer",
                opacity:     isProcessing ? 0.7 : 1,
              }}
            >
              {deleting
              ? "Eliminando…"
              : confirmDelete
                ? "¿Confirmar eliminación?"
                : "Eliminar"}
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={
              canSubmit
                ? { background: "var(--color-cq-accent)", color: "#fff", border: "none", cursor: "pointer", opacity: 1 }
                : {
                    background: "var(--color-cq-border)",
                    color:      "var(--color-cq-muted)",
                    border:     "none",
                    cursor:     "not-allowed",
                    opacity:    saving ? 0.7 : 1,
                  }
            }
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Guardando…
              </span>
            ) : mode === "crear" ? (
              "Crear producto"
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex gap-6 items-start">
        {/* Columna principal */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Información básica */}
          <SectionCard title="Información básica">
            <div className="flex flex-col gap-5">
            <Field label="Título *">
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => handleTitulo(e.target.value)}
                placeholder="Nombre del producto"
                className={inputCls}
              />
            </Field>
            <EditorDescripcion
                value={form.descripcion}
                onChange={(v) => set("descripcion", v)}
              />
            </div>
          </SectionCard>

          {/* 2. Multimedia */}
          <SeccionMultimedia
            imagenes={form.imagenes}
            productoId={form.id}
            onAdd={addImagenes}
            onRemove={removeImagen}
            onChangeAlt={changeAlt}
            onReorder={reorderImagenes}
          />

          {/* 3-4. Precios / Inventario del producto (variante base) — siempre
                  visibles. Las variantes adicionales se editan en su tabla. */}
          <SeccionPrecios
            variante={baseVariante}
            onChange={(k, v) => handleVarianteChange(baseIndex, k, v)}
            pricing={pricing}
          />
          <SeccionInventario
            variante={baseVariante}
            onChange={(k, v) => handleVarianteChange(baseIndex, k, v)}
          />

          {/* 5. Envío — SIEMPRE a nivel producto (mismas dimensiones para todas
                 las variantes). */}
          <SeccionEnvio envio={form.envio} onChange={setEnvio} />

          {/* 6. Variantes adicionales (sin la base) */}
          <SeccionVariantes
            variantes={form.variantes}
            productoId={form.id}
            onChange={handleVarianteChange}
            onAdd={addVariante}
            onRemove={removeVariante}
            pricing={pricing}
            onAddAtributo={addVarAtributo}
            onRemoveAtributo={removeVarAtributo}
            onChangeAtributo={changeVarAtributo}
            onAddMetacampo={addVarMetacampo}
            onRemoveMetacampo={removeVarMetacampo}
            onChangeMetacampo={changeVarMetacampo}
          />

          {/* 7. Especificaciones */}
          <SectionCard
            title="Especificaciones"
            action={
              <button
                type="button"
                onClick={addMetacampo}
                className="text-sm"
                style={{
                  color: "var(--color-cq-accent)", background: "none",
                  border: "none", cursor: "pointer", padding: 0,
                  fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.06em",
                }}
              >
                + Agregar especificación
              </button>
            }
          >
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
                    flexShrink: 0, width: "32px", height: "32px", borderRadius: "8px",
                    border: "1px solid var(--color-cq-border)", background: "transparent",
                    color: "var(--color-cq-muted)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </SectionCard>

          {/* 8. SEO */}
          <SeccionSEO
            slug={form.slug}
            meta_titulo={form.meta_titulo}
            meta_descripcion={form.meta_descripcion}
            tituloFallback={form.titulo}
            descripcionFallback={form.descripcion}
            onMetaTitulo={(v) => set("meta_titulo", v)}
            onMetaDescripcion={(v) => set("meta_descripcion", v)}
          />
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