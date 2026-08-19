// app/api/cart/validar/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/cart/validar
//
// Dice cuáles de unos `variante_id` se pueden comprar hoy. El
// carrito vive en localStorage y guarda un snapshot (título,
// precio, imagen), así que se sigue pintando perfecto aunque la
// variante haya desaparecido de la BD — y el comprador no se
// entera hasta el paso de pago, donde `calcularTotales` corta con
// "Uno de los productos ya no está disponible" sin decir cuál.
//
// Con esto el carrito se limpia al cargarse, no al final.
//
// Sólo comprueba existencia y que el producto siga activo. El
// stock NO se filtra aquí: ese error sí nombra el producto y la
// cantidad, y el comprador puede querer dejarlo en el carrito.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket }        from "mysql2";
import { pool }                      from "@/shared/lib/db/pool";
import { consumirLimite, ipDeRequest } from "@/shared/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Tope defensivo: un carrito real no tiene cientos de líneas. */
const MAX_IDS = 100;

export async function POST(req: NextRequest) {
  const limite = consumirLimite(`cart-validar:${ipDeRequest(req)}`, 60, 60_000);
  if (!limite.permitido) {
    return NextResponse.json(
      { success: false, error: "Demasiadas peticiones." },
      { status: 429, headers: { "Retry-After": String(limite.esperaSegundos) } }
    );
  }

  try {
    const body = await req.json();
    const ids = (Array.isArray(body.variante_ids) ? body.variante_ids : [])
      .map((v: unknown) => Number(v))
      .filter((n: number) => Number.isInteger(n) && n > 0)
      .slice(0, MAX_IDS);

    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: { validos: [] } });
    }

    const placeholders = ids.map(() => "?").join(",");
    const [filas] = await pool.execute<RowDataPacket[]>(
      `SELECT pv.id
         FROM producto_variantes pv
         INNER JOIN productos p ON p.id = pv.producto_id
        WHERE pv.id IN (${placeholders})
          AND p.estado = 'activo'
          AND p.deleted_at IS NULL`,
      ids
    );

    return NextResponse.json({
      success: true,
      data: { validos: filas.map((f) => Number(f.id)) },
    });
  } catch (err) {
    console.error("[POST /api/cart/validar]", err);
    // Ante la duda no se toca el carrito: quien llama trata la
    // ausencia de respuesta como "no puedo saberlo, déjalo estar".
    return NextResponse.json(
      { success: false, error: "No se pudo validar el carrito" },
      { status: 500 }
    );
  }
}
