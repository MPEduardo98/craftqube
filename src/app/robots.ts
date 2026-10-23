// app/robots.ts
// ─────────────────────────────────────────────────────────────
// Genera /robots.txt automáticamente vía Next.js Metadata API.
// Permite crawl de páginas públicas; bloquea rutas privadas.
// ─────────────────────────────────────────────────────────────
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.mx";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/catalogo",
          "/catalogo/",
          "/producto/",
          "/categoria/",
          "/about/",
          "/about/faq",
        ],
        disallow: [
          "/api/",
          "/checkout/",
          "/cuenta/",
          "/admin/",
          "/login",
          "/registro",
          // Ni /_next/ (CSS, JS e imágenes optimizadas: sin ellos Google
          // no puede renderizar) ni /catalogo?cat= (si se bloquea, Google
          // no ve el 301 a /categoria/ y no transfiere el ranking).
        ],
      },
    ],
    sitemap:  `${SITE_URL}/sitemap.xml`,
    host:     SITE_URL,
  };
}