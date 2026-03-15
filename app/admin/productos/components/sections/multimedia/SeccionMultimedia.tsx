// app/admin/productos/components/sections/multimedia/SeccionMultimedia.tsx
"use client";

import { useState } from "react";
import { SectionCard } from "../../producto-form-ui";
import type { ImagenForm } from "../../producto-form-types";
import { ModalMediaLibrary, type MediaItem } from "../../modals/ModalMediaLibrary";
import { Thumbnail } from "./Thumbnail";

interface Props {
  imagenes: ImagenForm[];
  productoId?: number;
  slug?: string;
  onAdd: (items: MediaItem[]) => void;
  onRemove: (i: number) => void;
  onChangeAlt: (i: number, alt: string) => void;
}

export function SeccionMultimedia({
  imagenes,
  productoId,
  slug,
  onAdd,
  onRemove,
  onChangeAlt,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const existingNames = imagenes.map((img) => img.url.split("/").pop() ?? img.url);

  return (
    <>
      <SectionCard title="Multimedia">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {imagenes.map((img, i) => (
            <Thumbnail
              key={i}
              imagen={img}
              productoId={productoId}
              slug={slug}
              existingNames={existingNames}
              onRemove={() => onRemove(i)}
              onChangeAlt={(alt) => onChangeAlt(i, alt)}
            />
          ))}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition"
            style={{
              borderColor: "var(--color-cq-border)",
              color: "var(--color-cq-muted)",
            }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </SectionCard>

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