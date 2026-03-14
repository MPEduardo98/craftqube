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
    ];
  },
};

export default nextConfig;