// app/admin/productos/components/sections/multimedia/ModalImagenEdit/ModalImagenEdit.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { buildImageSrc } from "../../../producto-form-types";
import { LoadingOverlay } from "@/app/global/components/ui/LoadingOverlay";
import { TabInformacion } from "./TabInformacion";
import { TabRecortar } from "./TabRecortar";
import { TabTamaño } from "./TabTamaño";
import { ImagePreview } from "./ImagePreview";
import type { PanelTab, Handle, CropBox, ImageMetadata, ModalImagenEditProps } from "./types";

const DEFAULT_CROP: CropBox = { x: 0, y: 0, w: 100, h: 100 };

export function ModalImagenEdit({
  imagen,
  productoId,
  slug,
  existingNames,
  onChangeAlt,
  onRemove,
  onClose,
}: ModalImagenEditProps) {
  const src = buildImageSrc(imagen.url, productoId);
  const fileName = imagen.url.split("/").pop() ?? imagen.url;
  const ext = fileName.includes(".") ? "." + fileName.split(".").pop() : "";
  const nameOnly = ext ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;

  const [tab, setTab] = useState<PanelTab>("informacion");
  const [nombre, setNombre] = useState(nameOnly);
  const [nombreErr, setNombreErr] = useState("");
  const [desc, setDesc] = useState(imagen.alt);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [zoom, setZoom] = useState(1);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotation, setRotation] = useState(0);

  const [resizeW, setResizeW] = useState("800");
  const [resizeH, setResizeH] = useState("800");
  const [appliedResize, setAppliedResize] = useState<{ w: number; h: number } | null>(null);

  const [canvasAspect, setCanvasAspect] = useState<number | null>(null);
  const [finalCrop, setFinalCrop] = useState<CropBox | null>(null);

  const [cropBox, setCropBox] = useState<CropBox>(DEFAULT_CROP);
  const [cropRatio, setCropRatio] = useState<string | null>(null);
  const [dragging, setDragging] = useState<Handle | null>(null);
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, box: DEFAULT_CROP });

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgRect, setImgRect] = useState<DOMRect | null>(null);

  const [metadata, setMetadata] = useState<ImageMetadata>({});

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setMetadata({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.src = src;

    fetch(src, { method: "HEAD" })
      .then((res) => {
        const size = res.headers.get("content-length");
        if (size) setMetadata((prev) => ({ ...prev, size: parseInt(size) }));
      })
      .catch(() => {});
  }, [src]);

  const measureImg = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    setImgRect(r);
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) measureImg();
    img.addEventListener("load", measureImg);
    window.addEventListener("resize", measureImg);
    return () => {
      img.removeEventListener("load", measureImg);
      window.removeEventListener("resize", measureImg);
    };
  }, [measureImg]);

  useEffect(() => {
    const t = setTimeout(measureImg, 250);
    return () => clearTimeout(t);
  }, [zoom, rotation, measureImg]);

  const handleMouseDown = (e: React.MouseEvent, handle: Handle) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(handle);
    setDragStart({ mx: e.clientX, my: e.clientY, box: { ...cropBox } });
  };

  useEffect(() => {
    if (!dragging || !imgRect) return;

    const handleMove = (e: MouseEvent) => {
      const dx = ((e.clientX - dragStart.mx) / imgRect.width) * 100;
      const dy = ((e.clientY - dragStart.my) / imgRect.height) * 100;

      let { x, y, w, h } = dragStart.box;

      if (dragging === "move") {
        x = Math.max(0, Math.min(100 - w, x + dx));
        y = Math.max(0, Math.min(100 - h, y + dy));
      } else {
        const isLeft = dragging.includes("l");
        const isRight = dragging.includes("r");
        const isTop = dragging.includes("t");
        const isBottom = dragging.includes("b");

        if (isLeft) {
          const newX = Math.max(0, Math.min(x + w - 5, x + dx));
          w = w + (x - newX);
          x = newX;
        }
        if (isRight) {
          w = Math.max(5, Math.min(100 - x, w + dx));
        }
        if (isTop) {
          const newY = Math.max(0, Math.min(y + h - 5, y + dy));
          h = h + (y - newY);
          y = newY;
        }
        if (isBottom) {
          h = Math.max(5, Math.min(100 - y, h + dy));
        }
      }

      setCropBox({ x, y, w, h });
    };

    const handleUp = () => setDragging(null);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, dragStart, imgRect, cropBox]);

  const handleCropRatio = (ratio: string | null) => {
    setCropRatio(ratio);

    if (!ratio) {
      setCropBox(DEFAULT_CROP);
      return;
    }

    const [rw, rh] = ratio.split(":").map(Number);
    const targetAspect = rw / rh;
    const currentCanvasAspect = canvasAspect || 1;

    let w: number, h: number;

    if (targetAspect >= currentCanvasAspect) {
      w = 100;
      h = (100 * currentCanvasAspect) / targetAspect;
    } else {
      h = 100;
      w = (100 * targetAspect) / currentCanvasAspect;
    }

    const x = (100 - w) / 2;
    const y = (100 - h) / 2;

    setCropBox({ x, y, w, h });
  };

  const handleApplyCrop = () => {
    const currentCanvasAspect = canvasAspect || 1;
    const cropAspectInCanvas = cropBox.w / cropBox.h;
    const newCanvasAspect = currentCanvasAspect * cropAspectInCanvas;

    setCanvasAspect(newCanvasAspect);

    if (finalCrop) {
      setFinalCrop({
        x: finalCrop.x + (cropBox.x * finalCrop.w) / 100,
        y: finalCrop.y + (cropBox.y * finalCrop.h) / 100,
        w: (cropBox.w * finalCrop.w) / 100,
        h: (cropBox.h * finalCrop.h) / 100,
      });
    } else {
      setFinalCrop({ ...cropBox });
    }

    setCropBox(DEFAULT_CROP);
    setCropRatio(null);
  };

  const handleApplyResize = () => {
    const w = parseInt(resizeW);
    const h = parseInt(resizeH);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      setAppliedResize({ w, h });
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = fileName;
    link.click();
  };

  const handleSave = async () => {
    const nuevoNombre = nombre.trim() + ext;
    const dupes = existingNames.filter((n) => n !== fileName && n === nuevoNombre);
    if (dupes.length > 0) {
      setNombreErr(`Ya existe una imagen con el nombre "${nuevoNombre}" en este producto`);
      return;
    }
    setNombreErr("");
    setSaving(true);
    setSaveMsg("");

    const hasTransform = !!finalCrop || !!appliedResize || flipH || flipV || rotation !== 0;

    try {
      if (hasTransform) {
        const editRes = await fetch("/api/admin/media/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: imagen.url,
            productoId,
            crop: finalCrop || undefined,
            resize: appliedResize ? { width: appliedResize.w, height: appliedResize.h } : undefined,
            flipH: flipH || undefined,
            flipV: flipV || undefined,
            rotation: rotation !== 0 ? rotation : undefined,
          }),
        });

        if (!editRes.ok) {
          const errorText = await editRes.text();
          setSaveMsg(`Error HTTP ${editRes.status}: ${errorText}`);
          setSaving(false);
          return;
        }

        const editJson = await editRes.json();

        if (!editJson.success) {
          setSaveMsg(`Error: ${editJson.error}`);
          setSaving(false);
          return;
        }
      }

      onChangeAlt(desc);

      if (nombre.trim() !== nameOnly) {
        const renameRes = await fetch("/api/admin/media/rename", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: imagen.url,
            productoId,
            nuevoNombre,
          }),
        });

        if (!renameRes.ok) {
          const errorText = await renameRes.text();
          setSaveMsg(`Error al renombrar (HTTP ${renameRes.status})`);
          setSaving(false);
          return;
        }

        const renameJson = await renameRes.json();

        if (!renameJson.success) {
          setSaveMsg(`Error al renombrar: ${renameJson.error}`);
          setSaving(false);
          return;
        }
      }

      setSaveMsg("Guardado ✓");
      setTimeout(() => {
        setSaveMsg("");
      }, 1500);
    } catch (error) {
      setSaveMsg(`Error de conexión: ${error instanceof Error ? error.message : "Desconocido"}`);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative rounded-none shadow-2xl flex overflow-hidden w-full h-full"
        style={{ background: "var(--color-cq-surface)" }}
      >
        <LoadingOverlay visible={saving} message="Guardando cambios..." mode="fixed" />

        <ImagePreview
          src={src}
          tab={tab}
          zoom={zoom}
          flipH={flipH}
          flipV={flipV}
          rotation={rotation}
          canvasAspect={canvasAspect}
          cropBox={cropBox}
          dragging={dragging}
          imgRect={imgRect}
          setZoom={setZoom}
          setFlipH={setFlipH}
          setFlipV={setFlipV}
          setRotation={setRotation}
          setImgRect={setImgRect}
          handleMouseDown={handleMouseDown}
          measureImg={measureImg}
        />

        <div className="w-80 flex flex-col border-l" style={{ borderColor: "var(--color-cq-border)" }}>
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--color-cq-border)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-cq-text)" }}>
              Editor de imagen
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 rounded hover:bg-red-50 text-red-500 transition"
                title="Eliminar imagen"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded hover:bg-slate-100 transition"
                style={{ color: "var(--color-cq-muted)" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex border-b" style={{ borderColor: "var(--color-cq-border)" }}>
            {(["informacion", "recortar", "tamaño"] as PanelTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 px-4 py-3 text-xs font-medium transition"
                style={{
                  color: tab === t ? "var(--color-cq-primary)" : "var(--color-cq-muted)",
                  borderBottom: tab === t ? "2px solid var(--color-cq-primary)" : "none",
                }}
              >
                {t === "informacion" ? "Información" : t === "recortar" ? "Recortar" : "Tamaño"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {tab === "informacion" && (
              <TabInformacion
                ext={ext}
                metadata={metadata}
                nombre={nombre}
                nombreErr={nombreErr}
                desc={desc}
                slug={slug}
                setNombre={setNombre}
                setDesc={setDesc}
              />
            )}

            {tab === "recortar" && (
              <TabRecortar
                cropRatio={cropRatio}
                handleCropRatio={handleCropRatio}
                handleApplyCrop={handleApplyCrop}
              />
            )}

            {tab === "tamaño" && (
              <TabTamaño
                resizeW={resizeW}
                resizeH={resizeH}
                setResizeW={setResizeW}
                setResizeH={setResizeH}
                handleApplyResize={handleApplyResize}
              />
            )}
          </div>

          <div
            className="border-t p-4 space-y-2"
            style={{
              borderColor: "var(--color-cq-border)",
              background: "var(--color-cq-surface-2)",
            }}
          >
            {saveMsg && (
              <p
                className="text-xs text-center"
                style={{ color: saveMsg.includes("Error") ? "#ef4444" : "#10b981" }}
              >
                {saveMsg}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!!finalCrop || !!appliedResize || flipH || flipV || rotation !== 0}
                className="btn-secondary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Descargar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}