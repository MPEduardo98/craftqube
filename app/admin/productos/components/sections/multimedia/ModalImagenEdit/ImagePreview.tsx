// app/admin/productos/components/sections/multimedia/ModalImagenEdit/ImagePreview.tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
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
}

const handles: { handle: Handle; style: React.CSSProperties; cursor: string }[] = [
  { handle: "tl", style: { top: -8, left: -8 }, cursor: "nwse-resize" },
  { handle: "t", style: { top: -8, left: "calc(50% - 8px)" }, cursor: "ns-resize" },
  { handle: "tr", style: { top: -8, right: -8 }, cursor: "nesw-resize" },
  { handle: "r", style: { top: "calc(50% - 8px)", right: -8 }, cursor: "ew-resize" },
  { handle: "br", style: { bottom: -8, right: -8 }, cursor: "nwse-resize" },
  { handle: "b", style: { bottom: -8, left: "calc(50% - 8px)" }, cursor: "ns-resize" },
  { handle: "bl", style: { bottom: -8, left: -8 }, cursor: "nesw-resize" },
  { handle: "l", style: { top: "calc(50% - 8px)", left: -8 }, cursor: "ew-resize" },
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
}: ImagePreviewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imgRef.current) onImgLoad(imgRef.current);
  }, [onImgLoad]);

  useEffect(() => {
    if (containerRef.current) onContainerMount(containerRef.current);
  }, [onContainerMount]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#111] min-w-0">
      {/* Imagen + overlay */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden select-none"
        style={{ background: "#1a1a1a" }}
      >
        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            aspectRatio: canvasAspect ? String(canvasAspect) : undefined,
            maxHeight: "100%",
            maxWidth: "100%",
            backgroundImage:
              "repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 16px 16px",
            outline: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {/* Imagen SIN TOCAR - solo object-contain dentro del lienzo */}
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt=""
              className="block w-full h-full object-contain pointer-events-none"
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

          {/* Overlay crop - en el mismo nivel que la imagen */}
          {tab === "recortar" && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute"
                style={{
                  left: 0,
                  right: 0,
                  top: 0,
                  height: `${cropBox.y}%`,
                  background: "rgba(0,0,0,0.55)",
                }}
              />
              <div
                className="absolute"
                style={{
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: `${100 - cropBox.y - cropBox.h}%`,
                  background: "rgba(0,0,0,0.55)",
                }}
              />
              <div
                className="absolute"
                style={{
                  left: 0,
                  top: `${cropBox.y}%`,
                  width: `${cropBox.x}%`,
                  height: `${cropBox.h}%`,
                  background: "rgba(0,0,0,0.55)",
                }}
              />
              <div
                className="absolute"
                style={{
                  right: 0,
                  top: `${cropBox.y}%`,
                  width: `${100 - cropBox.x - cropBox.w}%`,
                  height: `${cropBox.h}%`,
                  background: "rgba(0,0,0,0.55)",
                }}
              />

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
                      width: '16px',
                      height: '16px',
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

      {/* Footer con zoom y controles */}
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
            className={`px-3 py-1.5 text-xs rounded transition ${
              flipH ? "bg-white/20 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setFlipV(!flipV)}
            className={`px-3 py-1.5 text-xs rounded transition ${
              flipV ? "bg-white/20 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setRotation((rotation + 90) % 360)}
            className="px-3 py-1.5 text-xs rounded bg-white/5 text-white/60 hover:bg-white/10 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}