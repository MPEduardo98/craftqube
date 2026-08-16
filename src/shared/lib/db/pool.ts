// app/global/lib/db/pool.ts
// ─────────────────────────────────────────────────────────────
// Singleton pool de conexiones MySQL.
// Reusado por TODAS las API routes — elimina el overhead de
// abrir/cerrar una conexión TCP+SSL en cada request.
// ─────────────────────────────────────────────────────────────
import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  return mysql.createPool({
    host:              process.env.DB_HOST,
    user:              process.env.DB_USER,
    password:          process.env.DB_PASSWORD,
    database:          process.env.DB_NAME,
    port:              Number(process.env.DB_PORT) || 3306,
    ssl:               { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit:   10,
    queueLimit:        0,
    connectTimeout:    10_000,
    // Devolver DECIMAL como number y no como string. Sin esto, los precios
    // llegan como "1000.00" y las comparaciones (precio_original > precio)
    // se evalúan lexicográficamente: "1000.00" > "900.00" es false.
    decimalNumbers:    true,
    // Mantener conexiones vivas
    enableKeepAlive:   true,
    keepAliveInitialDelay: 0,
  });
}

// En desarrollo Next.js recarga módulos constantemente (HMR),
// usamos el global para no crear N pools.
export const pool: mysql.Pool =
  globalThis.__mysqlPool ?? (globalThis.__mysqlPool = createPool());