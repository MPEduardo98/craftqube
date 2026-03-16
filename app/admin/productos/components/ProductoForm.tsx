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
    id:                initialData?.id,
    titulo:            initialData?.titulo            ?? "",
    slug:              initialData?.slug              ?? "",
    estado:            initialData?.estado            ?? "borrador",
    marca_id:          initialData?.marca_id          ? String(initialData.marca_id) : "",
    descripcion_corta: initialData?.descripcion_corta ?? "",
    descripcion_larga: initialData?.descripcion_larga ?? "",
    meta_titulo:       initialData?.meta_titulo       ?? "",
    meta_descripcion:  initialData?.meta_descripcion  ?? "",
    categorias:        initialData?.categorias        ?? [],
    variantes:         initialData?.variantes?.length
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

  /* ── Setter genérico ───────────────────────────────────── */
  const set = useCallback(<K extends keyof ProductoFormData>(k: K, v: ProductoFormData[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  }, []);

  /* ── Título → auto-slug en modo crear ──────────────────── */
  const handleTitulo = (val: string) => {
    set("titulo", val);
    if (mode === "crear") set("slug", slugify(val));
  };

  /* ── Variantes ─────────────────────────────────────────── */
  const handleVarianteChange = (i: number, k: keyof VarianteForm, v: string | boolean) => {
    const next = form.variantes.map((vr, idx) => {
      if (idx !== i) return k === "es_default" && v === true ?
        { ...vr, es_default: false } : vr;
      return { ...vr, [k]: v };
    });
    set("variantes", next);
  };

  const addVariante = () => set("variantes", [...form.variantes, emptyVariante()]);

  const removeVariante = (i: number) => {
    if (form.variantes.length <= 1) return;
    const next = form.variantes.filter((_, idx) => idx !== i);
    if (!next.some((v) => v.es_default)) next[0].es_default = true;
    set("variantes", next);
  };

  /* ── Imágenes ──────────────────────────────────────────── */
  const addImagenes = (items: { url: string; nombre: string }[]) =>
    set("imagenes", [
      ...form.imagenes,
      ...items.map((item, idx) => ({
        url:   item.url,
        alt:   "",
        orden: form.imagenes.length + idx,
      })),
    ]);

  const removeImagen = (i: number) =>
    set("imagenes", form.imagenes.filter((_, idx) => idx !== i));

  const changeAlt = (i: number, alt: string) => {
    const next = [...form.imagenes];
    next[i] = { ...next[i], alt };
    set("imagenes", next);
  };

  const reorderImagenes = useCallback((from: number, to: number) => {
    setForm((prev) => {
      const next = [...prev.imagenes];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...prev, imagenes: next.map((img, idx) => ({ ...img, orden: idx })) };
    });
  }, []);

  /* ── Metacampos ────────────────────────────────────────── */
  const addMetacampo = () =>
    set("metacampos", [...form.metacampos, { llave: "", valor: "" }]);

  const removeMetacampo = (i: number) =>
    set("metacampos", form.metacampos.filter((_, idx) => idx !== i));

  const changeMetacampo = (i: number, k: keyof MetacampoForm, v: string) => {
    const next = [...form.metacampos];
    next[i] = { ...next[i], [k]: v };
    set("metacampos", next);
  };

  /* ── Descartar cambios ─────────────────────────────────── */
  const handleDiscard = () => {
    setForm(savedForm);
    alert.info("Cambios descartados");
  };

  /* ── Eliminar producto ─────────────────────────────────── */
  const handleDeleteClick = () => {
    if (!form.id) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    clearTimeout(confirmTimer.current ?? undefined);
    setConfirmDelete(false);
    void handleDeleteConfirm();
  };

  const handleDeleteConfirm = async () => {
    if (!form.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/productos/${form.id}`, { method: "DELETE" });
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
        mode="fixed"
      />

      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-start justify-between gap-3 mb-6 pb-5"
        style={{ borderBottom: "1px solid var(--color-cq-border)" }}
      >
        {/* Título + slug */}
        <div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize:   "1.25rem",
            fontWeight: 700,
            color:      "var(--color-cq-text)",
            margin:     0,
          }}>
            {mode === "crear" ? "Nuevo producto" : "Editar producto"}
          </h1>
          {form.slug && (
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize:   "0.68rem",
              color:      "var(--color-cq-muted)",
              marginTop:  "2px",
            }}>
              /producto/{form.slug}
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Ver en tienda */}
          {storeSlug && (
            <a
              href={storeSlug}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver en tienda"
              style={{
                display:        "inline-flex",
                alignItems:     "center",
                gap:            "6px",
                padding:        "7px 13px",
                borderRadius:   "8px",
                border:         "1px solid var(--color-cq-border)",
                background:     "transparent",
                color:          "var(--color-cq-muted)",
                fontFamily:     "var(--font-body)",
                fontSize:       "0.78rem",
                fontWeight:     500,
                cursor:         "pointer",
                textDecoration: "none",
                transition:     "all .15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-cq-text)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-border-2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-cq-muted)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-border)";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Ver en tienda
            </a>
          )}

          {/* Descartar — solo si hay cambios */}
          {isDirty && (
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isProcessing}
              style={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:          "6px",
                padding:      "7px 13px",
                borderRadius: "8px",
                border:       "1px solid var(--color-cq-border)",
                background:   "transparent",
                color:        "var(--color-cq-muted)",
                fontFamily:   "var(--font-body)",
                fontSize:     "0.78rem",
                fontWeight:   500,
                cursor:       "pointer",
                transition:   "all .15s",
                opacity:      isProcessing ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-cq-text)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-border-2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--color-cq-muted)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-border)";
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Descartar
            </button>
          )}

          {/* Eliminar — solo en modo editar */}
          {mode === "editar" && form.id && (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isProcessing}
              style={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:          "6px",
                padding:      "7px 13px",
                borderRadius: "8px",
                border:       `1px solid ${confirmDelete ? "rgba(239,68,68,0.4)" : "var(--color-cq-border)"}`,
                background:   confirmDelete ? "rgba(239,68,68,0.06)" : "transparent",
                color:        confirmDelete ? "#ef4444" : "var(--color-cq-muted)",
                fontFamily:   "var(--font-body)",
                fontSize:     "0.78rem",
                fontWeight:   confirmDelete ? 600 : 500,
                cursor:       "pointer",
                transition:   "all .15s",
                opacity:      isProcessing ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (!confirmDelete) {
                  (e.currentTarget as HTMLElement).style.color = "#ef4444";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.05)";
                }
              }}
              onMouseLeave={e => {
                if (!confirmDelete) {
                  (e.currentTarget as HTMLElement).style.color = "var(--color-cq-muted)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--color-cq-border)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              {confirmDelete ? "¿Confirmar?" : "Eliminar"}
            </button>
          )}

          {/* Guardar */}
          <button
            type="submit"
            disabled={isProcessing || (!isDirty && mode === "editar")}
            style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          "6px",
              padding:      "7px 16px",
              borderRadius: "8px",
              border:       "none",
              background:   isDirty || mode === "crear" ? "var(--color-cq-accent)" : "var(--color-cq-surface-2)",
              color:        isDirty || mode === "crear" ? "white" : "var(--color-cq-muted-2)",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.78rem",
              fontWeight:   600,
              cursor:       isProcessing || (!isDirty && mode === "editar") ? "not-allowed" : "pointer",
              transition:   "all .15s",
              opacity:      isProcessing ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (!isProcessing && (isDirty || mode === "crear")) {
                (e.currentTarget as HTMLElement).style.background = "var(--color-cq-accent-dim)";
              }
            }}
            onMouseLeave={e => {
              if (!isProcessing && (isDirty || mode === "crear")) {
                (e.currentTarget as HTMLElement).style.background = "var(--color-cq-accent)";
              }
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
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
            <Field label="Descripción corta">
              <textarea
                value={form.descripcion_corta}
                onChange={(e) => set("descripcion_corta", e.target.value)}
                placeholder="Resumen breve del producto"
                rows={3}
                className={inputCls}
                style={{ resize: "none" }}
              />
            </Field>
            <Field label="Descripción larga">
              <EditorDescripcion
                value={form.descripcion_larga}
                onChange={(v) => set("descripcion_larga", v)}
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
            meta_titulo={form.meta_titulo}
            meta_descripcion={form.meta_descripcion}
            slug={form.slug}
            onChange={(k, v) => set(k, v)}
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMetacampo}
              style={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:          "6px",
                padding:      "7px 13px",
                borderRadius: "8px",
                border:       "1px dashed var(--color-cq-border-2)",
                background:   "transparent",
                color:        "var(--color-cq-muted)",
                fontFamily:   "var(--font-body)",
                fontSize:     "0.78rem",
                cursor:       "pointer",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Agregar metacampo
            </button>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <SidebarProducto
          estado={form.estado}
          marca_id={form.marca_id}
          categorias={form.categorias}
          marcas={marcas}
          categoriasOpts={categorias}
          onEstado={(v) => set("estado", v)}
          onMarca={(v) => set("marca_id", v)}
          onCategorias={(v) => set("categorias", v)}
        />
      </div>
    </form>
  );
}