// app/api/admin/productos/variantes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool }                       from "@/shared/lib/db/pool";
import type { ResultSetHeader }       from "mysql2";

type Params = { params: Promise<{ id: string }> };

/* ── PATCH: edición rápida en línea de una variante ────────────── */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const varianteId = Number(id);
  if (!varianteId) return NextResponse.json({ success: false, error: "ID inválido" }, { status: 400 });

  const body = await req.json();
  const { nombre, precio_final, stock } = body as {
    nombre?: string; precio_final?: number; stock?: number;
  };

  const sets: string[] = [];
  const values: (string | number)[] = [];

  if (nombre !== undefined) {
    if (!nombre.trim()) return NextResponse.json({ success: false, error: "Nombre requerido" }, { status: 400 });
    sets.push("nombre = ?");
    values.push(nombre);
  }
  if (precio_final !== undefined) { sets.push("precio_final = ?"); values.push(precio_final); }
  if (stock        !== undefined) { sets.push("stock = ?");        values.push(stock); }

  if (!sets.length) return NextResponse.json({ success: false, error: "Nada que actualizar" }, { status: 400 });

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE producto_variantes SET ${sets.join(", ")} WHERE id = ?`,
      [...values, varianteId]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: "Variante no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/productos/variantes/[id]]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
