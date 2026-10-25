// app/sitemap.ts
// ─────────────────────────────────────────────────────────────
// Genera /sitemap.xml (lo anuncia robots.ts) con las páginas
// públicas fijas, cada categoría con productos activos y cada
// producto activo.
// ─────────────────────────────────────────────────────────────
import type { MetadataRoute } from "next";
import { getContactoPublico } from "@mpeduardo98/commerce-core/contacto";
import { getAllProductoSlugs, getAllCategoriaSlugs } from "@mpeduardo98/commerce-core/catalogo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.mx";

// Se regenera cada hora para recoger productos nuevos sin redeploy.
export const revalidate = 3600;

const PAGINAS_FIJAS = [
  "",
  "/catalogo",
  "/about/nosotros",
  "/about/faq",
  "/contacto",
  "/politicas/politica-de-envio",
  "/politicas/politica-de-privacidad",
  "/politicas/politica-de-reembolso",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productos, categorias, contacto] = await Promise.all([
    getAllProductoSlugs().catch(() => []),
    getAllCategoriaSlugs().catch(() => []),
    getContactoPublico(),
  ]);

  return [
    ...PAGINAS_FIJAS.filter(ruta => ruta !== "/contacto" || contacto.activo).map((ruta) => ({ url: `${SITE_URL}${ruta}` })),
    ...categorias.map(({ slug }) => ({ url: `${SITE_URL}/categoria/${slug}` })),
    ...productos.map(({ slug, updated_at }) => ({
      url:          `${SITE_URL}/producto/${slug}`,
      lastModified: updated_at ? new Date(updated_at) : undefined,
    })),
  ];
}
