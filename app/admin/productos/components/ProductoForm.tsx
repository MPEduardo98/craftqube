"use client";
// app/(admin)/admin/productos/components/ProductoForm.tsx
// ─────────────────────────────────────────────────────────────
// Formulario completo para crear/editar productos.
// ─────────────────────────────────────────────────────────────
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ── Tipos ─────────────────────────────────────────────────── */
export interface VarianteForm {
  id?:                   number;
  sku:                   string;
  codigo_barras:         string;
  precio_original:       string;
  precio_final:          string;
  costo:                 string;
  stock:                 string;
  es_default:            boolean;
  vender_sin_existencia: boolean;
}

export interface ImagenForm {
  url:   string;
  alt:   string;
  orden: number;
}

export interface MetacampoForm {
  llave: string;
  valor: string;
}

export interface ProductoFormData {
  id?:                number;
  titulo:             string;
  slug:               string;
  estado:             "activo" | "inactivo" | "borrador";
  marca_id:           string;
  descripcion_corta:  string;
  descripcion_larga:  string;
  meta_titulo:        string;
  meta_descripcion:   string;
  categorias:         number[];
  variantes:          VarianteForm[];
  imagenes:           ImagenForm[];
  metacampos:         MetacampoForm[];
}

export interface Categoria { id: number; nombre: string; slug: string; }
export interface Marca     { id: number; nombre: string; }

interface Props {
  initialData?: Partial<ProductoFormData>;
  categorias:   Categoria[];
  marcas:       Marca[];
  mode:         "crear" | "editar";
}

/* ── Helpers ───────────────────────────────────────────────── */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const emptyVariante = (): VarianteForm => ({
  sku: "", codigo_barras: "", precio_original: "0",
  precio_final: "0", costo: "0", stock: "0",
  es_default: false, vender_sin_existencia: false,
});

