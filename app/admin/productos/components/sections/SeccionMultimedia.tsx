"use client";
// app/admin/productos/components/SeccionMultimedia.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { SectionCard } from "../producto-form-ui";
import { buildImageSrc, type ImagenForm } from "../producto-form-types";
import { ModalMediaLibrary, type MediaItem } from "../modals/ModalMediaLibrary";

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

interface CropBox { x: number; y: number; w: number; h: number; } // % relativos a la imagen

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
  const [nombre,   setNombre]   = useState(nameOnly); // default: nombre del archivo
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

  // Aspect ratio del lienzo (w/h). null = ratio natural de la imagen
  const [canvasAspect, setCanvasAspect] = useState<number | null>(null);
  // Crop acumulado en coords de imagen para enviar al API
  const [finalCrop, setFinalCrop] = useState<CropBox | null>(null);

  const DEFAULT_CROP: CropBox = { x: 0, y: 0, w: 100, h: 100 };
  const [cropBox,   setCropBox]   = useState<CropBox>(DEFAULT_CROP);
  const [cropRatio, setCropRatio] = useState<string | null>(null);
  const [dragging,  setDragging]  = useState<Handle | null>(null);
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, box: DEFAULT_CROP });

  /* Ref a la imagen real para medir su tamaño renderizado */
  const imgRef       = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  /* Rect de la imagen dentro del contenedor */
  const [imgRect, setImgRect] = useState<DOMRect | null>(null);

  /* Medir imagen al cargar y al cambiar zoom/rotación */
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.querySelector("div")?.getBoundingClientRect();
    if (!rect) return;
    const dx = ((e.clientX - dragStart.mx) / rect.width)  * 100;
    const dy = ((e.clientY - dragStart.my) / rect.height) * 100;
    const b  = dragStart.box;
    let { x, y, w, h } = b;
    const MIN = 5;

    if (dragging === "move") {
      x = Math.max(0, Math.min(100 - w, b.x + dx));
      y = Math.max(0, Math.min(100 - h, b.y + dy));
    } else {
      if (dragging.includes("l")) {
        const nx = Math.max(0, Math.min(b.x + b.w - MIN, b.x + dx));
        w = b.w - (nx - b.x); x = nx;
      }
      if (dragging.includes("r")) {
        w = Math.max(MIN, Math.min(100 - b.x, b.w + dx));
      }
      if (dragging.includes("t")) {
        const ny = Math.max(0, Math.min(b.y + b.h - MIN, b.y + dy));
        h = b.h - (ny - b.y); y = ny;
      }
      if (dragging.includes("b")) {
        h = Math.max(MIN, Math.min(100 - b.y, b.h + dy));
      }
    }
    setCropBox({ x, y, w, h });
  }, [dragging, dragStart, imgRect]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup",   handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup",   handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  /* ── Aplicar ratio ───────────────────────────────────────── */
  const applyRatio = (ratio: string | null) => {
    setCropRatio(ratio);
    if (!ratio) { setCropBox(DEFAULT_CROP); return; }
    const [rw, rh] = ratio.split(":").map(Number);
    const aspect   = rw / rh;

    // Calcular el mayor recuadro que quepa en el lienzo (100×100)
    // El lienzo es cuadrado en %, así que comparamos directamente
    let w: number, h: number;
    if (aspect >= 1) {
      // Más ancho que alto: limitar por ancho
      w = 100;
      h = 100 / aspect;
      if (h > 100) { h = 100; w = 100 * aspect; }
    } else {
      // Más alto que ancho: limitar por alto
      h = 100;
      w = 100 * aspect;
      if (w > 100) { w = 100; h = 100 / aspect; }
    }

    // Centrar
    const x = (100 - w) / 2;
    const y = (100 - h) / 2;
    setCropBox({ x, y, w, h });
  };

  /* ── Aplicar recorte: cambia el lienzo y acumula para API ── */
  const handleApplyCrop = () => {
    // Cambiar el aspect ratio del lienzo al del crop seleccionado
    setCanvasAspect(cropBox.w / cropBox.h);

    // Acumular el crop en coordenadas de imagen para el API
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
    setCropRatio(null);
  };

  /* ── Guardar ─────────────────────────────────────────────── */
  const handleSave = async () => {
    // Validar nombre único (contra otras imágenes del producto)
    const nuevoNombre = nombre.trim() + ext;
    const dupes = existingNames.filter(n => n !== fileName && n === nuevoNombre);
    if (dupes.length > 0) {
      setNombreErr(`Ya existe una imagen con el nombre "${nuevoNombre}" en este producto`);
      return;
    }
    setNombreErr("");
    setSaving(true);

    const hasTransform = !!finalCrop || !!appliedResize || flipH || flipV || rotation !== 0;

    try {
      if (hasTransform) {
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
        const editJson = await editRes.json();
        if (!editJson.success) {
          setSaveMsg(`Error: ${editJson.error}`);
          setSaving(false);
          return;
        }
      }

      onChangeAlt(desc);

      if (nombre.trim() !== nameOnly) {
        try {
          await fetch("/api/admin/media/rename", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ url: imagen.url, productoId, nuevoNombre }),
          });
        } catch { /* silencioso */ }
      }

      setSaveMsg("Guardado ✓");
      setTimeout(() => { setSaveMsg(""); onClose(); }, 900);
    } catch {
      setSaveMsg("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const imgTransform = ""; // kept for TS, unused — transform applied inline

  /* ── Handle positions: 8 puntos ─────────────────────────── */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl flex overflow-hidden w-full max-w-[90vw] mx-4"
        style={{ maxHeight: "92vh" }}>

        {/* ── Área preview ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#111] min-w-0">

          {/* Imagen + overlay crop — lienzo fijo */}
          <div
            ref={containerRef}
            className="relative flex-1 flex items-center justify-center overflow-hidden select-none"
            style={{ background: "#1a1a1a" }}
          >
            {/* Lienzo: aspect ratio controlado, overflow hidden clipa lo que queda fuera */}
            <div
              className="relative shrink-0 overflow-hidden"
              style={{
                aspectRatio:     canvasAspect ? String(canvasAspect) : undefined,
                maxHeight:       "62vh",
                maxWidth:        "100%",
                backgroundImage: "repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 0 0 / 16px 16px",
                outline:         "1px solid rgba(255,255,255,0.12)",
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

              {/* Overlay crop — sobre el lienzo, no sobre la imagen escalada */}
              {tab === "recortar" && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Oscurecer exterior */}
                  <div className="absolute" style={{ left: 0, right: 0, top: 0, height: `${cropBox.y}%`, background: "rgba(0,0,0,0.55)" }} />
                  <div className="absolute" style={{ left: 0, right: 0, bottom: 0, height: `${100 - cropBox.y - cropBox.h}%`, background: "rgba(0,0,0,0.55)" }} />
                  <div className="absolute" style={{ left: 0, top: `${cropBox.y}%`, width: `${cropBox.x}%`, height: `${cropBox.h}%`, background: "rgba(0,0,0,0.55)" }} />
                  <div className="absolute" style={{ right: 0, top: `${cropBox.y}%`, width: `${100 - cropBox.x - cropBox.w}%`, height: `${cropBox.h}%`, background: "rgba(0,0,0,0.55)" }} />

                  {/* Rectángulo de recorte */}
                  <div
                    className="absolute border-2 border-white"
                    style={{
                      left:          `${cropBox.x}%`,
                      top:           `${cropBox.y}%`,
                      width:         `${cropBox.w}%`,
                      height:        `${cropBox.h}%`,
                      cursor:        "move",
                      pointerEvents: "all",
                    }}
                    onMouseDown={(e) => handleMouseDown(e, "move")}
                  >
                    {/* Grid tercios */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-white/25" />
                      ))}
                    </div>

                    {/* 8 handles — tamaño fijo 10px, no escalan con zoom */}
                    {handles.map(({ handle, style, cursor }) => (
                      <div
                        key={handle}
                        className="absolute bg-white rounded-sm shadow-md pointer-events-auto"
                        style={{
                          ...style,
                          cursor,
                          zIndex: 10,
                          width:  10,
                          height: 10,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, handle)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>{/* fin lienzo */}
          </div>{/* fin containerRef */}

          {/* Barra inferior: zoom — solo en tab recortar */}
          {tab === "recortar" && (
            <div className="bg-[#161616] border-t border-white/8 px-5 py-2.5 flex items-center justify-center shrink-0">
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={() => setZoom(z => Math.max(0.25, Math.round((z - 0.25) * 100) / 100))}
                  className="w-5 h-5 rounded bg-white/10 text-white/50 hover:bg-white/20 transition text-xs flex items-center justify-center">
                  −
                </button>
                <input
                  type="range" min={25} max={300} step={5} value={Math.round(zoom * 100)}
                  onChange={(e) => setZoom(Number(e.target.value) / 100)}
                  className="w-28 accent-indigo-400 cursor-pointer"
                  style={{ height: 3 }}
                />
                <button type="button"
                  onClick={() => setZoom(z => Math.min(3, Math.round((z + 0.25) * 100) / 100))}
                  className="w-5 h-5 rounded bg-white/10 text-white/50 hover:bg-white/20 transition text-xs flex items-center justify-center">
                  +
                </button>
                <span className="text-[10px] text-white/30 font-mono w-8">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom(1)}
                  className="text-[10px] text-white/25 hover:text-white/50 transition">
                  ↺
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel lateral ────────────────────────────────── */}
        <div className="w-96 shrink-0 flex flex-col border-l border-slate-100 bg-white">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
            <p className="text-sm font-semibold text-slate-700 truncate max-w-[260px]" title={fileName}>{fileName}</p>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition shrink-0 ml-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 shrink-0">
            {([
              { id: "informacion", label: "Información" },
              { id: "recortar",   label: "Recortar" },
              { id: "tamaño",     label: "Tamaño" },
            ] as { id: PanelTab; label: string }[]).map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`flex-1 text-xs py-3 font-medium transition border-b-2 ${
                  tab === t.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Contenido tab */}
          <div className="flex-1 overflow-y-auto">

            {tab === "informacion" && (
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Nombre</label>
                  <div className={`flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition ${nombreErr ? "border-red-300" : "border-slate-200"}`}>
                    <input type="text" value={nombre} onChange={(e) => { setNombre(e.target.value); setNombreErr(""); }}
                      className="flex-1 text-sm px-3 py-2 focus:outline-none min-w-0" />
                    {ext && <span className="px-2.5 text-xs text-slate-400 bg-slate-50 border-l border-slate-200 py-2 shrink-0">{ext}</span>}
                  </div>
                  {nombreErr && <p className="text-xs text-red-500">{nombreErr}</p>}
                  {slug && nombre !== slug && (
                    <button type="button" onClick={() => { setNombre(slug); setNombreErr(""); }}
                      className="text-xs text-indigo-500 hover:text-indigo-700 transition">
                      Usar slug del producto: <span className="font-mono">{slug}</span>
                    </button>
                  )}
                  {slug && nombre === slug && (
                    <p className="text-xs text-emerald-500">✓ Usando el slug del producto</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Descripción</label>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5}
                    placeholder="Describe la imagen para accesibilidad y SEO"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition placeholder:text-slate-300" />
                  <p className="text-xs text-slate-400">Se usa como atributo alt en HTML y por motores de búsqueda.</p>
                </div>
              </div>
            )}

            {tab === "recortar" && (
              <div className="p-5 space-y-5">
                {/* Proporción */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Proporción</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Libre", value: null },
                      { label: "1:1",   value: "1:1" },
                      { label: "16:9",  value: "16:9" },
                      { label: "4:3",   value: "4:3" },
                      { label: "3:2",   value: "3:2" },
                    ].map(({ label, value }) => (
                      <button key={label} type="button" onClick={() => applyRatio(value)}
                        className={`px-4 py-2 text-xs rounded-lg border font-medium transition ${
                          cropRatio === value
                            ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                            : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voltear */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Voltear</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setFlipH(v => !v)}
                      className={`flex items-center justify-center gap-2 py-2.5 text-xs rounded-lg border font-medium transition ${
                        flipH ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"
                      }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Horizontal
                    </button>
                    <button type="button" onClick={() => setFlipV(v => !v)}
                      className={`flex items-center justify-center gap-2 py-2.5 text-xs rounded-lg border font-medium transition ${
                        flipV ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"
                      }`}>
                      <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Vertical
                    </button>
                  </div>
                </div>

                {/* Girar */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Girar</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "−90°", delta: -90, icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9" },
                      { label: "+90°", delta:  90, icon: "M20 4v5h-.582M4.644 11A8.001 8.001 0 0019.418 9m0 0H15" },
                    ].map(({ label, delta, icon }) => (
                      <button key={label} type="button"
                        onClick={() => setRotation(r => (r + delta + 360) % 360)}
                        className="flex items-center justify-center gap-2 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 font-medium transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                        </svg>
                        {label}
                      </button>
                    ))}
                  </div>
                  {rotation !== 0 && (
                    <p className="text-xs text-indigo-500 font-mono text-center">{rotation}° aplicado</p>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  {finalCrop && (
                    <p className="text-xs text-indigo-500 text-center font-medium">
                      ✓ Lienzo {Math.round(cropBox.w / cropBox.h * 10) / 10}:1 — ajusta más o guarda
                    </p>
                  )}
                  <button type="button" onClick={handleApplyCrop}
                    className="w-full py-2.5 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                    Aplicar recorte
                  </button>
                  <button type="button"
                    onClick={() => {
                      setCropBox(DEFAULT_CROP);
                      setFinalCrop(null);
                      setCanvasAspect(null);
                      setCropRatio(null);
                      setFlipH(false);
                      setFlipV(false);
                      setRotation(0);
                      setZoom(1);
                    }}
                    className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 transition rounded-lg hover:bg-slate-50">
                    Restablecer todo
                  </button>
                </div>
              </div>
            )}

            {tab === "tamaño" && (
              <div className="p-5 space-y-5">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-600">Dimensiones (px)</p>
                  <div className="space-y-2">
                    {[
                      { label: "Ancho", val: resizeW, set: setResizeW },
                      { label: "Alto",  val: resizeH, set: setResizeH },
                    ].map(({ label, val, set }) => (
                      <div key={label} className="flex items-center gap-3">
                        <label className="text-xs text-slate-500 w-12 shrink-0">{label}</label>
                        <input type="number" value={val} onChange={(e) => set(e.target.value)}
                          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition" />
                        <span className="text-xs text-slate-400 shrink-0">px</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Tamaños predefinidos</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Miniatura",  w: "150",  h: "150"  },
                      { label: "Pequeño",    w: "300",  h: "300"  },
                      { label: "Mediano",    w: "600",  h: "600"  },
                      { label: "Grande",     w: "800",  h: "800"  },
                      { label: "HD",         w: "1280", h: "720"  },
                      { label: "Full HD",    w: "1920", h: "1080" },
                    ].map(({ label, w, h }) => (
                      <button key={label} type="button" onClick={() => { setResizeW(w); setResizeH(h); }}
                        className={`py-2.5 text-xs rounded-lg border font-medium transition ${
                          resizeW === w && resizeH === h
                            ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                            : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50"
                        }`}>
                        <span className="block">{label}</span>
                        <span className="block text-[10px] opacity-60 font-mono mt-0.5">{w}×{h}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {appliedResize && (
                  <p className="text-xs text-indigo-500 text-center font-medium">
                    ✓ {appliedResize.w}×{appliedResize.h}px aplicado
                  </p>
                )}
                <button type="button"
                  onClick={() => setAppliedResize({ w: Number(resizeW), h: Number(resizeH) })}
                  className="w-full py-2.5 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                  Aplicar tamaño
                </button>
              </div>
            )}
          </div>

          {/* Acciones fijas */}
          <div className="p-5 border-t border-slate-100 shrink-0">
            <button type="button" onClick={handleSave} disabled={saving}
              className="w-full px-4 py-2.5 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-60 transition">
              {saveMsg || (saving ? "Guardando…" : "Guardar")}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

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
        className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer"
        onClick={() => setEditing(true)}
      >
        {!broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={imagen.alt || ""} onError={() => setBroken(true)} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  // Nombres de archivo de todas las imágenes del producto (para validación de unicidad)
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
          <button type="button" onClick={() => setModalOpen(true)}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 flex items-center justify-center text-slate-300 hover:text-indigo-400 transition">
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