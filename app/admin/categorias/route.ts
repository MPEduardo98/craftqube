// app/api/admin/categorias/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/admin/categorias
// Crea una nueva categoría desde el formulario de productos.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { pool }                      from "@/app/global/lib/db/pool";
import type { ResultSetHeader }      from "mysql2";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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
      `INSERT INTO categorias (nombre, slug) VALUES (?, ?)`,
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
        { success: false, error: "Ya existe una categoría con ese nombre o slug" },
        { status: 409 }
      );
    }

    console.error("[POST /api/admin/categorias]", err);
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}