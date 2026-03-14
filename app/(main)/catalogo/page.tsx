// app/(main)/catalogo/page.tsx
// ─────────────────────────────────────────────────────────────
// MEJORA SEO CRÍTICA:
// Antes: renderizaba solo <CatalogClient /> → HTML vacío, nada
//        que crawlear para Google.
// Ahora: fetch server-side de la primera página de productos →
//        los primeros 24 productos están en el HTML inicial.
//        CatalogClient recibe los datos como props y los usa
//        sin hacer un fetch extra al montar.
// ─────────────────────────────────────────────────────────────
import { Suspense }           from "react";
import type { Metadata }      from "next";
import { CatalogClient }      from "./components/CatalogClient";
import { getProductosCatalogo } from "@/app/global/lib/db/getProductosCatalogo";
import { getCategorias }      from "@/app/global/lib/db/getCategorias";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.com";

export const metadata: Metadata = {
  title:       "Catálogo | Perfiles de Aluminio y Accesorios Industriales",
  description:
    "Explora nuestro catálogo completo de perfiles de aluminio, tornillería industrial y accesorios. Filtros por categoría, marca y disponibilidad.",
  alternates: {
    canonical: `${SITE_URL}/catalogo`,
  },
  openGraph: {
    title:       "Catálogo — CraftQube | Perfiles de Aluminio y Accesorios",
    description: "Explora nuestro catálogo completo de perfiles de aluminio, tornillería industrial y accesorios.",
    url:         `${SITE_URL}/catalogo`,
    type:        "website",
  },
};

export default async function CatalogoPage() {
  // ── SSR: fetch inicial en el servidor ─────────────────────
  // Esto garantiza que los primeros 24 productos estén en el
  // HTML y sean indexables por Google sin ejecutar JS.
  const [{ productos: initialProductos, total: initialTotal, pages: initialPages }, categorias] =
    await Promise.all([
      getProductosCatalogo({ sort: "reciente", page: 1, limit: 24 }),
      getCategorias().catch(() => []),
    ]);

  return (
    <>
      {/* H1 semántico visible para crawlers — CatalogClient puede
          ocultarlo visualmente si el diseño lo requiere */}
      <h1 className="sr-only">
        Catálogo de productos CraftQube — Perfiles de Aluminio y Accesorios Industriales
      </h1>

      <Suspense fallback={null}>
        <CatalogClient
          initialProductos={initialProductos}
          initialTotal={initialTotal}
          initialPages={initialPages}
          initialCategorias={categorias}
        />
      </Suspense>
    </>
  );
}