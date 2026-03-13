// app/api/categorias/route.ts
// ─────────────────────────────────────────────────────────────
// Optimizado:
//  • Pool singleton (elimina TCP+SSL handshake por request)
//  • Caché en memoria con TTL 5 min (proceso)
//  • Cache-Control: CDN cachea 5 min, stale-while-revalidate 1 h
//
// El header ya no usa este endpoint directamente —
// las categorías llegan como prop desde el Server Component
// del layout. Este endpoint sigue activo para el footer y
// cualquier otro consumidor client-side.
// ─────────────────────────────────────────────────────────────
import { NextResponse }   from "next/server";
import { pool }           from "@/app/global/lib/db/pool";
import type { RowDataPacket } from "mysql2";

/* ── Caché en memoria del proceso (Node.js) ──────────────── */
interface CacheEntry {
  data:      RowDataPacket[];
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutos
let memCache: CacheEntry | null = null;

/* ── Handler ─────────────────────────────────────────────── */
export async function GET() {
  /* 1. Servir desde caché si no expiró */
  if (memCache && Date.now() < memCache.expiresAt) {
    return NextResponse.json(
      { success: true, data: memCache.data },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          "X-Cache":       "HIT",
        },
      }
    );
  }

  /* 2. Query a DB usando pool (sin nueva conexión TCP) */
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        c.id,
        c.nombre,
        c.slug,
        c.descripcion,
        c.imagen,
        c.parent_id,
        COUNT(DISTINCT CASE
          WHEN p.estado = 'activo' AND p.deleted_at IS NULL
          THEN p.id
        END) AS total_productos
      FROM categorias c
      LEFT JOIN producto_categorias pc ON pc.categoria_id = c.id
      LEFT JOIN productos p            ON p.id = pc.producto_id
      WHERE c.parent_id IS NULL
      GROUP BY c.id, c.nombre, c.slug, c.descripcion, c.imagen, c.parent_id
      ORDER BY c.id ASC
    `);

    /* 3. Guardar en caché de proceso */
    memCache = { data: rows, expiresAt: Date.now() + CACHE_TTL_MS };

    return NextResponse.json(
      { success: true, data: rows },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          "X-Cache":       "MISS",
        },
      }
    );
  } catch (error) {
    console.error("[/api/categorias] DB error:", error);
    return NextResponse.json(
      { success: false, error: "Error al conectar con la base de datos" },
      { status: 500 }
    );
  }
}