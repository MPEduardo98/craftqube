// app/admin/productos/components/sections/multimedia/Thumbnail.tsx
"use client";

import { useState } from "react";
import { buildImageSrc, type ImagenForm } from "../../producto-form-types";
import { ModalImagenEdit } from "./ModalImagenEdit/ModalImagenEdit";

interface ThumbnailProps {
  imagen: ImagenForm;
  productoId?: number;
  slug?: string;
  existingNames: string[];
  onRemove: () => void;
  onChangeAlt: (alt: string) => void;
}

export function Thumbnail({
  imagen,
  productoId,
  slug,
  existingNames,
  onRemove,
  onChangeAlt,
}: ThumbnailProps) {
  const [editing, setEditing] = useState(false);
  const [broken, setBroken] = useState(false);
  const src = buildImageSrc(imagen.url, productoId);

  return (
    <>
      <div
        className="relative group aspect-square rounded-xl overflow-hidden border cursor-pointer"
        style={{
          borderColor: "var(--color-cq-border)",
          background: "var(--color-cq-surface-2)",
        }}
        onClick={() => setEditing(true)}
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
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: "var(--color-cq-muted)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
      </div>

      {editing && (
        <ModalImagenEdit
          imagen={imagen}
          productoId={productoId}
          slug={slug}
          existingNames={existingNames}
          onChangeAlt={onChangeAlt}
          onRemove={onRemove}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}