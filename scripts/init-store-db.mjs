// scripts/init-store-db.mjs
// ─────────────────────────────────────────────────────────────
// Prepara la base de datos de una tienda: aplica db/schema.sql
// y, si se pide, db/seed.sql.
//
// Existe porque el esquema son 42 tablas con 41 llaves foráneas:
// crearlas a mano para cada tienda nueva es lento y se presta a
// olvidar un índice que luego falla en producción.
//
// No usa el cliente `mysql` del sistema — habla por mysql2, que
// ya es dependencia del proyecto.
//
//   node scripts/init-store-db.mjs                 # usa .env.local
//   node scripts/init-store-db.mjs --env .env.luna # otra tienda
//   node scripts/init-store-db.mjs --no-seed       # sólo esquema
//   node scripts/init-store-db.mjs --dry-run       # sin escribir
// ─────────────────────────────────────────────────────────────
import mysql from "mysql2/promise";
import fs    from "node:fs";
import path  from "node:path";
import url   from "node:url";
import readline from "node:readline/promises";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");

// ── Argumentos ───────────────────────────────────────────────
const argv    = process.argv.slice(2);
const flag    = (n) => argv.includes(n);
const optVal  = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };

const ENV_FILE = optVal("--env", ".env.local");
const WITH_SEED = !flag("--no-seed");
const DRY_RUN   = flag("--dry-run");
const FORCE     = flag("--force");

// ── Lectura del .env ─────────────────────────────────────────
function readEnv(file) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    console.error(`✗ No existe ${file}`);
    process.exit(1);
  }
  return Object.fromEntries(
    fs.readFileSync(full, "utf8")
      .split(/\r?\n/)
      .filter((l) => /^\s*[A-Z_][A-Z_0-9]*\s*=/.test(l))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
      })
  );
}

// Parte un .sql en sentencias. El esquema sólo trae DDL con `;`
// al final de cada statement, sin procedimientos ni delimitadores
// personalizados, así que basta con respetar comillas y comentarios.
function splitStatements(sql) {
  const out = [];
  let buf = "", quote = null, lineComment = false, blockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const c = sql[i], next = sql[i + 1];

    if (lineComment) { if (c === "\n") { lineComment = false; buf += c; } continue; }
    if (blockComment) { if (c === "*" && next === "/") { blockComment = false; i++; } continue; }

    if (!quote) {
      if (c === "-" && next === "-") { lineComment = true; continue; }
      if (c === "#")                 { lineComment = true; continue; }
      if (c === "/" && next === "*") { blockComment = true; i++; continue; }
    }

    if (quote) {
      if (c === "\\") { buf += c + (next ?? ""); i++; continue; }  // escape
      if (c === quote) quote = null;
    } else if (c === "'" || c === '"' || c === "`") {
      quote = c;
    }

    if (c === ";" && !quote) { if (buf.trim()) out.push(buf.trim()); buf = ""; continue; }
    buf += c;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

async function runFile(conn, file, label) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    console.error(`✗ No existe ${file}`);
    process.exit(1);
  }
  const statements = splitStatements(fs.readFileSync(full, "utf8"));
  console.log(`\n▸ ${label} (${statements.length} sentencias)`);

  if (DRY_RUN) { console.log("  [dry-run] no se ejecuta nada"); return; }

  let n = 0;
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
      n++;
    } catch (err) {
      console.error(`\n✗ Falló la sentencia ${n + 1}:`);
      console.error(stmt.slice(0, 200));
      console.error(`  ${err.message}`);
      process.exit(1);
    }
  }
  console.log(`  ✓ ${n} sentencias aplicadas`);
}

// ── Main ─────────────────────────────────────────────────────
const env = readEnv(ENV_FILE);
const { DB_HOST: host, DB_USER: user, DB_PASSWORD: password, DB_NAME: database } = env;
const port = Number(env.DB_PORT) || 3306;

if (!host || !user || !database) {
  console.error("✗ Faltan DB_HOST / DB_USER / DB_NAME en " + ENV_FILE);
  process.exit(1);
}

console.log("─".repeat(58));
console.log(`  Inicializar tienda`);
console.log("─".repeat(58));
console.log(`  env      ${ENV_FILE}`);
console.log(`  host     ${host}:${port}`);
console.log(`  base     ${database}`);
console.log(`  semilla  ${WITH_SEED ? "sí" : "no"}`);
if (DRY_RUN) console.log(`  modo     DRY RUN (no escribe)`);
console.log("─".repeat(58));

// El esquema arranca con DROP TABLE IF EXISTS: sobre una base con
// datos los borra. Por eso se confirma salvo --force o --dry-run.
const conn = await mysql.createConnection({
  host, user, password, database, port,
  ssl: { rejectUnauthorized: false },
  multipleStatements: false,
  connectTimeout: 20_000,
});

const [tablas] = await conn.query(
  "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?",
  [database]
);
const existentes = tablas[0].n;

if (existentes > 0 && !FORCE && !DRY_RUN) {
  console.log(`\n⚠  La base '${database}' ya tiene ${existentes} tablas.`);
  console.log(`   Aplicar el esquema las BORRA con todos sus datos.`);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = await rl.question(`   Escribe el nombre de la base para confirmar: `);
  rl.close();
  if (ans.trim() !== database) {
    console.log("   Cancelado. No se tocó nada.");
    await conn.end();
    process.exit(0);
  }
}

await runFile(conn, "db/schema.sql", "Esquema");
if (WITH_SEED) await runFile(conn, "db/seed.sql", "Datos semilla");

const [final] = await conn.query(
  "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?",
  [database]
);

console.log("\n" + "─".repeat(58));
console.log(`  ✓ Listo — ${final[0].n} tablas en '${database}'`);
console.log("─".repeat(58));
if (!DRY_RUN) {
  console.log(`\n  Siguiente paso: crea el usuario admin y entra a /admin/ajustes`);
}
await conn.end();
