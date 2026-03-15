"use client";
// app/admin/productos/components/SeccionMultimedia.tsx
// ─────────────────────────────────────────────────────────────
// Sección multimedia: grid de thumbnails + modal de biblioteca.
// Reemplaza SeccionImagenes. El campo orden ya no se muestra.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { SectionCard } from "./producto-form-ui";
import { buildImageSrc, type ImagenForm } from "./producto-form-types";
import { ModalMediaLibrary, type MediaItem } from "./ModalMediaLibrary";

interface Props {
  imagenes:       ImagenForm[];
  productoId?:    number;
  onAdd:          (items: MediaItem[]) => void;
  onRemove:       (i: number) => void;
  onChangeAlt:    (i: number, alt: string) => void;
}

/* ── Thumbnail individual ──────────────────────────────────── */
function Thumbnail({
  imagen,
  productoId,
  onRemove,
  onChangeAlt,
}: {
  imagen:      ImagenForm;
  productoId?: number;
  onRemove:    () => void;
  onChangeAlt: (alt: string) => void;
}) {
  const [editingAlt, setEditingAlt] = useState(false);
  const [broken,     setBroken]     = useState(false);
  const src = buildImageSrc(imagen.url, productoId);

  return (
    <div className="relative group">
      {/* Card imagen */}
      <div
        className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer"
        onClick={() => setEditingAlt(true)}
      >
        {!broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={imagen.alt || ""}
            onError={() => setBroken(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition rounded-xl" />

        {/* Botón eliminar */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-slate-500 hover:text-red-500 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Badge alt */}
        {imagen.alt && (
          <div className="absolute bottom-1.5 left-1.5 right-1.5">
            <p className="text-[10px] text-white bg-black/50 rounded px-1.5 py-0.5 truncate">{imagen.alt}</p>
          </div>
        )}
      </div>

      {/* Panel edición alt */}
      {editingAlt && (
        <div className="absolute z-10 top-full left-0 mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-xl p-3 space-y-2">
          <p className="text-xs font-medium text-slate-600">Texto alternativo</p>
          <input
            autoFocus
            type="text"
            value={imagen.alt}
            onChange={(e) => onChangeAlt(e.target.value)}
            placeholder="Descripción de la imagen"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300"
          />
          <button
            type="button"
            onClick={() => setEditingAlt(false)}
            className="w-full text-xs font-medium text-indigo-600 hover:text-indigo-700 py-1 transition"
          >
            Listo
          </button>
        </div>
      )}
    </div>
  );
}

/* ── SeccionMultimedia ─────────────────────────────────────── */
export function SeccionMultimedia({ imagenes, productoId, onAdd, onRemove, onChangeAlt }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <SectionCard title="Multimedia">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {imagenes.map((img, i) => (
            <Thumbnail
              key={i}
              imagen={img}
              productoId={productoId}
              onRemove={() => onRemove(i)}
              onChangeAlt={(alt) => onChangeAlt(i, alt)}
            />
          ))}

          {/* Botón añadir */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 flex items-center justify-center text-slate-300 hover:text-indigo-400 transition"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </SectionCard>

      {/* Modal biblioteca de medios */}
      {modalOpen && (
        <ModalMediaLibrary
          multiple
          onSelect={(items) => {
            onAdd(items);
            setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}