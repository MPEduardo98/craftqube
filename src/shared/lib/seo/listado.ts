// shared/lib/seo/listado.ts
// ─────────────────────────────────────────────────────────────
// Indexación de los listados (/catalogo y /categoria/<slug>).
//
// - Página 1 sin filtros: canónica limpia, indexable.
// - ?page=N sin filtros: canónica a sí misma. Google no usa
//   rel=prev/next; si todas apuntaran a la página 1 dejaría de
//   rastrear los productos que sólo aparecen en páginas 2+.
// - Con filtros, orden o búsqueda (?marca=, ?sort=, ?stock=, ?q=):
//   noindex,follow. Son combinaciones casi infinitas de lo mismo;
//   se siguen sus enlaces a productos pero no compiten en Google.
// ─────────────────────────────────────────────────────────────
import type { Metadata } from "next";

export interface ParamsListado {
  page?: string; marca?: string; sort?: string; stock?: string; q?: string;
}

export function indexacionListado(
  sp: ParamsListado,
  canonicalBase: string,
): Pick<Metadata, "alternates" | "robots"> {
  const filtrado = !!(sp.marca || sp.sort || sp.stock || sp.q?.trim());
  const pagina   = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  if (filtrado) {
    return {
      alternates: { canonical: canonicalBase },
      robots:     { index: false, follow: true },
    };
  }

  return {
    alternates: { canonical: pagina > 1 ? `${canonicalBase}?page=${pagina}` : canonicalBase },
  };
}
