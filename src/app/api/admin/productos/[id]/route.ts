// app/api/admin/productos/[id]/route.ts
import { NextRequest, NextResponse }                  from "next/server";
import { pool }                                       from "@/shared/lib/db/pool";
import type { RowDataPacket, ResultSetHeader }        from "mysql2";
import {
  syncProductoEnvio,
  syncVarianteAtributos,
  syncVarianteMetacampos,
  syncVarianteImagen,
}                                                     from "@/features/admin/productos/lib/variante-sync";

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

    const [variantes]  = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM producto_variantes WHERE producto_id = ? ORDER BY es_default DESC, id ASC",
      [productoId]
    );
    const [imagenes]   = await pool.execute<RowDataPacket[]>(
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
      titulo, slug, estado, marca_id, descripcion,
      meta_titulo, meta_descripcion,
      categorias = [], variantes = [], imagenes = [], metacampos = [], envio = null,
    } = body;

    if (!titulo?.trim() || !slug?.trim()) {
      return NextResponse.json({ success: false, error: "Título y slug son requeridos" }, { status: 400 });
    }

    const marcaId = marca_id ? Number(marca_id) : null;

    await conn.beginTransaction();

    // 1. Producto
    await conn.execute(
      `UPDATE productos SET
         titulo = ?, slug = ?, estado = ?, marca_id = ?, descripcion = ?,
         meta_titulo = ?, meta_descripcion = ?, updated_at = NOW()
       WHERE id = ?`,
      [titulo, slug, estado, marcaId, descripcion ?? null,
       meta_titulo ?? null, meta_descripcion ?? null, productoId]
    );

    // 2. Categorías
    await conn.execute("DELETE FROM producto_categorias WHERE producto_id = ?", [productoId]);
    for (const catId of categorias) {
      await conn.execute("INSERT INTO producto_categorias (producto_id, categoria_id) VALUES (?, ?)", [productoId, catId]);
    }

    // 3. Variantes (+ dimensiones, atributos y metacampos por variante)
    const variantesExistentes = variantes.filter((v: { id?: number }) => v.id);
    const variantesNuevas     = variantes.filter((v: { id?: number }) => !v.id);
    const idsActualizados     = variantesExistentes.map((v: { id: number }) => v.id);

    // Eliminar variantes que ya no están, junto con sus filas hijas
    const [variantesActuales] = await conn.execute<RowDataPacket[]>(
      "SELECT id FROM producto_variantes WHERE producto_id = ?", [productoId]
    );
    const idsAEliminar = variantesActuales
      .map((r) => r.id as number)
      .filter((vid) => !idsActualizados.includes(vid));
    for (const delId of idsAEliminar) {
      await conn.execute("DELETE FROM variante_valores   WHERE variante_id = ?", [delId]);
      await conn.execute("DELETE FROM producto_metacampos WHERE variante_id = ?", [delId]);
      await conn.execute("DELETE FROM producto_imagenes   WHERE variante_id = ?", [delId]);
      await conn.execute("DELETE FROM producto_variantes  WHERE id = ? AND producto_id = ?", [delId, productoId]);
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
      await syncVarianteAtributos(conn, v.id, v.atributos ?? []);
      await syncVarianteMetacampos(conn, productoId, v.id, v.metacampos ?? []);
      await syncVarianteImagen(conn, productoId, v.id, v.imagen, v.nombre);
    }

    for (const v of variantesNuevas) {
      const [varRes] = await conn.execute<ResultSetHeader>(
        `INSERT INTO producto_variantes
           (producto_id, sku, codigo_barras, precio_original, precio_final, costo, stock, es_default, vender_sin_existencia)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [productoId, v.sku ?? "", v.codigo_barras ?? null,
         Number(v.precio_original) || 0, Number(v.precio_final) || 0,
         Number(v.costo) || 0, Number(v.stock) || 0,
         v.es_default ? 1 : 0, v.vender_sin_existencia ? 1 : 0]
      );
      const varianteId = varRes.insertId;
      await syncVarianteAtributos(conn, varianteId, v.atributos ?? []);
      await syncVarianteMetacampos(conn, productoId, varianteId, v.metacampos ?? []);
      await syncVarianteImagen(conn, productoId, varianteId, v.imagen, v.nombre);
    }

    // Envío (a nivel producto)
    await syncProductoEnvio(conn, productoId, envio);

    // 4. Imágenes — guarda la URL tal cual (R2 completa o nombre local)
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

    // 5. Metacampos
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

/* ── PATCH: edición rápida en línea (titulo, estado, precio, stock) ── */
const ESTADOS_VALIDOS = new Set(["activo", "inactivo", "borrador"]);

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const productoId = Number(id);
  if (!productoId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  const body = await req.json();
  const { titulo, estado, precio, stock } = body as {
    titulo?: string; estado?: string; precio?: number | null; stock?: number;
  };

  const sets: string[] = [];
  const values: (string)[] = [];

  if (titulo !== undefined) {
    if (!titulo.trim()) return NextResponse.json({ success: false, error: "Título requerido" }, { status: 400 });
    sets.push("titulo = ?");
    values.push(titulo);
  }
  if (estado !== undefined) {
    if (!ESTADOS_VALIDOS.has(estado)) return NextResponse.json({ success: false, error: "Estado inválido" }, { status: 400 });
    sets.push("estado = ?");
    values.push(estado);
  }

  try {
    if (sets.length) {
      sets.push("updated_at = NOW()");
      await pool.execute(
        `UPDATE productos SET ${sets.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
        [...values, productoId]
      );
    }

    if (precio !== undefined || stock !== undefined) {
      const [variantes] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM producto_variantes WHERE producto_id = ?",
        [productoId]
      );
      if (variantes.length === 0) {
        return NextResponse.json({ success: false, error: "El producto no tiene variantes" }, { status: 400 });
      }
      if (variantes.length > 1) {
        return NextResponse.json({ success: false, error: "MULTIPLE_VARIANTES" }, { status: 409 });
      }

      const varSets: string[] = [];
      const varValues: number[] = [];
      if (precio !== undefined) { varSets.push("precio_final = ?"); varValues.push(precio ?? 0); }
      if (stock  !== undefined) { varSets.push("stock = ?");        varValues.push(stock); }

      await pool.execute(
        `UPDATE producto_variantes SET ${varSets.join(", ")} WHERE id = ?`,
        [...varValues, variantes[0].id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/productos/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
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