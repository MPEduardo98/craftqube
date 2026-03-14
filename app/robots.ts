// app/robots.ts
// ─────────────────────────────────────────────────────────────
// Genera /robots.txt automáticamente vía Next.js Metadata API.
// Permite crawl de páginas públicas; bloquea rutas privadas.
// ─────────────────────────────────────────────────────────────
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.com";

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
          "/_next/",
          "/login",
          "/registro",
        ],
      },
    ],
    sitemap:  `${SITE_URL}/sitemap.xml`,
    host:     SITE_URL,
  };
}