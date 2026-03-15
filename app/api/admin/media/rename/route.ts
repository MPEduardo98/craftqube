// app/api/admin/media/rename/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/admin/media/rename
// Renombra un archivo de imagen en el servidor Y actualiza la BD
// Body: { url, productoId, nuevoNombre }
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { pool } from "@/app/global/lib/db/pool";

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

    // Renombrar el archivo físico
    await fs.rename(oldPath, newPath);

    // Actualizar la base de datos - SOLO guardar el nombre del archivo
    // Extraer el nombre del archivo de la URL original
    const oldFileName = url.split("/").pop() || url;
    
    try {
      await pool.execute(
        `UPDATE producto_imagenes 
         SET url = ? 
         WHERE producto_id = ? 
         AND (url = ? OR url LIKE ?)`,
        [nuevoNombre, productoId, url, `%/${oldFileName}`]
      );
      
      console.log(`[rename] BD actualizada: ${url} → ${nuevoNombre} para producto ${productoId}`);
    } catch (dbError) {
      console.error("[rename] Error actualizando BD:", dbError);
      // Si falla la BD, intentar revertir el cambio de archivo
      try {
        await fs.rename(newPath, oldPath);
      } catch {
        console.error("[rename] No se pudo revertir el cambio de archivo");
      }
      return NextResponse.json(
        { success: false, error: "Error al actualizar la base de datos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { url: nuevoNombre },
    });
  } catch (err) {
    console.error("[POST /api/admin/media/rename]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}