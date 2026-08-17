// app/api/admin/media/rename/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/admin/media/rename
// Renombra y/o mueve un objeto en R2 y reapunta las referencias
// que ya estuvieran guardadas en la BD.
//
// Body: { url, nuevoNombre?, nuevoPrefix? }
//   - nuevoNombre: nombre de archivo destino (con o sin extensión).
//   - nuevoPrefix: carpeta destino ("" = raíz). Si se omite, se
//     conserva la carpeta actual.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import path                          from "path";
import { moveR2Object, r2ObjectExists, keyFromUrl } from "@/features/media/lib/r2";
import { syncMediaUrlEnBD }                        from "@/features/media/lib/syncMediaUrl";
import { normalizarPrefijo, nombreArchivoValido }  from "@/features/media/lib/paths";

interface RenameBody {
  url:          string;
  nuevoNombre?: string;
  nuevoPrefix?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { url, nuevoNombre, nuevoPrefix } = await req.json() as RenameBody;

    if (!url) {
      return NextResponse.json({ success: false, error: "url es requerida" }, { status: 400 });
    }
    if (nuevoNombre === undefined && nuevoPrefix === undefined) {
      return NextResponse.json(
        { success: false, error: "Indica un nuevo nombre o una carpeta destino" },
        { status: 400 }
      );
    }

    const viejoKey = keyFromUrl(url);
    if (!viejoKey || viejoKey.endsWith("/")) {
      return NextResponse.json({ success: false, error: "Ruta de archivo inválida" }, { status: 400 });
    }

    const nombreActual = viejoKey.split("/").pop()!;
    const ext          = path.extname(nombreActual);

    // ── Nombre destino ──
    let nombreFinal = nombreActual;
    if (nuevoNombre !== undefined) {
      const limpio = nuevoNombre.trim();
      if (!limpio) {
        return NextResponse.json({ success: false, error: "El nombre no puede estar vacío" }, { status: 400 });
      }
      // Conservar la extensión original si el usuario no la escribió.
      nombreFinal = path.extname(limpio) ? limpio : `${limpio}${ext}`;
      if (!nombreArchivoValido(nombreFinal)) {
        return NextResponse.json(
          { success: false, error: "Usa solo letras, números, guiones y puntos" },
          { status: 400 }
        );
      }
    }

    // ── Carpeta destino ──
    const carpetaActual = viejoKey.includes("/")
      ? `${viejoKey.slice(0, viejoKey.lastIndexOf("/"))}/`
      : "";
    const carpetaFinal = nuevoPrefix !== undefined ? normalizarPrefijo(nuevoPrefix) : carpetaActual;

    const nuevoKey = `${carpetaFinal}${nombreFinal}`;

    if (nuevoKey === viejoKey) {
      return NextResponse.json({ success: true, data: { url, key: viejoKey, sinCambios: true } });
    }

    if (!(await r2ObjectExists(viejoKey))) {
      return NextResponse.json({ success: false, error: "El archivo no existe en el bucket" }, { status: 404 });
    }
    if (await r2ObjectExists(nuevoKey)) {
      return NextResponse.json(
        { success: false, error: `Ya existe un archivo llamado "${nombreFinal}" en esa carpeta` },
        { status: 409 }
      );
    }

    const nuevaUrl = await moveR2Object(viejoKey, nuevoKey);

    // Reapuntar lo que ya estaba guardado para no dejar imágenes rotas.
    const sync = await syncMediaUrlEnBD(url, nuevaUrl);

    return NextResponse.json({
      success: true,
      data: {
        url:    nuevaUrl,
        key:    nuevoKey,
        nombre: nombreFinal,
        referenciasActualizadas: sync.productoImagenes + sync.categorias,
      },
    });
  } catch (err) {
    console.error("[POST /api/admin/media/rename]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
