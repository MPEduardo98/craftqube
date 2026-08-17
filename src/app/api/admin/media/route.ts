// app/api/admin/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import path                          from "path";
import {
  uploadToR2,
  deleteFromR2,
  listR2Level,
  createR2Folder,
  keyFromUrl,
  R2_PUBLIC_URL,
}                                    from "@/features/media/lib/r2";
import { normalizarPrefijo, nombreCarpetaValido } from "@/features/media/lib/paths";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const CONTENT_TYPES: Record<string, string> = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
  ".gif":  "image/gif",
  ".avif": "image/avif",
};

/* ── GET /api/admin/media?prefix=categorias/ ────────────────── */
// Navega el bucket por niveles, como un explorador de archivos.
export async function GET(req: NextRequest) {
  try {
    const prefix = normalizarPrefijo(req.nextUrl.searchParams.get("prefix"));
    const { folders, files } = await listR2Level(prefix);

    return NextResponse.json({
      success: true,
      data: {
        prefix,
        folders: folders.map((full) => ({
          prefix: full,
          nombre: full.slice(prefix.length).replace(/\/$/, ""),
        })),
        files: files.map(({ key, size, lastModified }) => {
          const nombre = key.split("/").pop() ?? key;
          const ext    = path.extname(nombre).toLowerCase();
          return {
            url:      `${R2_PUBLIC_URL}/${key}`,
            key,
            nombre,
            tipo:     ext.slice(1).toUpperCase(),
            tamaño:   size,
            modificado: lastModified?.toISOString() ?? null,
          };
        }),
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/media]", err);
    return NextResponse.json({ success: false, error: "Error al listar archivos" }, { status: 500 });
  }
}

/* ── PUT /api/admin/media — crear carpeta ───────────────────── */
// Body: { prefix?: string, nombre: string }
export async function PUT(req: NextRequest) {
  try {
    const { prefix, nombre } = await req.json() as { prefix?: string; nombre?: string };
    const limpio = nombre?.trim() ?? "";

    if (!limpio) {
      return NextResponse.json({ success: false, error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (!nombreCarpetaValido(limpio)) {
      return NextResponse.json(
        { success: false, error: "Usa solo letras, números, guiones y puntos" },
        { status: 400 }
      );
    }

    const base     = normalizarPrefijo(prefix);
    const nuevoPfx = `${base}${limpio}/`;

    // Si ya hay algo colgando de ese prefijo, la carpeta existe.
    const { folders, files } = await listR2Level(base);
    if (folders.includes(nuevoPfx) || files.some((f) => f.key === nuevoPfx)) {
      return NextResponse.json({ success: false, error: "Ya existe una carpeta con ese nombre" }, { status: 409 });
    }

    await createR2Folder(nuevoPfx);

    return NextResponse.json({ success: true, data: { prefix: nuevoPfx, nombre: limpio } });
  } catch (err) {
    console.error("[PUT /api/admin/media]", err);
    return NextResponse.json({ success: false, error: "Error al crear la carpeta" }, { status: 500 });
  }
}

/* ── POST /api/admin/media ──────────────────────────────────── */
// Sube directo a R2 → devuelve URL pública definitiva.
// No staging, no movimiento posterior al guardar.
// Campo opcional "prefix" del FormData: carpeta destino.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ success: false, error: "No se recibió archivo" }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return NextResponse.json({ success: false, error: "Tipo de archivo no permitido" }, { status: 400 });

    // Sin carpeta explícita se mantiene el destino histórico: productos/.
    const prefixRaw = formData.get("prefix");
    const prefix    = typeof prefixRaw === "string" ? normalizarPrefijo(prefixRaw) : "productos/";

    const baseName  = path.basename(file.name, ext).replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const fileName  = `${baseName}_${Date.now()}${ext}`;
    const key       = `${prefix}${fileName}`;
    const buffer    = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadToR2(key, buffer, CONTENT_TYPES[ext] ?? "application/octet-stream");

    return NextResponse.json({
      success: true,
      data: { url: publicUrl, key, nombre: fileName, tipo: ext.slice(1).toUpperCase(), tamaño: buffer.byteLength },
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
    // Con carpetas libres ya no se restringe a "productos/", pero sí se
    // bloquean rutas con escapes o vacías.
    if (!key || key.includes("..") || key.startsWith("/")) {
      return NextResponse.json({ success: false, error: "Ruta no permitida" }, { status: 403 });
    }

    await deleteFromR2(key);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/media]", err);
    return NextResponse.json({ success: false, error: "Error al eliminar" }, { status: 500 });
  }
}