/* ── Subcomponentes UI ─────────────────────────────────────── */
function SectionCard({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls      = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300";
const textareaCls   = `${inputCls} resize-none`;
const inputSmallCls = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300 tabular-nums";

/* ── Componente principal ──────────────────────────────────── */
export function ProductoForm({ initialData, categorias, marcas, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [slugLocked, setSlugLocked] = useState(mode === "editar");

  const [form, setForm] = useState<ProductoFormData>({
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
    imagenes:          (initialData?.imagenes   as ImagenForm[])   ?? [],
    metacampos:        (initialData?.metacampos as MetacampoForm[]) ?? [],
  });

  /* -- Cambios genéricos -- */
  const set = useCallback(<K extends keyof ProductoFormData>(k: K, v: ProductoFormData[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  }, []);

  /* -- Título → auto-slug -- */
  const handleTitulo = (val: string) => {
    set("titulo", val);
    if (!slugLocked) set("slug", slugify(val));
  };

  /* -- Categorías (multi-toggle) -- */
  const toggleCat = (id: number) => {
    set("categorias", form.categorias.includes(id)
      ? form.categorias.filter((c) => c !== id)
      : [...form.categorias, id]);
  };

  /* -- Variantes -- */
  const setVariante = (i: number, k: keyof VarianteForm, v: string | boolean) => {
    const next = form.variantes.map((vr, idx) => {
      if (idx !== i) {
        return k === "es_default" && v === true ? { ...vr, es_default: false } : vr;
      }
      return { ...vr, [k]: v };
    });
    set("variantes", next);
  };

  const addVariante    = () => set("variantes", [...form.variantes, emptyVariante()]);

  const removeVariante = (i: number) => {
    if (form.variantes.length <= 1) return;
    const next = form.variantes.filter((_, idx) => idx !== i);
    if (!next.some((v) => v.es_default)) next[0].es_default = true;
    set("variantes", next);
  };

  /* -- Imágenes -- */
  const addImagen = () =>
    set("imagenes", [...form.imagenes, { url: "", alt: "", orden: form.imagenes.length }]);

  const setImagen = (i: number, k: keyof ImagenForm, v: string | number) => {
    const next = [...form.imagenes];
    (next[i] as Record<keyof ImagenForm, string | number>)[k] = v;
    set("imagenes", next);
  };

  const removeImagen = (i: number) =>
    set("imagenes", form.imagenes.filter((_, idx) => idx !== i));

  /* -- Metacampos -- */
  const addMetacampo = () =>
    set("metacampos", [...form.metacampos, { llave: "", valor: "" }]);

  const setMetacampo = (i: number, k: keyof MetacampoForm, v: string) => {
    const next = [...form.metacampos];
    next[i] = { ...next[i], [k]: v };
    set("metacampos", next);
  };

  const removeMetacampo = (i: number) =>
    set("metacampos", form.metacampos.filter((_, idx) => idx !== i));

  /* -- Submit -- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.titulo.trim()) { setError("El título es obligatorio"); return; }
    if (!form.slug.trim())   { setError("El slug es obligatorio");   return; }
    if (form.variantes.length === 0) { setError("Debe haber al menos una variante"); return; }

    setSaving(true);
    try {
      const url    = mode === "crear"
        ? "/api/admin/productos"
        : `/api/admin/productos/${initialData?.id}`;
      const method = mode === "crear" ? "POST" : "PUT";

      const payload = {
        ...form,
        marca_id: form.marca_id ? Number(form.marca_id) : null,
      };

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Error al guardar");
        return;
      }

      const destId = mode === "crear" ? json.data.id : initialData?.id;
      // ✅ Ruta correcta: /admin/productos/[id]/editar
      router.push(`/admin/productos/${destId}/editar`);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit}>

      {/* ── Barra superior pegajosa ─────────────────────── */}
      <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 px-6 py-3 -mx-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button
            type="button"
            onClick={() => router.push("/admin/productos")}
            className="hover:text-slate-700 transition"
          >
            Productos
          </button>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-700 font-medium">
            {mode === "crear" ? "Nuevo producto" : form.titulo || "Editar producto"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => router.push("/admin/productos")}
            className="text-sm px-4 py-2 border border-slate-200 rounded-lg hover:bg-white transition text-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="text-sm px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition flex items-center gap-2"
          >
            {saving && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? "Guardando…" : mode === "crear" ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {/* ── Grid principal ──────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

        {/* ── Columna principal ──────────────────────────── */}
        <div className="space-y-5">

          {/* Información básica */}
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

              <Field label="Slug (URL)" required hint="Solo letras, números y guiones">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    disabled={slugLocked}
                    placeholder="perfil-aluminio-40x40"
                    className={`${inputCls} flex-1 ${slugLocked ? "bg-slate-50 text-slate-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setSlugLocked(!slugLocked)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-500"
                  >
                    {slugLocked ? "Editar" : "Bloquear"}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  /productos/{form.slug || "tu-slug-aqui"}
                </p>
              </Field>

              <Field label="Descripción corta">
                <textarea
                  value={form.descripcion_corta}
                  onChange={(e) => set("descripcion_corta", e.target.value)}
                  rows={3}
                  placeholder="Breve descripción del producto..."
                  className={textareaCls}
                />
              </Field>

              <Field label="Descripción larga">
                <textarea
                  value={form.descripcion_larga}
                  onChange={(e) => set("descripcion_larga", e.target.value)}
                  rows={8}
                  placeholder="Descripción completa, especificaciones técnicas..."
                  className={textareaCls}
                />
              </Field>

            </div>
          </SectionCard>

          {/* Variantes */}
          <SectionCard
            title={`Variantes (${form.variantes.length})`}
            action={
              <button
                type="button"
                onClick={addVariante}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir variante
              </button>
            }
          >
            <div className="space-y-4">
              {form.variantes.map((v, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 space-y-3 ${
                    v.es_default ? "border-indigo-300 bg-indigo-50/30" : "border-slate-200"
                  }`}
                >
                  {/* Cabecera de variante */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVariante(i, "es_default", true)}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition ${
                          v.es_default
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-slate-200 text-slate-500 hover:border-indigo-300"
                        }`}
                      >
                        {v.es_default ? "★ Principal" : "Marcar principal"}
                      </button>
                      <span className="text-xs text-slate-400">Variante {i + 1}</span>
                    </div>
                    {form.variantes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariante(i)}
                        className="text-slate-400 hover:text-red-500 transition"
                        title="Eliminar variante"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Campos de variante — fila 1 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="SKU" required>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => setVariante(i, "sku", e.target.value)}
                        placeholder="SKU-001"
                        className={inputSmallCls}
                      />
                    </Field>
                    <Field label="Código de barras">
                      <input
                        type="text"
                        value={v.codigo_barras}
                        onChange={(e) => setVariante(i, "codigo_barras", e.target.value)}
                        placeholder="7501234567890"
                        className={inputSmallCls}
                      />
                    </Field>
                    <Field label="Stock">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => setVariante(i, "stock", e.target.value)}
                        className={inputSmallCls}
                      />
                    </Field>
                    <Field label="Costo">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.costo}
                        onChange={(e) => setVariante(i, "costo", e.target.value)}
                        className={inputSmallCls}
                      />
                    </Field>
                  </div>

                  {/* Campos de variante — fila 2 */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Precio original">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.precio_original}
                        onChange={(e) => setVariante(i, "precio_original", e.target.value)}
                        className={inputSmallCls}
                      />
                    </Field>
                    <Field label="Precio final (con descuento)">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.precio_final}
                        onChange={(e) => setVariante(i, "precio_final", e.target.value)}
                        className={inputSmallCls}
                      />
                    </Field>
                  </div>

                  {/* Toggle: vender sin existencia */}
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <div
                      className={`relative inline-flex w-9 h-5 items-center rounded-full transition-colors ${
                        v.vender_sin_existencia ? "bg-indigo-600" : "bg-slate-200"
                      }`}
                      onClick={() => setVariante(i, "vender_sin_existencia", !v.vender_sin_existencia)}
                    >
                      <span
                        className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          v.vender_sin_existencia ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </div>
                    <span className="text-xs text-slate-600">Vender sin existencia</span>
                  </label>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Imágenes */}
          <SectionCard
            title={`Imágenes (${form.imagenes.length})`}
            action={
              <button
                type="button"
                onClick={addImagen}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir imagen
              </button>
            }
          >
            {form.imagenes.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-400">Sin imágenes.</p>
                <button type="button" onClick={addImagen} className="mt-2 text-sm text-indigo-600 hover:underline">
                  Añadir imagen
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {form.imagenes.map((img, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                    {/* Preview */}
                    <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {img.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? ""}/uploads/productos/${img.url}`}
                          alt={img.alt || ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                        </svg>
                      )}
                    </div>

                    {/* Campos */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_1fr_80px] gap-2">
                      <input
                        type="text"
                        value={img.url}
                        onChange={(e) => setImagen(i, "url", e.target.value)}
                        placeholder="nombre-archivo.jpg"
                        className={inputCls}
                      />
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => setImagen(i, "alt", e.target.value)}
                        placeholder="Texto alternativo"
                        className={inputCls}
                      />
                      <input
                        type="number"
                        min="0"
                        value={img.orden}
                        onChange={(e) => setImagen(i, "orden", Number(e.target.value))}
                        placeholder="Orden"
                        className={inputSmallCls}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeImagen(i)}
                      className="text-slate-400 hover:text-red-500 transition shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Especificaciones técnicas (metacampos) */}
          <SectionCard
            title={`Especificaciones técnicas (${form.metacampos.length})`}
            action={
              <button
                type="button"
                onClick={addMetacampo}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir campo
              </button>
            }
          >
            {form.metacampos.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-sm text-slate-400 mb-2">Sin especificaciones técnicas</p>
                <button type="button" onClick={addMetacampo} className="text-sm text-indigo-600 hover:underline">
                  Añadir campo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_32px] gap-2 text-xs font-medium text-slate-500 px-1">
                  <span>Propiedad</span>
                  <span>Valor</span>
                  <span />
                </div>
                {form.metacampos.map((m, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center">
                    <input
                      type="text"
                      value={m.llave}
                      onChange={(e) => setMetacampo(i, "llave", e.target.value)}
                      placeholder="Ej: Referencia"
                      className={inputCls}
                    />
                    <input
                      type="text"
                      value={m.valor}
                      onChange={(e) => setMetacampo(i, "valor", e.target.value)}
                      placeholder="Ej: 3842529339"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => removeMetacampo(i)}
                      className="text-slate-400 hover:text-red-500 transition w-8 h-8 flex items-center justify-center"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* SEO */}
          <SectionCard title="SEO">
            <div className="space-y-4">
              <Field label="Meta título" hint="Recomendado: menos de 60 caracteres">
                <input
                  type="text"
                  value={form.meta_titulo}
                  onChange={(e) => set("meta_titulo", e.target.value)}
                  placeholder="Perfil de Aluminio 40×40L | Bosch Rexroth — CraftQube"
                  className={inputCls}
                  maxLength={100}
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${form.meta_titulo.length > 60 ? "text-amber-500" : "text-slate-400"}`}>
                    {form.meta_titulo.length}/60
                  </span>
                </div>
              </Field>

              <Field label="Meta descripción" hint="Recomendado: entre 120-160 caracteres">
                <textarea
                  value={form.meta_descripcion}
                  onChange={(e) => set("meta_descripcion", e.target.value)}
                  rows={3}
                  placeholder="Descripción para motores de búsqueda..."
                  className={textareaCls}
                  maxLength={200}
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${
                    form.meta_descripcion.length > 160 ? "text-amber-500" :
                    form.meta_descripcion.length < 120 && form.meta_descripcion.length > 0 ? "text-slate-400" :
                    "text-slate-400"
                  }`}>
                    {form.meta_descripcion.length}/160
                  </span>
                </div>
              </Field>
            </div>
          </SectionCard>

        </div>{/* /columna principal */}

        {/* ── Panel lateral ──────────────────────────────── */}
        <div className="space-y-5">

          {/* Estado */}
          <SectionCard title="Estado">
            <div className="space-y-2">
              {(["activo", "inactivo", "borrador"] as const).map((est) => (
                <label key={est} className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition flex items-center justify-center ${
                      form.estado === est
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-slate-300 group-hover:border-indigo-300"
                    }`}
                    onClick={() => set("estado", est)}
                  >
                    {form.estado === est && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm text-slate-700 capitalize">{est}</span>
                  <span className={`ml-auto w-2 h-2 rounded-full ${
                    est === "activo"   ? "bg-emerald-400" :
                    est === "inactivo" ? "bg-red-400" :
                    "bg-amber-400"
                  }`} />
                </label>
              ))}
            </div>
          </SectionCard>

          {/* Organización */}
          <SectionCard title="Organización">
            <div className="space-y-4">

              <Field label="Marca">
                <select
                  value={form.marca_id}
                  onChange={(e) => set("marca_id", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Sin marca</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={String(m.id)}>{m.nombre}</option>
                  ))}
                </select>
              </Field>

              <Field label="Categorías">
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  {categorias.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                      <div
                        className={`w-4 h-4 rounded border-2 transition flex items-center justify-center ${
                          form.categorias.includes(cat.id)
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-slate-300 group-hover:border-indigo-300"
                        }`}
                        onClick={() => toggleCat(cat.id)}
                      >
                        {form.categorias.includes(cat.id) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-slate-700">{cat.nombre}</span>
                    </label>
                  ))}
                  {categorias.length === 0 && (
                    <p className="text-xs text-slate-400">No hay categorías disponibles.</p>
                  )}
                </div>
              </Field>

            </div>
          </SectionCard>

          {/* Resumen del producto (solo en modo editar) */}
          {mode === "editar" && initialData?.id && (
            <SectionCard title="Acciones">
              <div className="space-y-2">
                <a
                  href={`/producto/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver en tienda
                </a>
                <p className="text-xs text-slate-400">ID: #{initialData.id}</p>
              </div>
            </SectionCard>
          )}

        </div>{/* /panel lateral */}

      </div>{/* /grid */}
    </form>
  );
}