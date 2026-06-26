// app/api/admin/media/edit/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/admin/media/edit
// Aplica transformaciones a una imagen con Sharp y la sobreescribe.
// Body: { url, productoId, crop?, resize?, flipH?, flipV?, rotation? }
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import path                          from "path";
import fs                            from "fs/promises";
import sharp                         from "sharp";

/* ── Tipos del body ────────────────────────────────────────── */
interface EditBody {
  url:        string;         // nombre del archivo (solo filename) o ruta relativa
  productoId: number;
  crop?: {
    x: number;  // % 0-100 desde la izquierda de la imagen
    y: number;  // % 0-100 desde arriba
    w: number;  // % 0-100 del ancho
    h: number;  // % 0-100 del alto
  };
  resize?: {
    width:  number;
    height: number;
  };
  flipH?:    boolean;
  flipV?:    boolean;
  rotation?: number;   // 0 | 90 | 180 | 270
}

/* ── Resolver ruta absoluta del archivo ────────────────────── */
function resolveFilePath(url: string, productoId: number): string {
  const normalized = url.replace(/\\/g, "/");

  // URL ya contiene la ruta: "productos/2/img.webp" o "/productos/2/img.webp"
  if (normalized.includes("/")) {
    const withoutLeadingSlash = normalized.startsWith("/") ? normalized.slice(1) : normalized;
    return path.join(process.cwd(), "public", withoutLeadingSlash);
  }

  // Solo filename: reconstruir desde productoId
  return path.join(process.cwd(), "public", "productos", String(productoId), normalized);
}

/* ── Handler POST ──────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body: EditBody = await req.json();
    const { url, productoId, crop, resize, flipH, flipV, rotation } = body;

    if (!url || !productoId) {
      return NextResponse.json({ success: false, error: "url y productoId son requeridos" }, { status: 400 });
    }

    const filePath = resolveFilePath(url, productoId);

    // Verificar que el archivo existe
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ success: false, error: `Archivo no encontrado: ${filePath}` }, { status: 404 });
    }

    // Leer metadata para calcular crop en pixels
    let img = sharp(filePath);
    const meta = await img.metadata();
    const imgW  = meta.width  ?? 800;
    const imgH  = meta.height ?? 800;

    // 1. Rotar (Sharp aplica rotación antes del crop para que coincida con el preview)
    const normalizedRotation = ((rotation ?? 0) % 360 + 360) % 360;
    if (normalizedRotation !== 0) {
      img = img.rotate(normalizedRotation);
      // Tras rotar 90/270, ancho y alto se intercambian — recalcular
      // sharp.rotate() maneja esto internamente, no necesitamos ajustar manualmente
    }

    // 2. Voltear
    if (flipH) img = img.flop();  // horizontal
    if (flipV) img = img.flip();  // vertical

    // Recalcular dimensiones reales post-rotación
    const rotated  = normalizedRotation === 90 || normalizedRotation === 270;
    const realW    = rotated ? imgH : imgW;
    const realH    = rotated ? imgW : imgH;

    // 3. Crop
    if (crop && (crop.x > 0 || crop.y > 0 || crop.w < 100 || crop.h < 100)) {
      const left   = Math.round((crop.x / 100) * realW);
      const top    = Math.round((crop.y / 100) * realH);
      const width  = Math.max(1, Math.round((crop.w / 100) * realW));
      const height = Math.max(1, Math.round((crop.h / 100) * realH));

      img = img.extract({
        left:   Math.min(left,  realW - 1),
        top:    Math.min(top,   realH - 1),
        width:  Math.min(width,  realW - left),
        height: Math.min(height, realH - top),
      });
    }

    // 4. Resize
    if (resize?.width && resize?.height) {
      img = img.resize(resize.width, resize.height, { fit: "fill" });
    }

    // 5. Guardar — sobreescribir el archivo original
    await img.toFile(filePath + ".tmp");
    await fs.rename(filePath + ".tmp", filePath);

    return NextResponse.json({ success: true, url });
  } catch (err) {
    console.error("[POST /api/admin/media/edit]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}