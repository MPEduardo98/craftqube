// features/orders/lib/resolverCupon.ts
// ─────────────────────────────────────────────────────────────
// Validación y cálculo de un cupón. Fuente ÚNICA de verdad: la
// usan tanto la vista previa del checkout como la creación del
// pedido, de modo que el descuento que se muestra y el que se
// cobra salen exactamente del mismo código.
//
// Devuelve un resultado en vez de lanzar. Quien llama decide si
// un cupón inválido es un error duro (crear el pedido) o algo
// que se descarta avisando (vista previa del checkout).
// ─────────────────────────────────────────────────────────────
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool }                                     from "@/shared/lib/db/pool";
import { toStoreCurrency, type StorePricing }       from "@/shared/lib/currency/store-currency";
import { formatMoneda }                             from "@/shared/lib/format";
import type { CuponTipo, CuponAplica }              from "@/shared/types/commerce";

type Ejecutor = Pool | PoolConnection;

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Estados que cuentan como "este comprador ya compró antes". Un
 * pedido sin pagar o cancelado no gasta el cupón de primera compra.
 */
const ESTADOS_COMPRA_REAL = [
  "pago_recibido", "en_proceso", "listo_envio",
  "enviado", "entregado", "reembolsado", "disputa",
];

/** Línea del carrito ya resuelta contra la BD. */
export interface LineaParaCupon {
  variante_id:     number;
  producto_id:     number;
  cantidad:        number;
  precio_unitario: number;
  total_linea:     number;
}

export interface ParamsCupon {
  codigo:      string;
  lineas:      LineaParaCupon[];
  subtotal:    number;
  /** Envío ya cotizado; `envio_gratis` lo pone en cero. */
  costo_envio: number;
  /** Los importes del cupón están en moneda de captura, como los precios. */
  pricing:     StorePricing;
  usuario_id?: number | null;
  email?:      string | null;
  /**
   * Bloquea la fila del cupón para el resto de la transacción. Sin
   * esto, dos pedidos simultáneos con el mismo código de un solo uso
   * pasan ambos la comprobación de límite y el cupón se gasta dos
   * veces. Sólo tiene sentido con `db` dentro de una transacción.
   */
  bloquear?:   boolean;
  db?:         Ejecutor;
}

export interface CuponResuelto {
  ok:           true;
  cupon_id:     number;
  codigo:       string;
  tipo:         CuponTipo;
  descripcion:  string | null;
  /** Descuento sobre la mercancía (nunca incluye el envío). */
  descuento:    number;
  /** Costo de envío después del cupón. */
  costo_envio:  number;
  envio_gratis: boolean;
}

export interface CuponInvalido {
  ok:    false;
  error: string;
}

export type ResultadoCupon = CuponResuelto | CuponInvalido;

const invalido = (error: string): CuponInvalido => ({ ok: false, error });

/** `aplica_ids` se guarda como JSON; el driver lo da parseado o como string. */
function parseAplicaIds(raw: unknown): number[] {
  const aNumeros = (arr: unknown[]) =>
    arr.map(Number).filter((n) => Number.isInteger(n) && n > 0);

  if (Array.isArray(raw)) return aNumeros(raw);
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return aNumeros(parsed);
    } catch { return []; }
  }
  return [];
}

/**
 * Líneas del carrito sobre las que muerde el cupón. Un cupón
 * restringido a una categoría sólo descuenta lo de esa categoría,
 * no el carrito entero.
 */
async function lineasElegibles(
  db:     Ejecutor,
  cupon:  RowDataPacket,
  lineas: LineaParaCupon[]
): Promise<LineaParaCupon[]> {
  const aplica = String(cupon.aplica_a ?? "todos") as CuponAplica;

  // `primera_compra` restringe QUIÉN puede usarlo, no QUÉ descuenta.
  if (aplica === "todos" || aplica === "primera_compra") return lineas;

  const ids = parseAplicaIds(cupon.aplica_ids);
  if (ids.length === 0) return [];

  if (aplica === "producto") {
    const permitidos = new Set(ids);
    return lineas.filter((l) => permitidos.has(l.producto_id));
  }

  // categoria: un producto puede estar en varias, basta con una.
  const productoIds = [...new Set(lineas.map((l) => l.producto_id))];
  const [filas] = await db.execute<RowDataPacket[]>(
    `SELECT DISTINCT producto_id
       FROM producto_categorias
      WHERE producto_id IN (${productoIds.map(() => "?").join(",")})
        AND categoria_id IN (${ids.map(() => "?").join(",")})`,
    [...productoIds, ...ids]
  );
  const permitidos = new Set(filas.map((f) => Number(f.producto_id)));
  return lineas.filter((l) => permitidos.has(l.producto_id));
}

/** ¿Este comprador ya tiene un pedido pagado? Identidad por cuenta o correo. */
async function yaCompro(
  db:        Ejecutor,
  usuarioId: number | null,
  email:     string | null
): Promise<boolean> {
  const condiciones: string[] = [];
  const args: (string | number)[] = [];

  if (usuarioId) { condiciones.push("usuario_id = ?");   args.push(usuarioId); }
  if (email)     { condiciones.push("LOWER(email) = ?"); args.push(email.trim().toLowerCase()); }

  // Sin identidad no se puede afirmar que ya compró: se le concede.
  if (condiciones.length === 0) return false;

  const [filas] = await db.execute<RowDataPacket[]>(
    `SELECT 1 FROM pedidos
      WHERE (${condiciones.join(" OR ")})
        AND estado IN (${ESTADOS_COMPRA_REAL.map(() => "?").join(",")})
      LIMIT 1`,
    [...args, ...ESTADOS_COMPRA_REAL]
  );
  return filas.length > 0;
}

