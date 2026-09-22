// scripts/dump-schema.mjs
// ─────────────────────────────────────────────────────────────
// Regenera db/schema.sql leyendo la estructura de una BD real.
//
// El esquema vive en la base, no en el repo: sin este volcado no
// hay forma de levantar una tienda nueva sin copiar tablas a mano.
// Correr después de cualquier cambio de estructura para que el
// archivo versionado no se quede atrás.
//
// SOLO LECTURA sobre la base: usa SHOW CREATE TABLE y no escribe
// nada en ella.
//
//   npm run db:dump-schema
//   node scripts/dump-schema.mjs --env .env.luna
// ─────────────────────────────────────────────────────────────
import mysql from "mysql2/promise";
import fs    from "node:fs";
import path  from "node:path";
import url   from "node:url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");

const argv   = process.argv.slice(2);
const optVal = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const ENV_FILE = optVal("--env", ".env.local");
const OUT_FILE = optVal("--out", "db/schema.sql");

const envPath = path.join(ROOT, ENV_FILE);
if (!fs.existsSync(envPath)) {
  console.error(`✗ No existe ${ENV_FILE}`);
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^\s*[A-Z_][A-Z_0-9]*\s*=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const database = env.DB_NAME;
const conn = await mysql.createConnection({
  host: env.DB_HOST, user: env.DB_USER, password: env.DB_PASSWORD,
  database, port: Number(env.DB_PORT) || 3306,
  ssl: { rejectUnauthorized: false }, connectTimeout: 20_000,
});

const [objetos] = await conn.query(
  `SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME`, [database]
);

const bloques = [];
const tablas  = [];
const vistas  = [];

for (const o of objetos) {
  const name = o.TABLE_NAME;
  if (o.TABLE_TYPE === "VIEW") { vistas.push(name); continue; }
  tablas.push(name);
  const [[row]] = await conn.query(`SHOW CREATE TABLE \`${name}\``);
  // Quitar AUTO_INCREMENT=N: es estado de esta tienda, no estructura.
  const ddl = row["Create Table"].replace(/\sAUTO_INCREMENT=\d+/g, "");
  bloques.push(
    `-- ${"-".repeat(60)}\n-- Tabla: ${name}\n-- ${"-".repeat(60)}\n` +
    `DROP TABLE IF EXISTS \`${name}\`;\n${ddl};\n`
  );
}

for (const name of vistas) {
  const [[row]] = await conn.query(`SHOW CREATE VIEW \`${name}\``);
  bloques.push(`-- Vista: ${name}\nDROP VIEW IF EXISTS \`${name}\`;\n${row["Create View"]};\n`);
}

const [fks] = await conn.query(
  `SELECT COUNT(*) AS n FROM information_schema.KEY_COLUMN_USAGE
   WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL`, [database]
);

const header = `-- ============================================================
-- Esquema de base de datos — estructura completa
--
-- Generado por: npm run db:dump-schema
-- No editar a mano: los cambios se hacen en la BD y se vuelcan
-- aquí, o se quedan fuera del repo en el próximo volcado.
--
-- SOLO ESTRUCTURA: no contiene datos de ninguna tienda.
--
-- Para levantar una tienda nueva:
--   npm run db:init -- --env .env.mitienda
--
-- Tablas: ${tablas.length}  |  Vistas: ${vistas.length}  |  FKs: ${fks[0].n}
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

`;

fs.mkdirSync(path.join(ROOT, path.dirname(OUT_FILE)), { recursive: true });
fs.writeFileSync(path.join(ROOT, OUT_FILE), header + bloques.join("\n") + "\nSET FOREIGN_KEY_CHECKS = 1;\n", "utf8");

console.log(`✓ ${OUT_FILE} — ${tablas.length} tablas, ${vistas.length} vistas, ${fks[0].n} FKs`);
await conn.end();
