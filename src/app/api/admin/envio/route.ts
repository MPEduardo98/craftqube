// app/api/admin/envio/route.ts
// ─────────────────────────────────────────────────────────────
// Configuración de envíos (Ajustes → Envíos):
//   - Parámetros de guía (configuracion)
//   - Zonas + rangos de CP + tarifas (guía / flete)
// GET carga todo; PUT reconcilia todo en una transacción.
// Protegido por rol admin.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { headers }                   from "next/headers";
import { auth }                       from "@/features/auth/lib/auth";
import { pool }                       from "@/shared/lib/db/pool";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

const ADMIN_ROLES = new Set(["admin", "superadmin"]);

async function requireAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  const rol = (session?.user as { rol?: string } | undefined)?.rol ?? "";
  return !!session && ADMIN_ROLES.has(rol);
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

interface ZonaIn {
  id?:          number;
  nombre:       string;
  activa:       boolean;
  estados:      string[];
  precio_guia:  number | string;
  flete_base:   number | string;
  flete_por_kg: number | string;
}

/* ── GET ────────────────────────────────────────────────────── */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }
  try {
    const [cfgRows] = await pool.execute<RowDataPacket[]>(
      "SELECT clave, valor FROM configuracion WHERE clave IN ('envio_peso_max_kg','envio_volumen_max_m3','envio_dim_max_cm')"
    );
    const cfg = new Map(cfgRows.map((r) => [r.clave as string, r.valor as string]));

    const [zonas]   = await pool.execute<RowDataPacket[]>("SELECT id, nombre, activa FROM zonas_envio ORDER BY id ASC");
    const [estados] = await pool.execute<RowDataPacket[]>("SELECT zona_id, estado FROM zona_estados ORDER BY estado ASC");
    const [tarifas] = await pool.execute<RowDataPacket[]>(
      "SELECT zona_id, tipo_calculo, precio_base, precio_por_kg FROM tarifas_envio WHERE tipo_calculo IN ('por_guia','flete')"
    );

    const data = {
      caps: {
        peso_max_kg:    cfg.get("envio_peso_max_kg")    ?? "5",
        volumen_max_m3: cfg.get("envio_volumen_max_m3") ?? "0.0109",
        dim_max_cm:     cfg.get("envio_dim_max_cm")     ?? "27",
      },
      zonas: zonas.map((z) => {
        const guia  = tarifas.find((t) => t.zona_id === z.id && t.tipo_calculo === "por_guia");
        const flete = tarifas.find((t) => t.zona_id === z.id && t.tipo_calculo === "flete");
        return {
          id:           z.id,
          nombre:       z.nombre,
          activa:       Boolean(z.activa),
          estados:      estados.filter((e) => e.zona_id === z.id).map((e) => e.estado as string),
          precio_guia:  guia  ? String(guia.precio_base)  : "0",
          flete_base:   flete ? String(flete.precio_base)  : "0",
          flete_por_kg: flete ? String(flete.precio_por_kg ?? "0") : "0",
        };
      }),
    };
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[GET /api/admin/envio]", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}

/* ── PUT ────────────────────────────────────────────────────── */
export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 });
  }

  const conn = await pool.getConnection();
  try {
    const body = await req.json();
    const caps  = body.caps ?? {};
    const zonas: ZonaIn[] = Array.isArray(body.zonas) ? body.zonas : [];

    await conn.beginTransaction();

    // 1. Parámetros de guía (config)
    const capPairs: [string, string][] = [
      ["envio_peso_max_kg",    String(num(caps.peso_max_kg)    || 5)],
      ["envio_volumen_max_m3", String(num(caps.volumen_max_m3) || 0.0109)],
      ["envio_dim_max_cm",     String(num(caps.dim_max_cm)     || 27)],
    ];
    for (const [clave, valor] of capPairs) {
      await conn.execute(
        "INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)",
        [clave, valor]
      );
    }

    // 2. Eliminar zonas que ya no están (+ sus rangos/tarifas)
    const idsPayload = zonas.filter((z) => z.id).map((z) => z.id as number);
    const [zonasActuales] = await conn.execute<RowDataPacket[]>("SELECT id FROM zonas_envio");
    const idsEliminar = zonasActuales.map((r) => r.id as number).filter((id) => !idsPayload.includes(id));
    for (const delId of idsEliminar) {
      await conn.execute("DELETE FROM zona_estados  WHERE zona_id = ?", [delId]);
      await conn.execute("DELETE FROM tarifas_envio WHERE zona_id = ?", [delId]);
      await conn.execute("DELETE FROM zonas_envio    WHERE id = ?", [delId]);
    }

    // 3. Upsert de cada zona + rangos + tarifas
    // Garantiza que un estado quede en UNA sola zona (el primero que lo declara)
    const estadosUsados = new Set<string>();

    for (const z of zonas) {
      if (!z.nombre?.trim()) continue;
      let zonaId = z.id;
      if (zonaId) {
        await conn.execute("UPDATE zonas_envio SET nombre = ?, activa = ? WHERE id = ?", [z.nombre.trim(), z.activa ? 1 : 0, zonaId]);
      } else {
        const [res] = await conn.execute<ResultSetHeader>("INSERT INTO zonas_envio (nombre, activa) VALUES (?, ?)", [z.nombre.trim(), z.activa ? 1 : 0]);
        zonaId = res.insertId;
      }

      // Estados (reemplazo completo) — se omiten los ya tomados por otra zona
      await conn.execute("DELETE FROM zona_estados WHERE zona_id = ?", [zonaId]);
      const estadosUnicos = Array.from(new Set((z.estados ?? []).map((e) => String(e).trim()).filter(Boolean)));
      for (const estado of estadosUnicos) {
        if (estadosUsados.has(estado)) continue;   // ya asignado a otra zona
        estadosUsados.add(estado);
        await conn.execute("INSERT INTO zona_estados (zona_id, estado) VALUES (?, ?)", [zonaId, estado]);
      }

      // Tarifas guía + flete (reemplazo)
      await conn.execute("DELETE FROM tarifas_envio WHERE zona_id = ? AND tipo_calculo IN ('por_guia','flete')", [zonaId]);
      await conn.execute(
        "INSERT INTO tarifas_envio (zona_id, nombre, paqueteria, tipo_calculo, precio_base, activa) VALUES (?, 'Guía estándar', 'Paquetexpress', 'por_guia', ?, 1)",
        [zonaId, num(z.precio_guia)]
      );
      await conn.execute(
        "INSERT INTO tarifas_envio (zona_id, nombre, paqueteria, tipo_calculo, precio_base, precio_por_kg, activa) VALUES (?, 'Flete sobredimensionado', 'Paquetexpress', 'flete', ?, ?, 1)",
        [zonaId, num(z.flete_base), num(z.flete_por_kg)]
      );
    }

    await conn.commit();
    return NextResponse.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error("[PUT /api/admin/envio]", err);
    return NextResponse.json({ success: false, error: "Error al guardar" }, { status: 500 });
  } finally {
    conn.release();
  }
}
