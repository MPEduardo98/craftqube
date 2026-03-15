// app/admin/productos/components/sections/SeccionMultimedia.tsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { SectionCard } from "../producto-form-ui";
import { buildImageSrc, type ImagenForm } from "../producto-form-types";
import { ModalMediaLibrary, type MediaItem } from "../modals/ModalMediaLibrary";
import { LoadingOverlay } from "@/app/global/components/ui/LoadingOverlay";

interface Props {
  imagenes:    ImagenForm[];
  productoId?: number;
  slug?:       string;
  onAdd:       (items: MediaItem[]) => void;
  onRemove:    (i: number) => void;
  onChangeAlt: (i: number, alt: string) => void;
}

type PanelTab = "informacion" | "recortar" | "tamaño";
type Handle   = "move" | "tl" | "t" | "tr" | "r" | "br" | "b" | "bl" | "l";

interface CropBox { x: number; y: number; w: number; h: number; }

/* ── Helpers ───────────────────────────────────────────────── */
function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Modal ─────────────────────────────────────────────────── */
function ModalImagenEdit({ imagen, productoId, slug, existingNames, onChangeAlt, onRemove, onClose }: {
  imagen: ImagenForm; productoId?: number; slug?: string; existingNames: string[];
  onChangeAlt: (alt: string) => void; onRemove: () => void; onClose: () => void;
}) {
  const src      = buildImageSrc(imagen.url, productoId);
  const fileName = imagen.url.split("/").pop() ?? imagen.url;
  const ext      = fileName.includes(".") ? "." + fileName.split(".").pop() : "";
  const nameOnly = ext ? fileName.slice(0, fileName.lastIndexOf(".")) : fileName;

  /* ── Estado ──────────────────────────────────────────────── */
  const [tab,      setTab]      = useState<PanelTab>("informacion");
  const [nombre,   setNombre]   = useState(nameOnly);
  const [nombreErr,setNombreErr]= useState("");
  const [desc,     setDesc]     = useState(imagen.alt);
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState("");

  const [zoom,     setZoom]     = useState(1);
  const [flipH,    setFlipH]    = useState(false);
  const [flipV,    setFlipV]    = useState(false);
  const [rotation, setRotation] = useState(0);

  const [resizeW,  setResizeW]  = useState("800");
  const [resizeH,  setResizeH]  = useState("800");
  const [appliedResize, setAppliedResize] = useState<{ w: number; h: number } | null>(null);

  const [canvasAspect, setCanvasAspect] = useState<number | null>(null);
  const [finalCrop, setFinalCrop] = useState<CropBox | null>(null);

  const DEFAULT_CROP: CropBox = { x: 0, y: 0, w: 100, h: 100 };
  const [cropBox,   setCropBox]   = useState<CropBox>(DEFAULT_CROP);
  const [cropRatio, setCropRatio] = useState<string | null>(null);
  const [dragging,  setDragging]  = useState<Handle | null>(null);
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, box: DEFAULT_CROP });

  const imgRef       = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgRect, setImgRect] = useState<DOMRect | null>(null);

  const [metadata, setMetadata] = useState<{
    width?: number;
    height?: number;
    size?: number;
    created?: string;
  }>({});

  /* Cargar metadata */
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
      .then(res => {
        const size = res.headers.get("content-length");
        if (size) setMetadata(prev => ({ ...prev, size: parseInt(size) }));
      })
      .catch(() => {});
  }, [src]);

  /* Medir imagen */
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

  /* ── Drag handlers ───────────────────────────────────────── */
  const handleMouseDown = (e: React.MouseEvent, handle: Handle) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(handle);
    setDragStart({ mx: e.clientX, my: e.clientY, box: { ...cropBox } });
  };

  useEffect(() => {
    if (!dragging || !imgRect) return;

    const handleMove = (e: MouseEvent) => {
      const dx = ((e.clientX - dragStart.mx) / imgRect.width)  * 100;
      const dy = ((e.clientY - dragStart.my) / imgRect.height) * 100;

      let { x, y, w, h } = dragStart.box;

      if (dragging === "move") {
        x = Math.max(0, Math.min(100 - w, x + dx));
        y = Math.max(0, Math.min(100 - h, y + dy));
      } else {
        const isLeft   = dragging.includes("l");
        const isRight  = dragging.includes("r");
        const isTop    = dragging.includes("t");
        const isBottom = dragging.includes("b");

        if (isLeft) {
          const newX = Math.max(0, Math.min(x + w - 5, x + dx));
          w = w + (x - newX);
          x = newX;
        }
        if (isRight)  { w = Math.max(5, Math.min(100 - x, w + dx)); }
        if (isTop) {
          const newY = Math.max(0, Math.min(y + h - 5, y + dy));
          h = h + (y - newY);
          y = newY;
        }
        if (isBottom) { h = Math.max(5, Math.min(100 - y, h + dy)); }
      }

      setCropBox({ x, y, w, h });
    };

    const handleUp = () => setDragging(null);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup",   handleUp);
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup",   handleUp);
    };
  }, [dragging, dragStart, imgRect, cropBox]);

  /* ── Crop ratio ──────────────────────────────────────────── */
  const handleCropRatio = (ratio: string | null) => {
    setCropRatio(ratio);
    
    if (!ratio) { 
      // Formato libre: resetear el cropBox a 100% del lienzo actual
      setCropBox(DEFAULT_CROP);
      return; 
    }
    
    const [rw, rh] = ratio.split(":").map(Number);
    const targetAspect = rw / rh; // aspect ratio deseado (ej: 16/9 = 1.777)

    // El lienzo actual tiene su propio aspect ratio
    // Si ya se aplicó un crop, canvasAspect tiene ese valor
    // Si no, el lienzo es cuadrado (1:1)
    const currentCanvasAspect = canvasAspect || 1;

    let w: number, h: number;
    
    // Necesitamos crear un cropBox que tenga el targetAspect
    // pero que quepa dentro del lienzo actual
    
    // Si el target es más ancho que el canvas actual, limitamos por ancho
    if (targetAspect >= currentCanvasAspect) {
      w = 100;
      h = (100 * currentCanvasAspect) / targetAspect;
    } else {
      // Si el target es más alto, limitamos por alto
      h = 100;
      w = (100 * targetAspect) / currentCanvasAspect;
    }

    // Centrar
    const x = (100 - w) / 2;
    const y = (100 - h) / 2;
    
    setCropBox({ x, y, w, h });
  };

  /* ── Aplicar recorte ─────────────────────────────────────── */
  const handleApplyCrop = () => {
    // El nuevo aspect ratio del lienzo será el del cropBox aplicado sobre el lienzo actual
    const currentCanvasAspect = canvasAspect || 1;
    
    // Si el cropBox es 100x100, no hay cambio
    // Si el cropBox es 100x56.25 (16:9), el nuevo aspect será 100/56.25 = 1.777...
    const cropAspectInCanvas = cropBox.w / cropBox.h;
    
    // El aspect final combina el aspect del canvas actual con el del crop
    const newCanvasAspect = currentCanvasAspect * cropAspectInCanvas;
    
    setCanvasAspect(newCanvasAspect);

    if (finalCrop) {
      setFinalCrop({
        x: finalCrop.x + cropBox.x * finalCrop.w / 100,
        y: finalCrop.y + cropBox.y * finalCrop.h / 100,
        w: cropBox.w * finalCrop.w / 100,
        h: cropBox.h * finalCrop.h / 100,
      });
    } else {
      setFinalCrop({ ...cropBox });
    }

    setCropBox(DEFAULT_CROP);
    setCropRatio(null); // Resetear para poder volver a seleccionar el mismo ratio
  };

  /* ── Descargar ───────────────────────────────────────────── */
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = fileName;
    link.click();
  };

  /* ── Guardar ─────────────────────────────────────────────── */
  const handleSave = async () => {
    const nuevoNombre = nombre.trim() + ext;
    const dupes = existingNames.filter(n => n !== fileName && n === nuevoNombre);
    if (dupes.length > 0) {
      setNombreErr(`Ya existe una imagen con el nombre "${nuevoNombre}" en este producto`);
      return;
    }
    setNombreErr("");
    setSaving(true);
    setSaveMsg("");

    const hasTransform = !!finalCrop || !!appliedResize || flipH || flipV || rotation !== 0;

    try {
      // Aplicar transformaciones si existen
      if (hasTransform) {
        console.log("[SeccionMultimedia] Enviando transformaciones:", {
          url: imagen.url,
          productoId,
          crop: finalCrop,
          resize: appliedResize,
          flipH,
          flipV,
          rotation
        });

        const editRes = await fetch("/api/admin/media/edit", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url:        imagen.url,
            productoId,
            crop:     finalCrop    || undefined,
            resize:   appliedResize ? { width: appliedResize.w, height: appliedResize.h } : undefined,
            flipH:    flipH         || undefined,
            flipV:    flipV         || undefined,
            rotation: rotation !== 0 ? rotation : undefined,
          }),
        });

        if (!editRes.ok) {
          const errorText = await editRes.text();
          console.error("[SeccionMultimedia] Error HTTP:", editRes.status, errorText);
          setSaveMsg(`Error HTTP ${editRes.status}: ${errorText}`);
          setSaving(false);
          return;
        }

        const editJson = await editRes.json();
        console.log("[SeccionMultimedia] Respuesta edit:", editJson);

        if (!editJson.success) {
          setSaveMsg(`Error: ${editJson.error}`);
          setSaving(false);
          return;
        }
      }

      // Actualizar alt text
      onChangeAlt(desc);

      // Renombrar si cambió el nombre
      if (nombre.trim() !== nameOnly) {
        console.log("[SeccionMultimedia] Renombrando:", { 
          url: imagen.url, 
          productoId, 
          nuevoNombre 
        });

        const renameRes = await fetch("/api/admin/media/rename", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ 
            url: imagen.url, 
            productoId, 
            nuevoNombre 
          }),
        });

        if (!renameRes.ok) {
          const errorText = await renameRes.text();
          console.error("[SeccionMultimedia] Error rename HTTP:", renameRes.status, errorText);
          setSaveMsg(`Error al renombrar (HTTP ${renameRes.status})`);
          setSaving(false);
          return;
        }

        const renameJson = await renameRes.json();
        console.log("[SeccionMultimedia] Respuesta rename:", renameJson);

        if (!renameJson.success) {
          setSaveMsg(`Error al renombrar: ${renameJson.error}`);
          setSaving(false);
          return;
        }
      }

      console.log("[SeccionMultimedia] Guardado exitoso");
      setSaveMsg("Guardado ✓");
      setTimeout(() => { 
        setSaveMsg(""); 
      }, 1500);
    } catch (error) {
      console.error("[SeccionMultimedia] Error catch:", error);
      setSaveMsg(`Error de conexión: ${error instanceof Error ? error.message : "Desconocido"}`);
    } finally {
      setSaving(false);
    }
  };

  /* ── Handles ─────────────────────────────────────────────── */
  const handles: { handle: Handle; style: React.CSSProperties; cursor: string }[] = [
    { handle: "tl", style: { top: -5, left: -5 },                cursor: "nwse-resize" },
    { handle: "t",  style: { top: -5, left: "calc(50% - 5px)" }, cursor: "ns-resize"   },
    { handle: "tr", style: { top: -5, right: -5 },               cursor: "nesw-resize" },
    { handle: "r",  style: { top: "calc(50% - 5px)", right: -5 },cursor: "ew-resize"   },
    { handle: "br", style: { bottom: -5, right: -5 },            cursor: "nwse-resize" },
    { handle: "b",  style: { bottom: -5, left: "calc(50% - 5px)" }, cursor: "ns-resize" },
    { handle: "bl", style: { bottom: -5, left: -5 },             cursor: "nesw-resize" },
    { handle: "l",  style: { top: "calc(50% - 5px)", left: -5 }, cursor: "ew-resize"   },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal pantalla completa */}
      <div 
        className="relative rounded-none shadow-2xl flex overflow-hidden w-full h-full"
        style={{ background: "var(--color-cq-surface)" }}
      >

        {/* Loader global */}
        <LoadingOverlay visible={saving} message="Guardando cambios..." mode="fixed" />

        {/* ── Área preview ───────────────────────────────────── */}
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
                backgroundImage: "repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 16px 16px",
                outline: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={src}
                alt=""
                onLoad={measureImg}
                className="block w-full h-full object-contain pointer-events-none"
                style={{
                  transform: [
                    `scale(${zoom})`,
                    flipH ? "scaleX(-1)" : "",
                    flipV ? "scaleY(-1)" : "",
                    `rotate(${rotation}deg)`,
                  ].filter(Boolean).join(" "),
                  transformOrigin: "center center",
                  transition: dragging ? "none" : "transform 0.2s ease",
                }}
              />

              {/* Overlay crop */}
              {tab === "recortar" && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute" style={{ left: 0, right: 0, top: 0, height: `${cropBox.y}%`, background: "rgba(0,0,0,0.55)" }} />
                  <div className="absolute" style={{ left: 0, right: 0, bottom: 0, height: `${100 - cropBox.y - cropBox.h}%`, background: "rgba(0,0,0,0.55)" }} />
                  <div className="absolute" style={{ left: 0, top: `${cropBox.y}%`, width: `${cropBox.x}%`, height: `${cropBox.h}%`, background: "rgba(0,0,0,0.55)" }} />
                  <div className="absolute" style={{ right: 0, top: `${cropBox.y}%`, width: `${100 - cropBox.x - cropBox.w}%`, height: `${cropBox.h}%`, background: "rgba(0,0,0,0.55)" }} />

                  <div
                    className="absolute border-2 border-white"
                    style={{
                      left:   `${cropBox.x}%`,
                      top:    `${cropBox.y}%`,
                      width:  `${cropBox.w}%`,
                      height: `${cropBox.h}%`,
                      cursor: "move",
                      pointerEvents: "all",
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
                        className="absolute w-[10px] h-[10px] rounded-full border"
                        style={{ 
                          ...style, 
                          cursor, 
                          pointerEvents: "all",
                          background: "var(--color-cq-surface)",
                          borderColor: "var(--color-cq-text)"
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
                className={`px-3 py-1.5 text-xs rounded transition ${flipH ? "bg-white/20 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setFlipV(!flipV)}
                className={`px-3 py-1.5 text-xs rounded transition ${flipV ? "bg-white/20 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setRotation((rotation - 90) % 360)}
                className="px-3 py-1.5 text-xs bg-white/5 text-white/60 rounded hover:bg-white/10 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Panel lateral ──────────────────────────────────── */}
        <div 
          className="flex flex-col border-l"
          style={{ 
            width: "380px",
            minWidth: "380px",
            maxWidth: "380px",
            background: "var(--color-cq-surface)",
            borderColor: "var(--color-cq-border)"
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--color-cq-border)" }}
          >
            <h3 
              className="text-sm font-semibold"
              style={{ color: "var(--color-cq-text)" }}
            >
              Editor de imagen
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition"
              style={{ color: "var(--color-cq-muted)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div 
            className="flex border-b"
            style={{ borderColor: "var(--color-cq-border)" }}
          >
            {(["informacion", "recortar", "tamaño"] as PanelTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 px-4 py-3 text-xs font-medium transition"
                style={{
                  color: tab === t ? "var(--color-cq-primary)" : "var(--color-cq-muted)",
                  borderBottom: tab === t ? "2px solid var(--color-cq-primary)" : "none"
                }}
              >
                {t === "informacion" ? "Información" : t === "recortar" ? "Recortar" : "Tamaño"}
              </button>
            ))}
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* ── Tab: Información ────────────────────────── */}
            {tab === "informacion" && (
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
                      <span 
                        className="font-mono"
                        style={{ color: "var(--color-cq-text)" }}
                      >
                        {metadata.width && metadata.height
                          ? `${metadata.width} × ${metadata.height}`
                          : "Cargando..."}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--color-cq-muted)" }}>Tamaño:</span>
                      <span 
                        className="font-mono"
                        style={{ color: "var(--color-cq-text)" }}
                      >
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
                      color: "var(--color-cq-muted)"
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
                        color: "var(--color-cq-text)"
                      }}
                    />
                    <span 
                      className="text-xs font-mono"
                      style={{ color: "var(--color-cq-muted)" }}
                    >
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
                        padding: 0
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
                      color: "var(--color-cq-text)"
                    }}
                  />
                </div>
              </>
            )}

            {/* ── Tab: Recortar ───────────────────────────── */}
            {tab === "recortar" && (
              <>
                <div>
                  <label 
                    className="block text-xs font-medium mb-2"
                    style={{ color: "var(--color-cq-text)" }}
                  >
                    Relación de aspecto
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { ratio: "1:1", label: "Cuadrado" },
                      { ratio: "3:2", label: "3:2" },
                      { ratio: "5:4", label: "5:4" },
                      { ratio: "7:5", label: "7:5" },
                      { ratio: "16:9", label: "16:9" },
                    ].map((item) => (
                      <button
                        key={item.ratio}
                        type="button"
                        onClick={() => handleCropRatio(item.ratio)}
                        className="px-3 py-2 text-xs font-medium rounded border transition"
                        style={{
                          background: cropRatio === item.ratio ? "var(--color-cq-accent-glow)" : "var(--color-cq-surface)",
                          borderColor: cropRatio === item.ratio ? "var(--color-cq-primary)" : "var(--color-cq-border)",
                          color: cropRatio === item.ratio ? "var(--color-cq-primary)" : "var(--color-cq-text)"
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCropRatio(null)}
                    className="w-full mt-2 px-3 py-2 text-xs font-medium rounded border transition"
                    style={{
                      background: "var(--color-cq-surface)",
                      borderColor: "var(--color-cq-border)",
                      color: "var(--color-cq-text)"
                    }}
                  >
                    Formato libre
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="btn-primary w-full justify-center"
                >
                  Aplicar recorte
                </button>
              </>
            )}

            {/* ── Tab: Tamaño ─────────────────────────────── */}
            {tab === "tamaño" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label 
                      className="block text-xs font-medium mb-2"
                      style={{ color: "var(--color-cq-text)" }}
                    >
                      Ancho (px)
                    </label>
                    <input
                      type="number"
                      value={resizeW}
                      onChange={(e) => setResizeW(e.target.value)}
                      className="w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 transition"
                      style={{
                        background: "var(--color-cq-surface)",
                        borderColor: "var(--color-cq-border)",
                        color: "var(--color-cq-text)"
                      }}
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-xs font-medium mb-2"
                      style={{ color: "var(--color-cq-text)" }}
                    >
                      Alto (px)
                    </label>
                    <input
                      type="number"
                      value={resizeH}
                      onChange={(e) => setResizeH(e.target.value)}
                      className="w-full text-sm rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 transition"
                      style={{
                        background: "var(--color-cq-surface)",
                        borderColor: "var(--color-cq-border)",
                        color: "var(--color-cq-text)"
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const w = parseInt(resizeW);
                    const h = parseInt(resizeH);
                    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
                      setAppliedResize({ w, h });
                    }
                  }}
                  className="btn-primary w-full justify-center"
                >
                  Aplicar tamaño
                </button>
              </>
            )}
          </div>

          {/* Footer con acciones */}
          <div 
            className="border-t p-4 space-y-2"
            style={{ 
              borderColor: "var(--color-cq-border)",
              background: "var(--color-cq-surface-2)"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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

/* ── Thumbnail ─────────────────────────────────────────────── */
function Thumbnail({ imagen, productoId, slug, existingNames, onRemove, onChangeAlt }: {
  imagen: ImagenForm; productoId?: number; slug?: string; existingNames: string[];
  onRemove: () => void; onChangeAlt: (alt: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [broken,  setBroken]  = useState(false);
  const src = buildImageSrc(imagen.url, productoId);

  return (
    <>
      <div
        className="relative group aspect-square rounded-xl overflow-hidden border cursor-pointer"
        style={{
          borderColor: "var(--color-cq-border)",
          background: "var(--color-cq-surface-2)"
        }}
        onClick={() => setEditing(true)}
      >
        {!broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={imagen.alt || ""} onError={() => setBroken(true)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg 
              className="w-8 h-8" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              style={{ color: "var(--color-cq-muted)" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

/* ── SeccionMultimedia ─────────────────────────────────────── */
export function SeccionMultimedia({ imagenes, productoId, slug, onAdd, onRemove, onChangeAlt }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const existingNames = imagenes.map(img => img.url.split("/").pop() ?? img.url);

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
              color: "var(--color-cq-muted)"
            }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </SectionCard>

      {modalOpen && (
        <ModalMediaLibrary
          multiple
          onSelect={(items) => { onAdd(items); setModalOpen(false); }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}