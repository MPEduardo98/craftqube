// app/api/admin/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import path                          from "path";
import fs                            from "fs/promises";
import { writeFile }                 from "fs/promises";
import type { Dirent }               from "fs";
import { pool }                      from "@/app/global/lib/db/pool";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);

/* ── GET /api/admin/media ───────────────────────────────────── */
export async function GET(req: NextRequest) {
  const productoId = req.nextUrl.searchParams.get("productoId");

  try {
    if (productoId) {
      const dir = path.join(process.cwd(), "public", "productos", productoId);
      let entries: Dirent[] = [];
      try { entries = await fs.readdir(dir, { withFileTypes: true }) as Dirent[]; }
      catch { return NextResponse.json({ success: true, data: [] }); }

      const files = await Promise.all(
        entries
          .filter(e => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
          .map(async (e) => {
            const stat = await fs.stat(path.join(dir, e.name));
            return { url: e.name, nombre: e.name, tipo: path.extname(e.name).slice(1).toUpperCase(), tamaño: stat.size };
          })
      );
      return NextResponse.json({ success: true, data: files });
    }

    const base = path.join(process.cwd(), "public", "productos");
    const allFiles: { url: string; nombre: string; tipo: string; tamaño: number }[] = [];

    // Archivos en el root de staging (public/productos/*.ext)
    try {
      const rootEntries = await fs.readdir(base, { withFileTypes: true }) as Dirent[];
      await Promise.all(
        rootEntries
          .filter(e => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
          .map(async (e) => {
            const stat = await fs.stat(path.join(base, e.name));
            allFiles.push({
              url:    `productos/${e.name}`,
              nombre: e.name,
              tipo:   path.extname(e.name).slice(1).toUpperCase(),
              tamaño: stat.size,
            });
          })
      );
    } catch { /* carpeta no existe aún */ }

    // Archivos en subcarpetas de producto (public/productos/[id]/*.ext)
    let productoDirs: Dirent[] = [];
    try { productoDirs = await fs.readdir(base, { withFileTypes: true }) as Dirent[]; }
    catch { return NextResponse.json({ success: true, data: allFiles }); }

    await Promise.all(
      productoDirs.filter(d => d.isDirectory()).map(async (d) => {
        const dirPath = path.join(base, d.name);
        try {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });
          const images = await Promise.all(
            entries
              .filter(e => e.isFile() && IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
              .map(async (e) => {
                const stat = await fs.stat(path.join(dirPath, e.name));
                return { url: `productos/${d.name}/${e.name}`, nombre: e.name, tipo: path.extname(e.name).slice(1).toUpperCase(), tamaño: stat.size };
              })
          );
          allFiles.push(...images);
        } catch { /* carpeta vacía o sin permisos */ }
      })
    );

    return NextResponse.json({ success: true, data: allFiles });
  } catch (err) {
    console.error("[GET /api/admin/media]", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Error interno" }, { status: 500 });
  }
}

/* ── POST /api/admin/media ──────────────────────────────────── */
// Sube siempre a public/productos/ (staging). El movimiento a public/productos/[id]/
// ocurre cuando se guarda el producto.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ success: false, error: "No se recibió archivo" }, { status: 400 });

    const ext = path.extname(file.name).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return NextResponse.json({ success: false, error: "Tipo de archivo no permitido" }, { status: 400 });

    const stagingDir = path.join(process.cwd(), "public", "productos");
    await fs.mkdir(stagingDir, { recursive: true });

    const baseName = path.basename(file.name, ext).replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const fileName = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(stagingDir, fileName);

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    const stat = await fs.stat(filePath);

    return NextResponse.json({
      success: true,
      data: {
        url:    `productos/${fileName}`,
        nombre: fileName,
        tipo:   ext.slice(1).toUpperCase(),
        tamaño: stat.size,
      },
    });
  } catch (err) {
    console.error("[POST /api/admin/media]", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Error interno" }, { status: 500 });
  }
}

/* ── DELETE /api/admin/media ────────────────────────────────── */
// Body: { url: "productos/2/imagen.png" }
export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string };

    if (!url) return NextResponse.json({ success: false, error: "url requerida" }, { status: 400 });

    const normalized = url.replace(/\\/g, "/").replace(/^\//, "");
    const filePath   = path.join(process.cwd(), "public", normalized);

    const publicProductos = path.join(process.cwd(), "public", "productos");
    if (!filePath.startsWith(publicProductos)) {
      return NextResponse.json({ success: false, error: "Ruta no permitida" }, { status: 403 });
    }

    try {
      await fs.unlink(filePath);
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") {
        return NextResponse.json({ success: false, error: "No se pudo eliminar el archivo" }, { status: 500 });
      }
    }

    const fileName = path.basename(normalized);
    await pool.execute(
      `DELETE FROM producto_imagenes WHERE url = ? OR url LIKE ?`,
      [url, `%/${fileName}`]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/media]", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Error interno" }, { status: 500 });
  }
}