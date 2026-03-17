// app/admin/productos/components/sections/multimedia/SeccionMultimedia.tsx
"use client";

import { useRef, useState } from "react";
import { SectionCard } from "../../producto-form-ui";
import { resolveImageUrl } from "@/app/global/lib/resolveImageUrl";
import { ModalMediaLibrary, type MediaItem } from "../../modals/ModalMediaLibrary";
import { ModalImagenEdit } from "./ModalImagenEdit/ModalImagenEdit";
import { type ImagenForm } from "../../producto-form-types";

interface Props {
  imagenes:    ImagenForm[];
  productoId?: number;
  slug?:       string;
  onAdd:       (items: MediaItem[]) => void;
  onRemove:    (i: number) => void;
  onReorder:   (from: number, to: number) => void;
  onChangeAlt: (i: number, alt: string) => void;
}

export function SeccionMultimedia({
  imagenes,
  productoId,
  slug,
  onAdd,
  onRemove,
  onReorder,
  onChangeAlt,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [dragOver,  setDragOver]  = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);

  const existingNames = imagenes.map((img) => img.url.split("/").pop() ?? img.url);

  const handleDragStart = (i: number) => { dragIndex.current = i; };
  const handleDragEnter = (i: number) => {
    if (dragIndex.current !== null && dragIndex.current !== i) setDragOver(i);
  };
  const handleDrop = (i: number) => {
    if (dragIndex.current !== null && dragIndex.current !== i) onReorder(dragIndex.current, i);
    dragIndex.current = null;
    setDragOver(null);
  };
  const handleDragEnd = () => { dragIndex.current = null; setDragOver(null); };

  return (
    <>
      <SectionCard title={`Multimedia (${imagenes.length})`}>
        {imagenes.length === 0 ? (
          <div
            onClick={() => setModalOpen(true)}
            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition hover:border-slate-300 hover:bg-slate-50"
            style={{ borderColor: "var(--color-cq-border)" }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--color-cq-muted)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "var(--color-cq-muted)" }}>Agregar imágenes</p>
            <p className="text-xs" style={{ color: "var(--color-cq-muted-2)" }}>Haz clic para abrir la biblioteca</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">

            {imagenes.map((img, i) => {
              const isFirst      = i === 0;
              const src          = resolveImageUrl(img.url, productoId) ?? "";
              const isDragTarget = dragOver === i;

              return (
                <div
                  key={`${img.url}-${i}`}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragEnter={() => handleDragEnter(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setEditIndex(i)}
                  className={[
                    "relative group cursor-grab active:cursor-grabbing rounded-xl overflow-hidden border-2 transition-all select-none aspect-square",
                    isFirst ? "col-span-2 row-span-2" : "col-span-1 row-span-1",
                    isDragTarget ? "border-indigo-400 scale-[0.96] opacity-50" : "border-transparent",
                  ].join(" ")}
                  style={{ background: "var(--color-cq-surface-2)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={img.alt || ""}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />

                  {/* Overlay oscuro al hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-150 pointer-events-none" />

                  {/* Badge "Principal" */}
                  {isFirst && (
                    <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-sm pointer-events-none select-none">
                      Principal
                    </span>
                  )}

                  {/* ── Drag handle — esquina superior izquierda ── */}
                  <div
                    className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none"
                    style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="6.5"  cy="4"  r="1.5" />
                      <circle cx="13.5" cy="4"  r="1.5" />
                      <circle cx="6.5"  cy="10" r="1.5" />
                      <circle cx="13.5" cy="10" r="1.5" />
                      <circle cx="6.5"  cy="16" r="1.5" />
                      <circle cx="13.5" cy="16" r="1.5" />
                    </svg>
                  </div>

                  {/* ── Botón eliminar — esquina superior derecha ── */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 z-10 hover:scale-110"
                    style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
                    title="Eliminar imagen"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}

            {/* Botón agregar nueva imagen */}
            <div
              onClick={() => setModalOpen(true)}
              className="col-span-1 row-span-1 aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition hover:bg-slate-50 hover:border-slate-300"
              style={{ borderColor: "var(--color-cq-border)", color: "var(--color-cq-muted)" }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        )}
      </SectionCard>

      {modalOpen && (
        <ModalMediaLibrary
          multiple
          productoId={productoId}
          onSelect={(items) => { onAdd(items); setModalOpen(false); }}
          onClose={() => setModalOpen(false)}
        />
      )}

      {editIndex !== null && imagenes[editIndex] && (
        <ModalImagenEdit
          imagen={imagenes[editIndex]}
          productoId={productoId}
          slug={slug}
          existingNames={existingNames}
          onChangeAlt={(alt) => onChangeAlt(editIndex, alt)}
          onRemove={() => { onRemove(editIndex); setEditIndex(null); }}
          onClose={() => setEditIndex(null)}
        />
      )}
    </>
  );
}