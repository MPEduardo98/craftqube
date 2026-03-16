// app/api/admin/media/route.ts
import { NextRequest, NextResponse }                                            from "next/server";
import path                                                                     from "path";
import { uploadToR2, deleteFromR2, listR2Objects, keyFromUrl, R2_PUBLIC_URL }  from "@/app/global/lib/r2";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const CONTENT_TYPES: Record<string, string> = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".gif":  "image/gif",
  ".avif": "image/avif",
};

/* ── GET /api/admin/media ───────────────────────────────────── */
export async function GET() {
  try {
    const objects = await listR2Objects("productos/");
    const files   = objects.filter(({ key }) => !key.endsWith("/")).map(({ key, size }) => {
      const nombre = key.split("/").pop() ?? key;
      const ext    = path.extname(nombre).toLowerCase();
      return {
        url:    `${R2_PUBLIC_URL}/${key}`,
        nombre,
        tipo:   ext.slice(1).toUpperCase(),
        tamaño: size,
      };
    });
    return NextResponse.json({ success: true, data: files });
  } catch (err) {
    console.error("[GET /api/admin/media]", err);
    return NextResponse.json({ success: false, error: "Error al listar archivos" }, { status: 500 });
  }
}

/* ── POST /api/admin/media ──────────────────────────────────── */
// Sube directo a R2 → devuelve URL pública definitiva.
// No staging, no movimiento posterior al guardar.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ success: false, error: "No se recibió archivo" }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return NextResponse.json({ success: false, error: "Tipo de archivo no permitido" }, { status: 400 });

    const baseName  = path.basename(file.name, ext).replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const fileName  = `${baseName}_${Date.now()}${ext}`;
    const key       = `productos/${fileName}`;
    const buffer    = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToR2(key, buffer, CONTENT_TYPES[ext] ?? "application/octet-stream");

    return NextResponse.json({
      success: true,
      data: { url: publicUrl, nombre: fileName, tipo: ext.slice(1).toUpperCase(), tamaño: buffer.byteLength },
    });
  } catch (err) {
    console.error("[POST /api/admin/media]", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Error interno" }, { status: 500 });
  }
}

/* ── DELETE /api/admin/media ────────────────────────────────── */
// Body: { url: "https://pub-xxx.r2.dev/productos/filename.ext" }
export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string };
    if (!url) return NextResponse.json({ success: false, error: "url requerida" }, { status: 400 });

    const key = keyFromUrl(url);
    if (!key.startsWith("productos/")) {
      return NextResponse.json({ success: false, error: "Ruta no permitida" }, { status: 403 });
    }

    await deleteFromR2(key);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/media]", err);
    return NextResponse.json({ success: false, error: "Error al eliminar" }, { status: 500 });
  }
}