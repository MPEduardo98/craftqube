"use client";
// app/admin/productos/components/ProductoForm.tsx
// ─────────────────────────────────────────────────────────────
// Formulario completo para crear/editar productos.
// Fixes aplicados:
//  1. "Descripción larga" eliminada — meta_descripcion es el campo SEO.
//  2. Categorías: selector con búsqueda + crear nueva categoría inline.
//  3. Imágenes: preview correcto con fallback y onError.
//  4. Slug: movido a sección SEO, siempre readonly (no editable).
// ─────────────────────────────────────────────────────────────
import { useState, useCallback, useRef, useEffect } from "react";
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
  descripcion_larga:  string; // mantenido en tipo para compatibilidad con API, no se renderiza
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

function buildImageSrc(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "";
  return base ? `${base}/${url}` : `/uploads/${url}`;
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

/* ── CategorySelector ──────────────────────────────────────── */
// Selector de categorías con búsqueda y creación inline.
function CategorySelector({
  all,
  selected,
  onChange,
}: {
  all:      Categoria[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [open,       setOpen]       = useState(false);
  const [search,     setSearch]     = useState("");
  const [creating,   setCreating]   = useState(false);
  const [newName,    setNewName]    = useState("");
  const [saving,     setSaving]     = useState(false);
  const [localAll,   setLocalAll]   = useState<Categoria[]>(all);
  const [createErr,  setCreateErr]  = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const filtered = localAll.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: number) => {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  };

  const handleCreate = async () => {
    const nombre = newName.trim();
    if (!nombre) return;
    setSaving(true);
    setCreateErr("");
    try {
      const res  = await fetch("/api/admin/categorias", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ nombre, slug: slugify(nombre) }),
      });
      const json = await res.json();
      if (!json.success) {
        setCreateErr(json.error ?? "Error al crear categoría");
        return;
      }
      const nueva: Categoria = json.data;
      setLocalAll((prev) => [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      onChange([...selected, nueva.id]);
      setNewName("");
      setCreating(false);
    } catch {
      setCreateErr("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const selectedNames = localAll
    .filter((c) => selected.includes(c.id))
    .map((c) => c.nombre);

  return (
    <div className="relative" ref={dropRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setCreating(false); setSearch(""); }}
        className={`${inputCls} text-left flex items-center justify-between gap-2`}
      >
        <span className={selectedNames.length ? "text-slate-700" : "text-slate-300"}>
          {selectedNames.length
            ? selectedNames.join(", ")
            : "Seleccionar categorías..."}
        </span>
        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">

          {/* Búsqueda */}
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
            />
          </div>

          {/* Lista */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Sin resultados</p>
            ) : (
              filtered.map((cat) => {
                const checked = selected.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggle(cat.id)}
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
                    <span className={checked ? "text-slate-800 font-medium" : "text-slate-600"}>
                      {cat.nombre}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer: crear nueva */}
          <div className="border-t border-slate-100 p-2">
            {!creating ? (
              <button
                type="button"
                onClick={() => { setCreating(true); setSearch(""); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva categoría
              </button>
            ) : (
              <div className="space-y-2">
                {createErr && (
                  <p className="text-xs text-red-500 px-1">{createErr}</p>
                )}
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    placeholder="Nombre de la categoría"
                    className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    disabled={saving || !newName.trim()}
                    onClick={handleCreate}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs rounded-lg font-medium transition"
                  >
                    {saving ? "..." : "Crear"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreating(false); setCreateErr(""); setNewName(""); }}
                    className="px-3 py-2 border border-slate-200 text-slate-500 text-xs rounded-lg hover:bg-slate-50 transition"
                  >
                    ✕
                  </button>
                </div>
                {newName.trim() && (
                  <p className="text-xs text-slate-400 px-1">
                    Slug: <span className="font-mono">{slugify(newName)}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ImagePreview ──────────────────────────────────────────── */
function ImagePreview({ url }: { url: string }) {
  const [broken, setBroken] = useState(false);
  const src = buildImageSrc(url);

  if (!url || broken) {
    return (
      <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setBroken(true)}
      className="w-14 h-14 rounded-lg border border-slate-200 object-cover shrink-0 bg-slate-50"
    />
  );
}

/* ── Componente principal ──────────────────────────────────── */
export function ProductoForm({ initialData, categorias, marcas, mode }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const [form, setForm] = useState<ProductoFormData>({
    titulo:            initialData?.titulo            ?? "",
    slug:              initialData?.slug              ?? "",
    estado:            initialData?.estado            ?? "borrador",
    marca_id:          initialData?.marca_id          ? String(initialData.marca_id) : "",
    descripcion_corta: initialData?.descripcion_corta ?? "",
    descripcion_larga: initialData?.descripcion_larga ?? "", // ← no renderizado, mantenido para API
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

  /* -- Título → auto-slug solo en modo crear -- */
  const handleTitulo = (val: string) => {
    set("titulo", val);
    if (mode === "crear") set("slug", slugify(val));
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
  const addImagen    = () =>
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

              <Field label="Descripción corta">
                <textarea
                  value={form.descripcion_corta}
                  onChange={(e) => set("descripcion_corta", e.target.value)}
                  rows={3}
                  placeholder="Breve descripción visible en listados y tarjetas del producto..."
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
                  {/* Cabecera */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setVariante(i, "es_default", true)}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium transition ${
                          v.es_default
                            ? "border-indigo-300 bg-indigo-100 text-indigo-700"
                            : "border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                        }`}
                      >
                        {v.es_default ? "✓ Default" : "Marcar default"}
                      </button>
                    </div>
                    {form.variantes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariante(i)}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Campos SKU / Código */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="SKU" required>
                      <input type="text" value={v.sku} onChange={(e) => setVariante(i, "sku", e.target.value)}
                        placeholder="CQ-SKU-001" className={inputSmallCls} />
                    </Field>
                    <Field label="Código de barras">
                      <input type="text" value={v.codigo_barras} onChange={(e) => setVariante(i, "codigo_barras", e.target.value)}
                        placeholder="7501234567890" className={inputSmallCls} />
                    </Field>
                  </div>

                  {/* Precios */}
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Precio original">
                      <input type="number" min="0" step="0.01" value={v.precio_original}
                        onChange={(e) => setVariante(i, "precio_original", e.target.value)}
                        className={inputSmallCls} />
                    </Field>
                    <Field label="Precio final">
                      <input type="number" min="0" step="0.01" value={v.precio_final}
                        onChange={(e) => setVariante(i, "precio_final", e.target.value)}
                        className={inputSmallCls} />
                    </Field>
                    <Field label="Costo">
                      <input type="number" min="0" step="0.01" value={v.costo}
                        onChange={(e) => setVariante(i, "costo", e.target.value)}
                        className={inputSmallCls} />
                    </Field>
                  </div>

                  {/* Stock y opciones */}
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Field label="Stock">
                        <input type="number" min="0" value={v.stock}
                          onChange={(e) => setVariante(i, "stock", e.target.value)}
                          className={inputSmallCls} />
                      </Field>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer mt-5">
                      <div
                        className={`relative w-9 h-5 rounded-full transition cursor-pointer ${
                          v.vender_sin_existencia ? "bg-indigo-600" : "bg-slate-200"
                        }`}
                        onClick={() => setVariante(i, "vender_sin_existencia", !v.vender_sin_existencia)}
                      >
                        <span
                          className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform absolute top-0.5 ${
                            v.vender_sin_existencia ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                      <span className="text-xs text-slate-600">Vender sin existencia</span>
                    </label>
                  </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

                    {/* ── Preview de imagen con fallback ── */}
                    <ImagePreview url={img.url} />

                    {/* Campos */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        type="text"
                        value={img.url}
                        onChange={(e) => setImagen(i, "url", e.target.value)}
                        placeholder="URL o nombre de archivo (ej: producto.webp)"
                        className={inputCls}
                      />
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => setImagen(i, "alt", e.target.value)}
                        placeholder="Texto alternativo (alt)"
                        className={inputCls}
                      />
                    </div>

                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400 font-mono">#{img.orden + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeImagen(i)}
                        className="text-slate-400 hover:text-red-500 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Especificaciones técnicas (metacampos) */}
          <SectionCard
            title="Especificaciones técnicas"
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

        </div>{/* fin columna principal */}

        {/* ── Sidebar derecho ────────────────────────────── */}
        <div className="space-y-5">

          {/* Estado */}
          <SectionCard title="Estado">
            <div className="space-y-1">
              {(["activo", "borrador", "inactivo"] as const).map((est) => (
                <label key={est} className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-lg transition ${
                  form.estado === est ? "bg-slate-100" : "hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="estado"
                    value={est}
                    checked={form.estado === est}
                    onChange={() => set("estado", est)}
                    className="sr-only"
                  />
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    est === "activo"   ? "bg-emerald-400" :
                    est === "inactivo" ? "bg-red-400"     : "bg-amber-400"
                  }`} />
                  <span className="text-sm text-slate-700 capitalize">{est}</span>
                  {form.estado === est && (
                    <svg className="w-3.5 h-3.5 text-indigo-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
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

              {/* ── Categorías: selector con búsqueda + crear nueva ── */}
              <Field label="Categorías">
                <CategorySelector
                  all={categorias}
                  selected={form.categorias}
                  onChange={(ids) => set("categorias", ids)}
                />
                {form.categorias.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    {form.categorias.length} categoría{form.categorias.length !== 1 ? "s" : ""} seleccionada{form.categorias.length !== 1 ? "s" : ""}
                  </p>
                )}
              </Field>

            </div>
          </SectionCard>

          {/* SEO ──────────────────────────────────────────── */}
          {/* Slug siempre readonly — nunca editable */}
          <SectionCard title="SEO">
            <div className="space-y-4">

              {/* Slug: readonly, generado automáticamente */}
              <Field
                label="Slug (URL)"
                hint={`/productos/${form.slug || "tu-slug-aqui"}`}
              >
                <div className="relative">
                  <input
                    type="text"
                    value={form.slug}
                    readOnly
                    tabIndex={-1}
                    placeholder="se-genera-automaticamente"
                    className={`${inputCls} bg-slate-50 text-slate-400 cursor-not-allowed pr-9`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                </div>
              </Field>

              {/* Meta título */}
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

              {/* Meta descripción — este es el campo SEO, reemplaza a "descripción larga" */}
              <Field
                label="Meta descripción"
                hint="Recomendado: entre 120 y 160 caracteres"
              >
                <textarea
                  value={form.meta_descripcion}
                  onChange={(e) => set("meta_descripcion", e.target.value)}
                  rows={4}
                  maxLength={160}
                  placeholder="Descripción breve del producto para motores de búsqueda. Máximo 160 caracteres."
                  className={textareaCls}
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${
                    form.meta_descripcion.length > 160 ? "text-red-500"
                    : form.meta_descripcion.length > 120 ? "text-emerald-500"
                    : "text-slate-400"
                  }`}>
                    {form.meta_descripcion.length}/160
                  </span>
                </div>
              </Field>

              {/* Vista previa SERP */}
              {(form.meta_titulo || form.titulo) && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">Vista previa en Google</p>
                  <p className="text-[13px] text-blue-700 font-medium leading-snug line-clamp-1">
                    {form.meta_titulo || form.titulo}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-mono">
                    craftqube.com/productos/{form.slug || "slug"}
                  </p>
                  {form.meta_descripcion && (
                    <p className="text-[12px] text-slate-600 leading-snug line-clamp-2">
                      {form.meta_descripcion}
                    </p>
                  )}
                </div>
              )}

            </div>
          </SectionCard>

        </div>{/* fin sidebar */}
      </div>
    </form>
  );
}