// features/checkout/lib/direcciones.ts
// ─────────────────────────────────────────────────────────────
// Direcciones guardadas del cliente. El marco del checkout las pide
// en cuanto sabe que hay sesión (mientras se llena el contacto), y el
// paso de envío las lee de aquí: al entrar ya están y no hay que
// pintar un esqueleto que luego se reacomoda.
// ─────────────────────────────────────────────────────────────

export interface DireccionGuardada {
  id:               number;
  alias:            string | null;
  nombre:           string;
  apellido:         string;
  calle:            string;
  numero_ext:       string;
  numero_int:       string | null;
  colonia:          string;
  ciudad:           string;
  municipio:        string | null;
  estado:           string;
  codigo_postal:    string;
  pais:             string;
  referencias:      string | null;
  empresa:          string | null;
  es_predeterminada: boolean;
}

let promesa: Promise<DireccionGuardada[]> | null = null;
let ultimas: DireccionGuardada[] | null = null;

/** Lanza (o reutiliza) la petición. `nueva` descarta lo que hubiera. */
export function precargarDirecciones(nueva = false): Promise<DireccionGuardada[]> {
  if (promesa && !nueva) return promesa;
  ultimas = null;
  const actual: Promise<DireccionGuardada[]> = fetch("/api/users/addresses", { credentials: "include" })
    .then((r) => r.json())
    .then((j) => (j.success && Array.isArray(j.data) ? j.data : []))
    .catch(() => [])
    .then((lista) => {
      if (promesa === actual) ultimas = lista;
      return lista;
    });
  promesa = actual;
  return actual;
}

/** Lo ya recibido, o null si la petición sigue en vuelo o no se lanzó. */
export function direccionesListas(): DireccionGuardada[] | null {
  return ultimas;
}

/** Al cerrar sesión o salir del checkout no debe quedar nada de otra cuenta. */
export function olvidarDirecciones() {
  promesa = null;
  ultimas = null;
}
