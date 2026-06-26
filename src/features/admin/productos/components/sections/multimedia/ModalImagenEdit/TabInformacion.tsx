// app/admin/productos/components/sections/multimedia/ModalImagenEdit/TabInformacion.tsx
"use client";

import type { ImageMetadata } from "./types";
import { formatBytes, formatDate } from "../utils";

interface TabInformacionProps {
  ext: string;
  metadata: ImageMetadata;
  nombre: string;
  nombreErr: string;
  desc: string;
  slug?: string;
  setNombre: (val: string) => void;
  setDesc: (val: string) => void;
}

export function TabInformacion({
  ext,
  metadata,
  nombre,
  nombreErr,
  desc,
  slug,
  setNombre,
  setDesc,
}: TabInformacionProps) {
  return (
    <>
      <div className="space-y-3">
        <h4
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-cq-text)" }}
        >
          Detalles
        </h4>
        <div
          className="rounded-lg p-4 space-y-2 text-xs"
          style={{ background: "var(--color-cq-surface-2)" }}
        >
          <div className="flex justify-between">
            <span style={{ color: "var(--color-cq-muted)" }}>Formato:</span>
            <span
              className="font-mono uppercase"
              style={{ color: "var(--color-cq-text)" }}
            >
              {ext.replace(".", "")}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-cq-muted)" }}>Dimensiones:</span>
            <span className="font-mono" style={{ color: "var(--color-cq-text)" }}>
              {metadata.width && metadata.height
                ? `${metadata.width} × ${metadata.height}`
                : "Cargando..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--color-cq-muted)" }}>Tamaño:</span>
            <span className="font-mono" style={{ color: "var(--color-cq-text)" }}>
              {formatBytes(metadata.size)}
            </span>
          </div>
          {metadata.created && (
            <div className="flex justify-between">
              <span style={{ color: "var(--color-cq-muted)" }}>Agregado:</span>
              <span style={{ color: "var(--color-cq-text)" }}>
                {formatDate(metadata.created)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h4
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--color-cq-text)" }}
        >
          Usado en
        </h4>
        <div
          className="rounded-lg p-4 text-xs"
          style={{
            background: "var(--color-cq-surface-2)",
            color: "var(--color-cq-muted)",
          }}
        >
          Productos (1)
        </div>
      </div>

      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "var(--color-cq-text)" }}
        >
          Nombre del archivo
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="flex-1 text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 transition"
            style={{
              background: "var(--color-cq-surface)",
              borderColor: "var(--color-cq-border)",
              color: "var(--color-cq-text)",
            }}
          />
          <span className="text-xs font-mono" style={{ color: "var(--color-cq-muted)" }}>
            {ext}
          </span>
        </div>
        {nombreErr && (
          <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
            {nombreErr}
          </p>
        )}
        {slug && (
          <button
            type="button"
            onClick={() => setNombre(slug)}
            className="mt-2 text-xs hover:underline transition"
            style={{
              color: "var(--color-cq-primary)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Usar slug del producto como nombre
          </button>
        )}
      </div>

      <div>
        <label
          className="block text-xs font-medium mb-2"
          style={{ color: "var(--color-cq-text)" }}
        >
          Descripción (texto alternativo)
        </label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          placeholder="Describe la imagen para SEO y accesibilidad"
          className="w-full text-sm rounded-lg px-3 py-2 border resize-none focus:outline-none focus:ring-2 transition"
          style={{
            background: "var(--color-cq-surface)",
            borderColor: "var(--color-cq-border)",
            color: "var(--color-cq-text)",
          }}
        />
      </div>
    </>
  );
}