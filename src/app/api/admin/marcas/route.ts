// app/api/admin/marcas/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/admin/marcas
// Crea una nueva marca desde el formulario de productos.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                      from "@/shared/lib/db/pool";
import { slugify }                   from "@/features/admin/productos/components/producto-form-types";
import type { ResultSetHeader }      from "mysql2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nombre = body.nombre?.trim();

    if (!nombre) {
      return NextResponse.json(
        { success: false, error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const slug = body.slug?.trim() || slugify(nombre);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO marcas (nombre, slug) VALUES (?, ?)`,
      [nombre, slug]
    );

    const id = result.insertId;

    return NextResponse.json({
      success: true,
      data: { id, nombre, slug },
    });
  } catch (err: unknown) {
    const isDuplicate =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "ER_DUP_ENTRY";

    if (isDuplicate) {
      return NextResponse.json(
        { success: false, error: "Ya existe una marca con ese nombre o slug" },
        { status: 409 }
      );
    }

    console.error("[POST /api/admin/marcas]", err);
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
