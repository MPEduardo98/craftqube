// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Redirecciones 301 desde URLs de Shopify ───────────────
  // Preservan el "link equity" (autoridad SEO) acumulado.
  // :slug captura cualquier segmento y lo pasa al destino.
  // "permanent: true" emite HTTP 301 → Google transfiere el ranking.
  async redirects() {
    return [
      // /collections/perfiles-de-aluminio → /categoria/perfiles-de-aluminio
      {
        source:      "/collections/:slug",
        destination: "/categoria/:slug",
        permanent:   true,
      },
      // /products/escuadra-40x40 → /producto/escuadra-40x40
      {
        source:      "/products/:slug",
        destination: "/producto/:slug",
        permanent:   true,
      },
      // Shopify también genera estas variantes — cubrirlas por si acaso
      {
        source:      "/collections/:slug/products/:productSlug",
        destination: "/producto/:productSlug",
        permanent:   true,
      },

      // ── /catalogo?cat=<slug> → /categoria/<slug> ────────────
      // La categoría tiene URL propia. Va aquí y no en la page
      // con permanentRedirect() porque ahí Next responde 200 con
      // la señal de redirect en el payload RSC: el navegador
      // navega, pero un crawler ve 200 y no transfiere ranking.
      // Como redirect de config es un 301 HTTP real.
      // `has` captura el valor del query param; los demás filtros
      // (marca, sort, page…) se conservan automáticamente.
      // Next arrastra el `?cat=` de origen al destino, dejándolo
      // duplicado; el proxy lo limpia después (ver src/proxy.ts).
      {
        source:      "/catalogo",
        has: [{ type: "query", key: "cat", value: "(?<catSlug>.+)" }],
        destination: "/categoria/:catSlug",
        permanent:   true,
      },
    ];
  },

    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.craftqube.mx",   // CDN público (R2 con dominio propio)
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",          // legacy: buckets R2 públicos (URLs viejas en BD)
      },
    ],
  },
};


export default nextConfig;