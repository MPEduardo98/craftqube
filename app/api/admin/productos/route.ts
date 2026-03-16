// app/api/admin/productos/route.ts
import { NextRequest, NextResponse }          from "next/server";
import { pool }                               from "@/app/global/lib/db/pool";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

/* ── GET /api/admin/productos — listado paginado ────────────── */
export async function GET(req: NextRequest) {
  const sp     = req.nextUrl.searchParams;
  const q      = sp.get("q")?.trim()      ?? "";
  const estado = sp.get("estado")?.trim() ?? "";
  const page   = Math.max(1, Number(sp.get("page")  ?? 1));
  const limit  = Math.min(100, Math.max(1, Number(sp.get("limit") ?? 20)));
  const offset = (page - 1) * limit;

  try {
    const conditions: string[]            = ["p.deleted_at IS NULL"];
    const values:     (string | number)[] = [];

    if (q) {
      conditions.push("(p.titulo LIKE ? OR p.slug LIKE ? OR p.id = ?)");
      values.push(`%${q}%`, `%${q}%`, Number(q) || 0);
    }
    if (estado) {
      conditions.push("p.estado = ?");
      values.push(estado);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const [[countRow]] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM productos p ${where}`,
      values
    );
    const total = Number(countRow.total);

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT
         p.id, p.titulo, p.slug, p.estado, p.updated_at,
         m.nombre AS marca,
         (SELECT pi.url FROM producto_imagenes pi
          WHERE pi.producto_id = p.id AND pi.variante_id IS NULL
          ORDER BY pi.orden ASC LIMIT 1) AS imagen_nombre,
         (SELECT pv.precio_final FROM producto_variantes pv
          WHERE pv.producto_id = p.id
          ORDER BY pv.es_default DESC, pv.id ASC LIMIT 1) AS precio,
         (SELECT COALESCE(SUM(pv2.stock),0) FROM producto_variantes pv2
          WHERE pv2.producto_id = p.id) AS stock
       FROM productos p
       LEFT JOIN marcas m ON m.id = p.marca_id
       ${where}
       ORDER BY p.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data:    rows,
      meta:    { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (err) {
    console.error("[GET /api/admin/productos]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

/* ── POST /api/admin/productos — crear producto ─────────────── */
export async function POST(req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const {
      titulo, slug, estado = "borrador",
      marca_id, descripcion_corta, descripcion_larga,
      meta_titulo, meta_descripcion,
      categorias = [], variantes = [], imagenes = [], metacampos = [],
    } = body;

    if (!titulo?.trim())   return NextResponse.json({ success: false, error: "El título es obligatorio" },        { status: 400 });
    if (!slug?.trim())     return NextResponse.json({ success: false, error: "El slug es obligatorio" },          { status: 400 });
    if (!variantes.length) return NextResponse.json({ success: false, error: "Debe haber al menos una variante" }, { status: 400 });

    await conn.beginTransaction();

    /* 1. Producto */
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO productos
         (titulo, slug, estado, marca_id,
          descripcion_corta, descripcion_larga,
          meta_titulo, meta_descripcion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo.trim(),
        slug.trim(),
        estado,
        marca_id ? Number(marca_id) : null,
        descripcion_corta?.trim()  || null,
        descripcion_larga?.trim()  || null,
        meta_titulo?.trim()        || null,
        meta_descripcion?.trim()   || null,
      ]
    );
    const productoId = result.insertId;

    /* 2. Categorías */
    for (const catId of categorias) {
      await conn.execute(
        "INSERT INTO producto_categorias (producto_id, categoria_id) VALUES (?, ?)",
        [productoId, Number(catId)]
      );
    }

    /* 3. Variantes */
    for (const v of variantes) {
      await conn.execute(
        `INSERT INTO producto_variantes
           (producto_id, sku, codigo_barras,
            precio_original, precio_final, costo, stock,
            es_default, vender_sin_existencia)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productoId,
          v.sku?.trim()           ?? "",
          v.codigo_barras?.trim() || null,
          Number(v.precio_original) || 0,
          Number(v.precio_final)    || 0,
          Number(v.costo)           || 0,
          Number(v.stock)           || 0,
          v.es_default            ? 1 : 0,
          v.vender_sin_existencia ? 1 : 0,
        ]
      );
    }

    /* 4. Imágenes */
    for (const img of imagenes) {
      const urlTrimmed = img.url?.trim();
      if (urlTrimmed) {
        await conn.execute(
          "INSERT INTO producto_imagenes (producto_id, url, alt, orden) VALUES (?, ?, ?, ?)",
          [productoId, urlTrimmed, img.alt?.trim() || null, Number(img.orden) || 0]
        );
      }
    }

    /* 5. Metacampos */
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
    const isDuplicate = (err as { code?: string }).code === "ER_DUP_ENTRY";
    return NextResponse.json(
      {
        success: false,
        error: isDuplicate
          ? "El slug ya existe, usa uno diferente"
          : `Error: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: isDuplicate ? 409 : 500 }
    );
  } finally {
    conn.release();
  }
}