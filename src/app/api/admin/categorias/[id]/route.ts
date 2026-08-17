// app/api/admin/categorias/[id]/route.ts
import { NextRequest, NextResponse }           from "next/server";
import { pool }                                from "@/shared/lib/db/pool";
import { slugify }                             from "@/features/admin/productos/components/producto-form-types";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

type Params = { params: Promise<{ id: string }> };

/* ── GET ────────────────────────────────────────────────────── */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const categoriaId = Number(id);
  if (!categoriaId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    const [[categoria]] = await pool.execute<RowDataPacket[]>(
      "SELECT id, nombre, slug, descripcion, imagen, parent_id FROM categorias WHERE id = ?",
      [categoriaId]
    );
    if (!categoria) return NextResponse.json({ success: false, error: "Categoría no encontrada" }, { status: 404 });

    return NextResponse.json({ success: true, data: categoria });
  } catch (err) {
    console.error("[GET /api/admin/categorias/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

/* ── PUT ────────────────────────────────────────────────────── */
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const categoriaId = Number(id);
  if (!categoriaId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();
    const nombre = body.nombre?.trim();
    if (!nombre) {
      return NextResponse.json({ success: false, error: "El nombre es obligatorio" }, { status: 400 });
    }

    const slug        = body.slug?.trim() || slugify(nombre);
    const descripcion = body.descripcion?.trim() || null;
    const imagen      = body.imagen?.trim() || null;
    const parentId    = body.parent_id ? Number(body.parent_id) : null;

    if (parentId === categoriaId) {
      return NextResponse.json({ success: false, error: "Una categoría no puede ser su propia categoría padre" }, { status: 400 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE categorias SET nombre = ?, slug = ?, descripcion = ?, imagen = ?, parent_id = ? WHERE id = ?`,
      [nombre, slug, descripcion, imagen, parentId, categoriaId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { id: categoriaId, nombre, slug, descripcion, imagen, parent_id: parentId } });
  } catch (err: unknown) {
    const isDuplicate = (err as NodeJS.ErrnoException & { code?: string }).code === "ER_DUP_ENTRY";
    console.error("[PUT /api/admin/categorias/[id]]", err);
    return NextResponse.json(
      { success: false, error: isDuplicate ? "Ya existe una categoría con ese nombre o slug" : "Error al actualizar" },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}

/* ── PATCH ──────────────────────────────────────────────────── */
/* Actualización parcial: sólo toca los campos presentes en el body.
   Lo usa la edición masiva/en línea de la tabla de categorías. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const categoriaId = Number(id);
  if (!categoriaId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();
    const sets:   string[] = [];
    const values: (string | number | null)[] = [];

    if ("nombre" in body) {
      const nombre = String(body.nombre ?? "").trim();
      if (!nombre) return NextResponse.json({ success: false, error: "El nombre es obligatorio" }, { status: 400 });
      sets.push("nombre = ?"); values.push(nombre);
    }
    if ("slug" in body) {
      const slug = String(body.slug ?? "").trim();
      if (!slug) return NextResponse.json({ success: false, error: "El slug es obligatorio" }, { status: 400 });
      sets.push("slug = ?"); values.push(slug);
    }
    if ("descripcion" in body) {
      const descripcion = String(body.descripcion ?? "").trim();
      sets.push("descripcion = ?"); values.push(descripcion || null);
    }
    if ("imagen" in body) {
      const imagen = String(body.imagen ?? "").trim();
      sets.push("imagen = ?"); values.push(imagen || null);
    }
    if ("parent_id" in body) {
      const parentId = body.parent_id ? Number(body.parent_id) : null;
      if (parentId === categoriaId) {
        return NextResponse.json({ success: false, error: "Una categoría no puede ser su propia categoría padre" }, { status: 400 });
      }
      if (parentId != null) {
        // Evita ciclos: la nueva padre no puede ser descendiente de esta categoría.
        const [rows] = await pool.execute<RowDataPacket[]>("SELECT id, parent_id FROM categorias");
        const padres = new Map(rows.map(r => [Number(r.id), r.parent_id == null ? null : Number(r.parent_id)]));
        let cursor: number | null = parentId;
        const vistos = new Set<number>();
        while (cursor != null && !vistos.has(cursor)) {
          if (cursor === categoriaId) {
            return NextResponse.json({ success: false, error: "No se puede asignar una subcategoría como categoría padre" }, { status: 400 });
          }
          vistos.add(cursor);
          cursor = padres.get(cursor) ?? null;
        }
      }
      sets.push("parent_id = ?"); values.push(parentId);
    }

    if (sets.length === 0) {
      return NextResponse.json({ success: false, error: "Nada que actualizar" }, { status: 400 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE categorias SET ${sets.join(", ")} WHERE id = ?`,
      [...values, categoriaId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const isDuplicate = (err as NodeJS.ErrnoException & { code?: string }).code === "ER_DUP_ENTRY";
    console.error("[PATCH /api/admin/categorias/[id]]", err);
    return NextResponse.json(
      { success: false, error: isDuplicate ? "Ya existe una categoría con ese nombre o slug" : "Error al actualizar" },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}

/* ── DELETE ─────────────────────────────────────────────────── */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const categoriaId = Number(id);
  if (!categoriaId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  try {
    const [[{ total: subcategorias }]] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM categorias WHERE parent_id = ?",
      [categoriaId]
    );
    if (Number(subcategorias) > 0) {
      return NextResponse.json(
        { success: false, error: "No se puede eliminar: tiene subcategorías asociadas" },
        { status: 409 }
      );
    }

    const [[{ total: productos }]] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM producto_categorias WHERE categoria_id = ?",
      [categoriaId]
    );
    if (Number(productos) > 0) {
      return NextResponse.json(
        { success: false, error: "No se puede eliminar: hay productos asignados a esta categoría" },
        { status: 409 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM categorias WHERE id = ?",
      [categoriaId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/categorias/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
