// app/api/productos/[slug]/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  let connection;

  try {
    connection = await mysql.createConnection({
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port:     Number(process.env.DB_PORT) || 3306,
      ssl:      { rejectUnauthorized: false },
    });

    // ── Producto base ──────────────────────────────────────────────────
    const [productoRows] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        p.id,
        p.titulo,
        p.descripcion_corta,
        p.descripcion_larga,
        p.slug,
        p.estado,
        p.meta_titulo,
        p.meta_descripcion,
        p.created_at,
        p.updated_at,
        m.id        AS marca_id,
        m.nombre    AS marca,
        m.slug      AS marca_slug,
        m.logo_url  AS marca_logo
      FROM productos p
      LEFT JOIN marcas m ON m.id = p.marca_id
      WHERE p.slug = ? AND p.estado = 'activo' AND p.deleted_at IS NULL
      LIMIT 1
    `, [slug]);

    if (productoRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    const producto = productoRows[0];

    // ── Categorías ────────────────────────────────────────────────────
    const [categorias] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT c.id, c.nombre, c.slug
      FROM categorias c
      INNER JOIN producto_categorias pc ON pc.categoria_id = c.id
      WHERE pc.producto_id = ?
    `, [producto.id]);

    // ── Imágenes ──────────────────────────────────────────────────────
    const [imagenes] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT id, url, alt, orden, variante_id
      FROM producto_imagenes
      WHERE producto_id = ?
      ORDER BY orden ASC, id ASC
    `, [producto.id]);

    // ── Variantes con atributos y dimensiones ─────────────────────────
    const [variantes] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        v.id,
        v.sku,
        v.codigo_barras,
        v.precio_original,
        v.precio_final,
        v.stock,
        v.es_default,
        v.vender_sin_existencia,
        d.largo, d.ancho, d.alto, d.peso,
        d.medida_unidad, d.peso_unidad
      FROM producto_variantes v
      LEFT JOIN producto_dimensiones d ON d.variante_id = v.id
      WHERE v.producto_id = ?
      ORDER BY v.es_default DESC, v.id ASC
    `, [producto.id]);

    // ── Atributos por variante ────────────────────────────────────────
    const [varianteAtributos] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT
        vv.variante_id,
        a.id   AS atributo_id,
        a.nombre AS atributo,
        av.id  AS valor_id,
        av.valor
      FROM variante_valores vv
      INNER JOIN atributos_valores av ON av.id = vv.atributo_valor_id
      INNER JOIN atributos a          ON a.id  = av.atributo_id
      WHERE vv.variante_id IN (
        SELECT id FROM producto_variantes WHERE producto_id = ?
      )
      ORDER BY a.id ASC, av.id ASC
    `, [producto.id]);

    // ── Metacampos ────────────────────────────────────────────────────
    const [metacampos] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT id, variante_id, llave, valor
      FROM producto_metacampos
      WHERE producto_id = ?
      ORDER BY id ASC
    `, [producto.id]);

    // ── Etiquetas ─────────────────────────────────────────────────────
    const [etiquetas] = await connection.execute<mysql.RowDataPacket[]>(`
      SELECT e.id, e.nombre, e.slug, e.tipo
      FROM etiquetas e
      INNER JOIN producto_etiquetas pe ON pe.etiqueta_id = e.id
      WHERE pe.producto_id = ?
    `, [producto.id]);

    // ── Agrupar atributos por variante ────────────────────────────────
    const atributosPorVariante: Record<number, { atributo_id: number; atributo: string; valor_id: number; valor: string }[]> = {};
    for (const row of varianteAtributos as mysql.RowDataPacket[]) {
      if (!atributosPorVariante[row.variante_id]) {
        atributosPorVariante[row.variante_id] = [];
      }
      atributosPorVariante[row.variante_id].push({
        atributo_id: row.atributo_id,
        atributo:    row.atributo,
        valor_id:    row.valor_id,
        valor:       row.valor,
      });
    }

    const variantesCompletas = (variantes as mysql.RowDataPacket[]).map((v) => ({
      ...v,
      atributos: atributosPorVariante[v.id] || [],
      metacampos: (metacampos as mysql.RowDataPacket[]).filter((m) => m.variante_id === v.id),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...producto,
        categorias,
        imagenes,
        variantes:  variantesCompletas,
        metacampos: (metacampos as mysql.RowDataPacket[]).filter((m) => m.variante_id === null),
        etiquetas,
      },
    });
  } catch (error) {
    console.error(`[/api/productos/${slug}] DB error:`, error);
    return NextResponse.json(
      { success: false, error: "Error al conectar con la base de datos" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}