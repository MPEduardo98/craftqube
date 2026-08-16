// features/admin/productos/lib/variante-sync.ts
// ─────────────────────────────────────────────────────────────
// Helpers para sincronizar:
//   - producto_envio       (1:1 por PRODUCTO: dimensiones/peso de envío)
//   - variante_valores      (atributos: Color, Talla, …)
//   - producto_metacampos   (especificaciones propias de la variante)
//
// Pensados para usarse dentro de una transacción (reciben la
// conexión). La variante/producto ya debe existir (id válido).
// ─────────────────────────────────────────────────────────────
import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface AtributoInput  { nombre: string; valor: string; }
export interface MetacampoInput { llave: string;  valor: string; }
export interface EnvioInput {
  es_fisico?:     boolean;
  largo?:         string | number | null;
  ancho?:         string | number | null;
  alto?:          string | number | null;
  peso?:          string | number | null;
  medida_unidad?: string | null;
  peso_unidad?:   string | null;
}

const num = (v: unknown): number | null => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/* ── Envío (a nivel producto) ──────────────────────────────── */
export async function syncProductoEnvio(
  conn: PoolConnection,
  productoId: number,
  e: EnvioInput | null | undefined,
): Promise<void> {
  const env = e ?? {};
  const esFisico = env.es_fisico !== false;
  await conn.execute(
    `INSERT INTO producto_envio
       (producto_id, es_fisico, largo, ancho, alto, peso, medida_unidad, peso_unidad)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       es_fisico = VALUES(es_fisico), largo = VALUES(largo), ancho = VALUES(ancho),
       alto = VALUES(alto), peso = VALUES(peso),
       medida_unidad = VALUES(medida_unidad), peso_unidad = VALUES(peso_unidad)`,
    [productoId, esFisico ? 1 : 0,
     num(env.largo), num(env.ancho), num(env.alto), num(env.peso),
     env.medida_unidad || "cm", env.peso_unidad || "kg"],
  );
}

/* ── Atributos (Color, Talla, …) ───────────────────────────── */
async function getOrCreateAtributo(conn: PoolConnection, nombre: string): Promise<number> {
  const [[row]] = await conn.query<RowDataPacket[]>(
    "SELECT id FROM atributos WHERE nombre = ? LIMIT 1", [nombre],
  );
  if (row) return row.id;
  const [res] = await conn.execute<ResultSetHeader>(
    "INSERT INTO atributos (nombre) VALUES (?)", [nombre],
  );
  return res.insertId;
}

async function getOrCreateAtributoValor(conn: PoolConnection, atributoId: number, valor: string): Promise<number> {
  const [[row]] = await conn.query<RowDataPacket[]>(
    "SELECT id FROM atributos_valores WHERE atributo_id = ? AND valor = ? LIMIT 1", [atributoId, valor],
  );
  if (row) return row.id;
  const [res] = await conn.execute<ResultSetHeader>(
    "INSERT INTO atributos_valores (atributo_id, valor) VALUES (?, ?)", [atributoId, valor],
  );
  return res.insertId;
}

export async function syncVarianteAtributos(
  conn: PoolConnection,
  varianteId: number,
  atributos: AtributoInput[],
): Promise<void> {
  await conn.execute("DELETE FROM variante_valores WHERE variante_id = ?", [varianteId]);

  for (const a of atributos) {
    const nombre = a.nombre?.trim();
    const valor  = a.valor?.trim();
    if (!nombre || !valor) continue;

    const atributoId = await getOrCreateAtributo(conn, nombre);
    const valorId    = await getOrCreateAtributoValor(conn, atributoId, valor);
    await conn.execute(
      "INSERT IGNORE INTO variante_valores (variante_id, atributo_valor_id) VALUES (?, ?)",
      [varianteId, valorId],
    );
  }
}

/* ── Imagen representativa de la variante (1 por variante) ──── */
export async function syncVarianteImagen(
  conn: PoolConnection,
  productoId: number,
  varianteId: number,
  url: string | null | undefined,
  alt?: string | null,
): Promise<void> {
  await conn.execute(
    "DELETE FROM producto_imagenes WHERE producto_id = ? AND variante_id = ?",
    [productoId, varianteId],
  );
  const clean = url?.trim();
  if (clean) {
    await conn.execute(
      "INSERT INTO producto_imagenes (producto_id, variante_id, url, alt, orden) VALUES (?, ?, ?, ?, 0)",
      [productoId, varianteId, clean, alt?.trim() || null],
    );
  }
}

/* ── Metacampos propios de la variante ─────────────────────── */
export async function syncVarianteMetacampos(
  conn: PoolConnection,
  productoId: number,
  varianteId: number,
  metacampos: MetacampoInput[],
): Promise<void> {
  await conn.execute(
    "DELETE FROM producto_metacampos WHERE producto_id = ? AND variante_id = ?",
    [productoId, varianteId],
  );
  for (const m of metacampos) {
    const llave = m.llave?.trim();
    const valor = m.valor?.trim();
    if (!llave || !valor) continue;
    await conn.execute(
      "INSERT INTO producto_metacampos (producto_id, variante_id, llave, valor) VALUES (?, ?, ?, ?)",
      [productoId, varianteId, llave, valor],
    );
  }
}
