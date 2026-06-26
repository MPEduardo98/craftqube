// app/admin/productos/components/sections/multimedia/ModalImagenEdit/ImagePreview.tsx
"use client";

import { useRef, useEffect } from "react";
import type { PanelTab, Handle, CropBox } from "./types";

interface ImagePreviewProps {
  src: string;
  tab: PanelTab;
  zoom: number;
  flipH: boolean;
  flipV: boolean;
  rotation: number;
  canvasAspect: number | null;
  cropBox: CropBox;
  finalCrop: CropBox | null;
  dragging: Handle | null;
  setZoom: (val: number) => void;
  setFlipH: (val: boolean) => void;
  setFlipV: (val: boolean) => void;
  setRotation: (val: number) => void;
  handleMouseDown: (e: React.MouseEvent, handle: Handle) => void;
  onImgLoad: (img: HTMLImageElement) => void;
  onContainerMount: (container: HTMLDivElement) => void;
  onCanvasDivMount: (div: HTMLDivElement) => void;
}

const handles: { handle: Handle; style: React.CSSProperties; cursor: string }[] = [
  { handle: "tl", style: { top: -8, left: -8 },               cursor: "nwse-resize" },
  { handle: "t",  style: { top: -8, left: "calc(50% - 8px)" }, cursor: "ns-resize"   },
  { handle: "tr", style: { top: -8, right: -8 },               cursor: "nesw-resize" },
  { handle: "r",  style: { top: "calc(50% - 8px)", right: -8 }, cursor: "ew-resize"  },
  { handle: "br", style: { bottom: -8, right: -8 },            cursor: "nwse-resize" },
  { handle: "b",  style: { bottom: -8, left: "calc(50% - 8px)" }, cursor: "ns-resize" },
  { handle: "bl", style: { bottom: -8, left: -8 },             cursor: "nesw-resize" },
  { handle: "l",  style: { top: "calc(50% - 8px)", left: -8 }, cursor: "ew-resize"  },
];

export function ImagePreview({
  src,
  tab,
  zoom,
  flipH,
  flipV,
  rotation,
  canvasAspect,
  cropBox,
  finalCrop,
  dragging,
  setZoom,
  setFlipH,
  setFlipV,
  setRotation,
  handleMouseDown,
  onImgLoad,
  onContainerMount,
  onCanvasDivMount,
}: ImagePreviewProps) {
  const imgRef      = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imgRef.current)      onImgLoad(imgRef.current);
  }, [onImgLoad]);

  useEffect(() => {
    if (containerRef.current) onContainerMount(containerRef.current);
  }, [onContainerMount]);

  useEffect(() => {
    if (canvasDivRef.current) onCanvasDivMount(canvasDivRef.current);
  }, [onCanvasDivMount]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#111] min-w-0">
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden select-none"
        style={{ background: "#1a1a1a" }}
      >
        {/* Canvas div — espacio de coordenadas del overlay */}
        <div
          ref={canvasDivRef}
          className="relative shrink-0 overflow-hidden"
          style={{
            aspectRatio: canvasAspect ? String(canvasAspect) : undefined,
            maxHeight: "100%",
            maxWidth: "100%",
            backgroundImage: "repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 16px 16px",
            outline: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div className="relative w-full h-full">
            {/* object-fill: la imagen siempre ocupa exactamente el canvas div
                (canvasAspect ya coincide con las dimensiones reales de previewSrc,
                así que no hay distorsión ni letterboxing) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt=""
              className="block w-full h-full object-fill pointer-events-none"
              style={{
                transform: [
                  `scale(${zoom})`,
                  flipH ? "scaleX(-1)" : "",
                  flipV ? "scaleY(-1)" : "",
                  `rotate(${rotation}deg)`,
                ]
                  .filter(Boolean)
                  .join(" "),
                transformOrigin: "center center",
                transition: dragging ? "none" : "transform 0.2s ease",
              }}
            />
          </div>

          {tab === "recortar" && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute" style={{ left: 0, right: 0, top: 0, height: `${cropBox.y}%`, background: "rgba(0,0,0,0.55)" }} />
              <div className="absolute" style={{ left: 0, right: 0, bottom: 0, height: `${100 - cropBox.y - cropBox.h}%`, background: "rgba(0,0,0,0.55)" }} />
              <div className="absolute" style={{ left: 0, top: `${cropBox.y}%`, width: `${cropBox.x}%`, height: `${cropBox.h}%`, background: "rgba(0,0,0,0.55)" }} />
              <div className="absolute" style={{ right: 0, top: `${cropBox.y}%`, width: `${100 - cropBox.x - cropBox.w}%`, height: `${cropBox.h}%`, background: "rgba(0,0,0,0.55)" }} />

              <div
                className="absolute border-[3px] border-white"
                style={{
                  left: `${cropBox.x}%`,
                  top: `${cropBox.y}%`,
                  width: `${cropBox.w}%`,
                  height: `${cropBox.h}%`,
                  cursor: "move",
                  pointerEvents: "all",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3)",
                }}
                onMouseDown={(e) => handleMouseDown(e, "move")}
              >
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/25" />
                  ))}
                </div>

                {handles.map(({ handle, style, cursor }) => (
                  <div
                    key={handle}
                    className="absolute rounded-full"
                    style={{
                      ...style,
                      cursor,
                      pointerEvents: "all",
                      width: "16px",
                      height: "16px",
                      background: "white",
                      border: "2px solid #2563eb",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                    onMouseDown={(e) => handleMouseDown(e, handle)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 px-6 py-3 bg-[#0a0a0a] border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">Zoom</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-32"
          />
          <span className="text-xs text-white/60 font-mono">{Math.round(zoom * 100)}%</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFlipH(!flipH)}
            className={`px-3 py-1.5 text-xs rounded transition ${flipH ? "bg-blue-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
          >
            ↔ Voltear H
          </button>
          <button
            type="button"
            onClick={() => setFlipV(!flipV)}
            className={`px-3 py-1.5 text-xs rounded transition ${flipV ? "bg-blue-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
          >
            ↕ Voltear V
          </button>
          <button
            type="button"
            onClick={() => setRotation((rotation + 90) % 360)}
            className="px-3 py-1.5 text-xs rounded bg-white/5 text-white/60 hover:bg-white/10 transition"
          >
            ↻ 90°
          </button>
        </div>
      </div>
    </div>
  );
}