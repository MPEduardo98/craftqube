// app/api/cupones/validar/route.ts
// ─────────────────────────────────────────────────────────────
// POST /api/cupones/validar
// Valida un código de cupón y calcula el descuento
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import mysql                          from "mysql2/promise";

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
    const { codigo, subtotal, usuario_id, costo_envio = 0 } = await req.json();

    if (!codigo || subtotal == null) {
      return NextResponse.json(
        { success: false, error: "Se requiere código y subtotal" },
        { status: 400 }
      );
    }

    conn = await mysql.createConnection(dbConfig());

    // Buscar cupón activo y vigente
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT * FROM cupones
       WHERE UPPER(codigo) = UPPER(?)
         AND activo = 1
         AND (valido_desde IS NULL OR valido_desde <= NOW())
         AND (valido_hasta IS NULL OR valido_hasta >= NOW())
         AND (uso_maximo_total IS NULL OR usos_actuales < uso_maximo_total)
       LIMIT 1`,
      [codigo.trim()]
    );

    if (!rows.length) {
      return NextResponse.json({
        success: false,
        valido:  false,
        error:   "Código inválido o expirado",
      });
    }

    const cupon = rows[0];

    // Validar monto mínimo
    if (cupon.minimo_compra && subtotal < cupon.minimo_compra) {
      return NextResponse.json({
        success: false,
        valido:  false,
        error:   `Compra mínima de ${cupon.minimo_compra.toFixed(2)} para usar este cupón`,
      });
    }

    // Validar uso por usuario (si aplica)
    if (usuario_id && cupon.uso_maximo_usuario > 0) {
      const [usosRows] = await conn.execute<mysql.RowDataPacket[]>(
        `SELECT COUNT(*) AS usos FROM cupon_usos
         WHERE cupon_id = ? AND usuario_id = ?`,
        [cupon.id, usuario_id]
      );
      if ((usosRows[0]?.usos ?? 0) >= cupon.uso_maximo_usuario) {
        return NextResponse.json({
          success: false,
          valido:  false,
          error:   "Ya usaste este cupón el máximo de veces permitido",
        });
      }
    }

    // Calcular descuento
    let descuento = 0;
    if (cupon.tipo === "porcentaje") {
      descuento = subtotal * (cupon.valor / 100);
      if (cupon.maximo_descuento) {
        descuento = Math.min(descuento, cupon.maximo_descuento);
      }
    } else if (cupon.tipo === "monto_fijo") {
      descuento = Math.min(cupon.valor, subtotal);
    } else if (cupon.tipo === "envio_gratis") {
      descuento = costo_envio;
    }

    descuento = Math.round(descuento * 100) / 100;

    return NextResponse.json({
      success:  true,
      valido:   true,
      cupon: {
        id:                cupon.id,
        codigo:            cupon.codigo,
        tipo:              cupon.tipo,
        valor:             cupon.valor,
        minimo_compra:     cupon.minimo_compra,
        maximo_descuento:  cupon.maximo_descuento,
        descripcion:       cupon.descripcion,
      },
      descuento,
      mensaje: cupon.tipo === "envio_gratis"
        ? "¡Envío gratis aplicado!"
        : `Descuento de $${descuento.toFixed(2)} aplicado`,
    });

  } catch (error) {
    console.error("[POST /api/cupones/validar]", error);
    return NextResponse.json(
      { success: false, error: "Error al validar cupón" },
      { status: 500 }
    );
  } finally {
    if (conn) await conn.end();
  }
}