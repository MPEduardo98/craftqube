// app/api/admin/productos/[id]/route.ts
// ─────────────────────────────────────────────────────────────
// GET    /api/admin/productos/[id]  — Producto completo con relaciones
// PUT    /api/admin/productos/[id]  — Actualizar producto
// DELETE /api/admin/productos/[id]  — Soft delete
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                       from "@/app/global/lib/db/pool";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

type Params = { params: Promise<{ id: string }> };

/* ── GET ────────────────────────────────────────────────────── */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const productoId = Number(id);
  if (!productoId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    const [[producto]] = await pool.execute<RowDataPacket[]>(
      `SELECT p.*, m.nombre AS marca_nombre
       FROM productos p
       LEFT JOIN marcas m ON m.id = p.marca_id
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [productoId]
    );
    if (!producto) return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });

    const [variantes] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM producto_variantes WHERE producto_id = ? ORDER BY es_default DESC, id ASC",
      [productoId]
    );
    const [imagenes] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM producto_imagenes WHERE producto_id = ? AND variante_id IS NULL ORDER BY orden ASC",
      [productoId]
    );
    const [metacampos] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM producto_metacampos WHERE producto_id = ? AND variante_id IS NULL ORDER BY id ASC",
      [productoId]
    );
    const [categorias] = await pool.execute<RowDataPacket[]>(
      `SELECT c.id, c.nombre, c.slug
       FROM categorias c
       INNER JOIN producto_categorias pc ON pc.categoria_id = c.id
       WHERE pc.producto_id = ?`,
      [productoId]
    );

    return NextResponse.json({
      success: true,
      data: { ...producto, variantes, imagenes, metacampos, categorias },
    });
  } catch (err) {
    console.error("[GET /api/admin/productos/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

/* ── PUT ────────────────────────────────────────────────────── */
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const productoId = Number(id);
  if (!productoId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const {
      titulo, slug, estado,
      marca_id, descripcion_corta, descripcion_larga,
      meta_titulo, meta_descripcion,
      categorias = [], variantes = [], imagenes = [], metacampos = [],
    } = body;

    if (!titulo?.trim() || !slug?.trim()) {
      return NextResponse.json({ success: false, error: "Título y slug son requeridos" }, { status: 400 });
    }

    await conn.beginTransaction();

    // 1. Actualizar producto
    await conn.execute(
      `UPDATE productos SET
         titulo = ?, slug = ?, estado = ?, marca_id = ?,
         descripcion_corta = ?, descripcion_larga = ?,
         meta_titulo = ?, meta_descripcion = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [titulo, slug, estado, marca_id ?? null,
       descripcion_corta ?? null, descripcion_larga ?? null,
       meta_titulo ?? null, meta_descripcion ?? null,
       productoId]
    );

    // 2. Categorías: reemplazar
    await conn.execute("DELETE FROM producto_categorias WHERE producto_id = ?", [productoId]);
    for (const catId of categorias) {
      await conn.execute(
        "INSERT INTO producto_categorias (producto_id, categoria_id) VALUES (?, ?)",
        [productoId, catId]
      );
    }

    // 3. Variantes: upsert por id
    const variantesExistentes = variantes.filter((v: { id?: number }) => v.id);
    const variantesNuevas     = variantes.filter((v: { id?: number }) => !v.id);
    const idsActualizados     = variantesExistentes.map((v: { id: number }) => v.id);

    // Eliminar variantes quitadas
    if (idsActualizados.length > 0) {
      const placeholders = idsActualizados.map(() => "?").join(",");
      await conn.execute(
        `DELETE FROM producto_variantes WHERE producto_id = ? AND id NOT IN (${placeholders})`,
        [productoId, ...idsActualizados]
      );
    } else {
      await conn.execute("DELETE FROM producto_variantes WHERE producto_id = ?", [productoId]);
    }

    for (const v of variantesExistentes) {
      await conn.execute(
        `UPDATE producto_variantes SET
           sku = ?, codigo_barras = ?, precio_original = ?, precio_final = ?,
           costo = ?, stock = ?, es_default = ?, vender_sin_existencia = ?
         WHERE id = ? AND producto_id = ?`,
        [v.sku ?? "", v.codigo_barras ?? null,
         Number(v.precio_original) || 0, Number(v.precio_final) || 0,
         Number(v.costo) || 0, Number(v.stock) || 0,
         v.es_default ? 1 : 0, v.vender_sin_existencia ? 1 : 0,
         v.id, productoId]
      );
    }
    for (const v of variantesNuevas) {
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

    // 4. Imágenes: reemplazar las de producto (variante_id IS NULL)
    await conn.execute(
      "DELETE FROM producto_imagenes WHERE producto_id = ? AND variante_id IS NULL",
      [productoId]
    );
    for (const img of imagenes) {
      if (img.url?.trim()) {
        await conn.execute(
          "INSERT INTO producto_imagenes (producto_id, url, alt, orden) VALUES (?, ?, ?, ?)",
          [productoId, img.url.trim(), img.alt ?? null, Number(img.orden) || 0]
        );
      }
    }

    // 5. Metacampos: reemplazar los de producto (variante_id IS NULL)
    await conn.execute(
      "DELETE FROM producto_metacampos WHERE producto_id = ? AND variante_id IS NULL",
      [productoId]
    );
    for (const m of metacampos) {
      if (m.llave?.trim() && m.valor?.trim()) {
        await conn.execute(
          "INSERT INTO producto_metacampos (producto_id, llave, valor) VALUES (?, ?, ?)",
          [productoId, m.llave.trim(), m.valor.trim()]
        );
      }
    }

    await conn.commit();
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    await conn.rollback();
    console.error("[PUT /api/admin/productos/[id]]", err);
    const isDuplicate = (err as NodeJS.ErrnoException & { code?: string }).code === "ER_DUP_ENTRY";
    return NextResponse.json(
      { success: false, error: isDuplicate ? "El slug ya existe" : "Error al actualizar" },
      { status: isDuplicate ? 409 : 500 }
    );
  } finally {
    conn.release();
  }
}

/* ── DELETE ─────────────────────────────────────────────────── */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const productoId = Number(id);
  if (!productoId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE productos SET deleted_at = NOW(), estado = 'inactivo' WHERE id = ? AND deleted_at IS NULL",
      [productoId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/productos/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}