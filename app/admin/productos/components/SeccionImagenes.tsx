"use client";
// app/admin/productos/components/SeccionImagenes.tsx
// ─────────────────────────────────────────────────────────────
// Sección de imágenes del producto + metacampos personalizados.
// ─────────────────────────────────────────────────────────────
import { SectionCard, Field, ImagePreview } from "./producto-form-ui";
import { inputCls, inputSmallCls, type ImagenForm, type MetacampoForm } from "./producto-form-types";

/* ── Props ─────────────────────────────────────────────────── */
interface Props {
  imagenes:          ImagenForm[];
  metacampos:        MetacampoForm[];
  onAddImagen:       () => void;
  onRemoveImagen:    (i: number) => void;
  onChangeImagen:    (i: number, k: keyof ImagenForm, v: string | number) => void;
  onAddMetacampo:    () => void;
  onRemoveMetacampo: (i: number) => void;
  onChangeMetacampo: (i: number, k: keyof MetacampoForm, v: string) => void;
}

/* ── Componente ────────────────────────────────────────────── */
export function SeccionImagenes({
  imagenes,
  metacampos,
  onAddImagen,
  onRemoveImagen,
  onChangeImagen,
  onAddMetacampo,
  onRemoveMetacampo,
  onChangeMetacampo,
}: Props) {
  return (
    <>
      {/* ── Imágenes ───────────────────────────────────── */}
      <SectionCard
        title={`Imágenes (${imagenes.length})`}
        action={
          <button
            type="button"
            onClick={onAddImagen}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir imagen
          </button>
        }
      >
        {imagenes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            Sin imágenes. Añade la URL de la imagen del producto.
          </p>
        ) : (
          <div className="space-y-3">
            {imagenes.map((img, i) => (
              <div key={i} className="flex items-start gap-3">
                <ImagePreview url={img.url} />

                <div className="flex-1 grid grid-cols-[1fr_80px] gap-2">
                  <Field label="URL">
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => onChangeImagen(i, "url", e.target.value)}
                      placeholder="https://... o nombre-archivo.jpg"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Orden">
                    <input
                      type="number"
                      min="0"
                      value={img.orden}
                      onChange={(e) => onChangeImagen(i, "orden", Number(e.target.value))}
                      className={inputSmallCls}
                    />
                  </Field>
                  <Field label="Texto alternativo (alt)">
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) => onChangeImagen(i, "alt", e.target.value)}
                      placeholder="Descripción de la imagen"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveImagen(i)}
                  className="mt-6 text-slate-300 hover:text-red-400 transition shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Metacampos ─────────────────────────────────── */}
      <SectionCard
        title="Metacampos"
        action={
          <button
            type="button"
            onClick={onAddMetacampo}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir campo
          </button>
        }
      >
        {metacampos.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            Sin metacampos. Úsalos para datos técnicos o atributos personalizados.
          </p>
        ) : (
          <div className="space-y-2">
            {metacampos.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={m.llave}
                  onChange={(e) => onChangeMetacampo(i, "llave", e.target.value)}
                  placeholder="Llave (ej: peso)"
                  className={`${inputSmallCls} flex-1`}
                />
                <input
                  type="text"
                  value={m.valor}
                  onChange={(e) => onChangeMetacampo(i, "valor", e.target.value)}
                  placeholder="Valor (ej: 1.5 kg)"
                  className={`${inputSmallCls} flex-[2]`}
                />
                <button
                  type="button"
                  onClick={() => onRemoveMetacampo(i)}
                  className="text-slate-300 hover:text-red-400 transition shrink-0"
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
    </>
  );
}