/**
 * Valida el cupón contra el carrito y calcula lo que descuenta.
 * Nunca lanza por un cupón malo: eso lo decide quien llama.
 */
export async function resolverCupon(params: ParamsCupon): Promise<ResultadoCupon> {
  const db     = params.db ?? pool;
  const codigo = params.codigo.trim();

  if (!codigo)            return invalido("Escribe un código de cupón.");
  // `cupones.codigo` es varchar(60): nada más largo puede existir.
  if (codigo.length > 60) return invalido("El código no existe.");

  // La vigencia se evalúa en SQL con NOW(): comparar fechas en JS
  // introduciría el desfase de zona horaria entre app y base de datos.
  const [filas] = await db.execute<RowDataPacket[]>(
    `SELECT c.*,
            (c.valido_desde IS NOT NULL AND c.valido_desde > NOW()) AS aun_no_vigente,
            (c.valido_hasta IS NOT NULL AND c.valido_hasta < NOW()) AS ya_expiro
       FROM cupones c
      WHERE UPPER(c.codigo) = UPPER(?)
      LIMIT 1${params.bloquear ? " FOR UPDATE" : ""}`,
    [codigo]
  );

  const cupon = filas[0];
  if (!cupon)                       return invalido("El código no existe.");
  if (!Number(cupon.activo))        return invalido("Este cupón ya no está disponible.");
  if (Number(cupon.aun_no_vigente)) return invalido("Este cupón todavía no es válido.");
  if (Number(cupon.ya_expiro))      return invalido("Este cupón ya expiró.");

  if (cupon.uso_maximo_total != null &&
      Number(cupon.usos_actuales) >= Number(cupon.uso_maximo_total)) {
    return invalido("Este cupón ya alcanzó su límite de usos.");
  }

  const usuarioId = params.usuario_id ?? null;
  const email     = params.email ?? null;

  // ── Límite por comprador ──
  if (usuarioId && Number(cupon.uso_maximo_usuario) > 0) {
    const [usos] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(*) AS usos FROM cupon_usos WHERE cupon_id = ? AND usuario_id = ?",
      [cupon.id, usuarioId]
    );
    if (Number(usos[0]?.usos ?? 0) >= Number(cupon.uso_maximo_usuario)) {
      return invalido("Ya usaste este cupón el máximo de veces permitido.");
    }
  }

  // ── Sólo primera compra ──
  if (String(cupon.aplica_a) === "primera_compra" &&
      await yaCompro(db, usuarioId, email)) {
    return invalido("Este cupón es sólo para tu primera compra.");
  }

  // ── Sobre qué muerde ──
  const elegibles = await lineasElegibles(db, cupon, params.lineas);
  if (elegibles.length === 0) {
    return invalido("Este cupón no aplica a los productos de tu carrito.");
  }

  // Los importes del cupón se capturan en la misma moneda que los
  // precios, así que se convierten igual antes de compararlos.
  const aTienda = (v: unknown): number | null =>
    v == null ? null : toStoreCurrency(Number(v), params.pricing);

  // ── Compra mínima (sobre el carrito completo) ──
  const minimo = aTienda(cupon.minimo_compra);
  if (minimo != null && params.subtotal < minimo) {
    return invalido(
      `Este cupón requiere una compra mínima de ${formatMoneda(minimo, params.pricing.monedaTienda)}.`
    );
  }

  // ── Descuento ──
  const tipo         = String(cupon.tipo) as CuponTipo;
  const baseElegible = round2(elegibles.reduce((s, l) => s + l.total_linea, 0));
  const maximo       = aTienda(cupon.maximo_descuento);

  let descuento   = 0;
  let costoEnvio  = params.costo_envio;
  let envioGratis = false;

  if (tipo === "porcentaje") {
    descuento = baseElegible * (Number(cupon.valor) / 100);
    if (maximo != null) descuento = Math.min(descuento, maximo);

  } else if (tipo === "monto_fijo") {
    descuento = Math.min(aTienda(cupon.valor) ?? 0, baseElegible);

  } else if (tipo === "envio_gratis") {
    // El envío gratis se refleja poniendo el costo en cero, no como
    // un descuento sobre la mercancía: así el desglose es honesto.
    costoEnvio  = 0;
    envioGratis = true;

  } else if (tipo === "2x1") {
    // Por cada 2 unidades del mismo producto, 1 sale gratis.
    descuento = elegibles.reduce(
      (s, l) => s + Math.floor(l.cantidad / 2) * l.precio_unitario, 0
    );
  }

  descuento = round2(Math.max(0, Math.min(descuento, baseElegible)));

  // Un cupón que no cambia nada confunde más de lo que ayuda.
  if (descuento <= 0 && !envioGratis) {
    return invalido(
      tipo === "2x1"
        ? "Necesitas al menos 2 unidades de un mismo producto para usar este cupón."
        : "Este cupón no genera descuento sobre tu carrito."
    );
  }

  return {
    ok:           true,
    cupon_id:     Number(cupon.id),
    codigo:       String(cupon.codigo),
    tipo,
    descripcion:  (cupon.descripcion as string | null) ?? null,
    descuento,
    costo_envio:  round2(costoEnvio),
    envio_gratis: envioGratis,
  };
}
