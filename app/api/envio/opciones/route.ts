// app/api/envio/opciones/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/envio/opciones
// Calcula opciones de envío según código postal y subtotal
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import mysql                          from "mysql2/promise";
import type { OpcionEnvio }           from "@/app/global/types/commerce";

function dbConfig() {
  return {
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     Number(process.env.DB_PORT) || 3306,
    ssl:      { rejectUnauthorized: false },
  };
}

export async function POST(req: NextRequest) {
  let conn;
  try {
    const { codigo_postal, subtotal, peso_total_kg = 0 } = await req.json();

    if (!codigo_postal || subtotal == null) {
      return NextResponse.json(
        { success: false, error: "Se requiere codigo_postal y subtotal" },
        { status: 400 }
      );
    }

    conn = await mysql.createConnection(dbConfig());

    // Buscar zona por CP (prioridad: coincidencia exacta → zona nacional)
    const [zoneRows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT z.id AS zona_id
       FROM zonas_envio z
       INNER JOIN zona_codigos_postales zcp ON zcp.zona_id = z.id
       WHERE zcp.codigo_postal = ? AND z.activa = 1
       LIMIT 1`,
      [codigo_postal]
    );

    // Fallback: zona nacional (id = 5)
    const zonaId = (zoneRows[0]?.zona_id as number) ?? 5;

    // Obtener tarifas para la zona
    const [tarifas] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM tarifas_envio
       WHERE zona_id = ? AND activa = 1
       ORDER BY precio_base ASC`,
      [zonaId]
    );

    const opciones: OpcionEnvio[] = tarifas.map((t) => {
      let precioCalculado = t.precio_base as number;

      if (t.tipo_calculo === "por_peso") {
        precioCalculado =
          t.precio_base + (peso_total_kg * (t.precio_por_kg ?? 0));
      } else if (t.tipo_calculo === "gratis") {
        precioCalculado = 0;
      }

      const envioGratis =
        t.monto_envio_gratis != null && subtotal >= t.monto_envio_gratis;

      return {
        id:                  t.id,
        zona_id:             t.zona_id,
        nombre:              t.nombre,
        paqueteria:          t.paqueteria,
        tipo_calculo:        t.tipo_calculo,
        precio_base:         t.precio_base,
        precio_por_kg:       t.precio_por_kg,
        peso_maximo_kg:      t.peso_maximo_kg,
        monto_envio_gratis:  t.monto_envio_gratis,
        dias_estimados_min:  t.dias_estimados_min,
        dias_estimados_max:  t.dias_estimados_max,
        activa:              Boolean(t.activa),
        precio_calculado:    envioGratis ? 0 : precioCalculado,
        envio_gratis:        envioGratis,
      };
    });

    return NextResponse.json({ success: true, data: opciones, zona_id: zonaId });

  } catch (error) {
    console.error("[POST /api/envio/opciones]", error);
    return NextResponse.json(
      { success: false, error: "Error al calcular opciones de envío" },
      { status: 500 }
    );
  } finally {
    if (conn) await conn.end();
  }
}