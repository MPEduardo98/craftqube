// app/api/admin/media/rename/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/admin/media/rename
// Renombra un archivo de imagen en el servidor
// Body: { url, productoId, nuevoNombre }
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

interface RenameBody {
  url:          string;  // nombre actual del archivo o ruta relativa
  productoId:   number;
  nuevoNombre:  string;  // nuevo nombre (con extensión)
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
    const body: RenameBody = await req.json();
    const { url, productoId, nuevoNombre } = body;

    if (!url || !productoId || !nuevoNombre) {
      return NextResponse.json(
        { success: false, error: "url, productoId y nuevoNombre son requeridos" },
        { status: 400 }
      );
    }

    const oldPath = resolveFilePath(url, productoId);
    const dir = path.dirname(oldPath);
    const newPath = path.join(dir, nuevoNombre);

    // Verificar que el archivo origen existe
    try {
      await fs.access(oldPath);
    } catch {
      return NextResponse.json(
        { success: false, error: `Archivo no encontrado: ${oldPath}` },
        { status: 404 }
      );
    }

    // Verificar que el nuevo nombre no existe ya
    try {
      await fs.access(newPath);
      return NextResponse.json(
        { success: false, error: `Ya existe un archivo con el nombre: ${nuevoNombre}` },
        { status: 409 }
      );
    } catch {
      // El archivo no existe, podemos continuar
    }

    // Renombrar el archivo
    await fs.rename(oldPath, newPath);

    // Construir la nueva URL relativa
    const newUrl = `productos/${productoId}/${nuevoNombre}`;

    return NextResponse.json({
      success: true,
      data: { url: newUrl },
    });
  } catch (err) {
    console.error("[POST /api/admin/media/rename]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}