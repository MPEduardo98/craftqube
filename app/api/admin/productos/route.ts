// app/api/admin/productos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool }                       from "@/app/global/lib/db/pool";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import path from "path";
import fs   from "fs/promises";

/* ── Mueve imágenes staged a la carpeta del producto ─────────
   staged URL:  "productos/filename.ext"        (2 segmentos)
   product URL: "productos/[id]/filename.ext"   (3 segmentos)
   ─────────────────────────────────────────────────────────── */
async function moveStaged(
  imagenes: { url: string; alt?: string | null; orden?: number }[],
  productoId: number
): Promise<{ url: string; alt?: string | null; orden?: number }[]> {
  const destDir = path.join(process.cwd(), "public", "productos", String(productoId));
  await fs.mkdir(destDir, { recursive: true });

  return Promise.all(
    imagenes
      .filter(img => img.url?.trim())
      .map(async (img) => {
        const rawUrl = img.url.trim();
        const parts  = rawUrl.replace(/^\//, "").split("/");

        if (parts.length === 2 && parts[0] === "productos") {
          const filename = parts[1];
          const srcPath  = path.join(process.cwd(), "public", "productos", filename);
          const destPath = path.join(destDir, filename);
          try { await fs.rename(srcPath, destPath); } catch { /* ya movido o no existe */ }
          return { ...img, url: `productos/${productoId}/${filename}` };
        }

        return img;
      })
  );
}

/* ── POST — crear producto ──────────────────────────────────── */
export async function POST(req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const {
      titulo, slug, estado,
      marca_id, descripcion,
      meta_titulo, meta_descripcion,
      categorias = [], variantes = [], imagenes = [], metacampos = [],
    } = body;

    if (!titulo?.trim() || !slug?.trim()) {
      return NextResponse.json({ success: false, error: "Título y slug son requeridos" }, { status: 400 });
    }

    await conn.beginTransaction();

    // 1. Insertar producto
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO productos
         (titulo, slug, estado, marca_id, descripcion, meta_titulo, meta_descripcion, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [titulo, slug, estado ?? "borrador", marca_id ?? null,
       descripcion ?? null,
       meta_titulo ?? null, meta_descripcion ?? null]
    );
    const productoId = result.insertId;

    // 2. Categorías
    for (const catId of categorias) {
      await conn.execute(
        "INSERT INTO producto_categorias (producto_id, categoria_id) VALUES (?, ?)",
        [productoId, catId]
      );
    }

    // 3. Variantes
    for (const v of variantes) {
      await conn.execute(
        `INSERT INTO producto_variantes
           (producto_id, sku, codigo_barras, precio_original, precio_final, costo, stock, es_default, vender_sin_existencia)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [productoId, v.sku ?? "", v.codigo_barras ?? null,
         Number(v.precio_original) || 0, Number(v.precio_final) || 0,
         Number(v.costo) || 0, Number(v.stock) || 0,
         v.es_default ? 1 : 0, v.vender_sin_existencia ? 1 : 0]
      );
    }

    // 4. Imágenes: mover staged → [id]/ y luego insertar con URLs definitivas
    const finalImagenes = await moveStaged(imagenes, productoId);
    for (const img of finalImagenes) {
      await conn.execute(
        "INSERT INTO producto_imagenes (producto_id, url, alt, orden) VALUES (?, ?, ?, ?)",
        [productoId, img.url, img.alt ?? null, Number(img.orden) || 0]
      );
    }

    // 5. Metacampos
    for (const m of metacampos) {
      if (m.llave?.trim() && m.valor?.trim()) {
        await conn.execute(
          "INSERT INTO producto_metacampos (producto_id, llave, valor) VALUES (?, ?, ?)",
          [productoId, m.llave.trim(), m.valor.trim()]
        );
      }
    }

    await conn.commit();
    return NextResponse.json({ success: true, data: { id: productoId } }, { status: 201 });
  } catch (err: unknown) {
    await conn.rollback();
    console.error("[POST /api/admin/productos]", err);
    const isDuplicate = (err as NodeJS.ErrnoException & { code?: string }).code === "ER_DUP_ENTRY";
    return NextResponse.json(
      { success: false, error: isDuplicate ? "El slug ya existe" : "Error al crear producto" },
      { status: isDuplicate ? 409 : 500 }
    );
  } finally {
    conn.release();
  }
}