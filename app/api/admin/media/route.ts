// app/api/admin/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import path                          from "path";
import fs                            from "fs/promises";
import { writeFile }                 from "fs/promises";
import type { Dirent }               from "fs";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);

/* ── GET /api/admin/media?productoId=X ─────────────────────── */
export async function GET(req: NextRequest) {
  const productoId = req.nextUrl.searchParams.get("productoId");

  try {
    if (productoId) {
      const dir = path.join(process.cwd(), "public", "productos", productoId);
      let entries: Dirent[] = [];
      try {
        entries = await fs.readdir(dir, { withFileTypes: true }) as Dirent[];
      } catch {
        return NextResponse.json({ success: true, data: [] });
      }

      const files = await Promise.all(
        entries
          .filter(e => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
          .map(async (e) => {
            const stat = await fs.stat(path.join(dir, e.name));
            return {
              url:    e.name,
              nombre: e.name,
              tipo:   path.extname(e.name).slice(1).toUpperCase(),
              tamaño: stat.size,
            };
          })
      );

      return NextResponse.json({ success: true, data: files });
    }

    // Sin productoId: recorre todas las subcarpetas de /public/productos/
    const base = path.join(process.cwd(), "public", "productos");
    let productoDirs: Dirent[] = [];
    try {
      productoDirs = await fs.readdir(base, { withFileTypes: true }) as Dirent[];
    } catch {
      return NextResponse.json({ success: true, data: [] });
    }

    const allFiles: { url: string; nombre: string; tipo: string; tamaño: number }[] = [];

    await Promise.all(
      productoDirs
        .filter(d => d.isDirectory())
        .map(async (d) => {
          const dirPath = path.join(base, d.name);
          try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            const images = await Promise.all(
              entries
                .filter(e => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
                .map(async (e) => {
                  const stat = await fs.stat(path.join(dirPath, e.name));
                  return {
                    url:    `productos/${d.name}/${e.name}`,
                    nombre: e.name,
                    tipo:   path.extname(e.name).slice(1).toUpperCase(),
                    tamaño: stat.size,
                  };
                })
            );
            allFiles.push(...images);
          } catch { /* carpeta vacía o sin permisos */ }
        })
    );

    return NextResponse.json({ success: true, data: allFiles });
  } catch (err) {
    console.error("[GET /api/admin/media]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}

/* ── POST /api/admin/media ──────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const formData   = await req.formData();
    const file       = formData.get("file") as File | null;
    const productoId = formData.get("productoId") as string | null;

    if (!file)       return NextResponse.json({ success: false, error: "No se recibió archivo" }, { status: 400 });
    if (!productoId) return NextResponse.json({ success: false, error: "productoId requerido" },  { status: 400 });

    const ext = path.extname(file.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) {
      return NextResponse.json({ success: false, error: "Tipo de archivo no permitido" }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "productos", productoId);
    await fs.mkdir(dir, { recursive: true });

    const baseName = path.basename(file.name, ext).replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const fileName = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(dir, fileName);

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    const stat = await fs.stat(filePath);

    return NextResponse.json({
      success: true,
      data: {
        url:    fileName,
        nombre: fileName,
        tipo:   ext.slice(1).toUpperCase(),
        tamaño: stat.size,
      },
    });
  } catch (err) {
    console.error("[POST /api/admin/media]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}