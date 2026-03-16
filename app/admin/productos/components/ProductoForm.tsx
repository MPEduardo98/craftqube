// app/admin/productos/components/ProductoForm.tsx
"use client";

import { useState, useCallback } from "react";
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

export type { ProductoFormData, VarianteForm, ImagenForm, MetacampoForm, Categoria, Marca };

interface Props {
  initialData?: Partial<ProductoFormData>;
  categorias:   Categoria[];
  marcas:       Marca[];
  mode:         "crear" | "editar";
}

export function ProductoForm({ initialData, categorias, marcas, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const [form, setForm] = useState<ProductoFormData>({
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
  });

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
      if (idx !== i) return k === "es_default" && v === true ? { ...vr, es_default: false } : vr;
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

  /* ── Submit ────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.titulo.trim()) { setError("El título es obligatorio"); return; }
    if (!form.slug.trim())   { setError("El slug es obligatorio");   return; }
    if (form.variantes.length === 0) { setError("Debe haber al menos una variante"); return; }

    setSaving(true);
    try {
      const url    = mode === "crear" ? "/api/admin/productos" : `/api/admin/productos/${initialData?.id}`;
      const method = mode === "crear" ? "POST" : "PUT";

      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });

      let json: { success: boolean; error?: string; data?: { id: number } };
      try {
        json = await res.json();
      } catch {
        setError(`Error del servidor (HTTP ${res.status})`);
        return;
      }

      if (!json.success) { setError(json.error ?? "Error al guardar"); return; }

      router.push("/admin/productos");
      router.refresh();
    } catch (err) {
      setError(`Error de red: ${err instanceof Error ? err.message : "sin conexión"}`);
    } finally {
      setSaving(false);
    }
  };

  /* ── Render ────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            {mode === "crear" ? "Nuevo producto" : "Editar producto"}
          </h1>
          {form.slug && (
            <p className="text-xs text-slate-400 mt-0.5 font-mono">/producto/{form.slug}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition"
          >
            {saving ? "Guardando…" : mode === "crear" ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* Grid principal */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

        {/* Columna principal */}
        <div className="space-y-5">

          <SectionCard title="Información básica">
            <div className="space-y-4">
              <Field label="Título del producto" required>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => handleTitulo(e.target.value)}
                  placeholder="Ej: Perfil de Aluminio 40×40L | Bosch Rexroth"
                  className={inputCls}
                />
              </Field>
            </div>
          </SectionCard>

          <EditorDescripcion
            value={form.descripcion_larga}
            onChange={(v) => set("descripcion_larga", v)}
          />

          <SeccionVariantes
            variantes={form.variantes}
            onAdd={addVariante}
            onRemove={removeVariante}
            onChange={handleVarianteChange}
          />

          <SeccionMultimedia
            imagenes={form.imagenes}
            productoId={form.id}
            slug={form.slug}
            onAdd={addImagenes}
            onRemove={removeImagen}
            onReorder={reorderImagenes}
            onChangeAlt={changeAlt}
          />

          <SeccionSEO
            slug={form.slug}
            meta_titulo={form.meta_titulo}
            meta_descripcion={form.meta_descripcion}
            precio={form.variantes.find((v) => v.es_default)?.precio_final ?? form.variantes[0]?.precio_final}
            tituloFallback={form.titulo}
            descripcionFallback={form.descripcion_larga}
            onMetaTitulo={(v) => set("meta_titulo", v)}
            onMetaDescripcion={(v) => set("meta_descripcion", v)}
          />

        </div>

        {/* Sidebar */}
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
    </form>
  );
}