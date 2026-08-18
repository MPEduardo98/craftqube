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
import { CatalogClient }      from "@/features/catalog/components/CatalogClient";
import { getProductosCatalogo } from "@/features/catalog/lib/getProductosCatalogo";
import { getCategorias }      from "@/features/categories/lib/getCategorias";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.mx";

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

interface PageProps {
  searchParams: Promise<{
    cat?: string; marca?: string; sort?: string;
    stock?: string; q?: string; page?: string;
  }>;
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  // Nota: /catalogo?cat=X → 301 /categoria/X se resuelve en
  // next.config.ts (redirects), no aquí. permanentRedirect() en
  // una page responde 200 con la señal de redirect en el payload
  // RSC — el navegador navega, pero un crawler ve 200.

  // ── SSR: fetch inicial en el servidor ─────────────────────
  // Esto garantiza que los primeros 24 productos estén en el
  // HTML y sean indexables por Google sin ejecutar JS.
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const [{ productos: initialProductos, total: initialTotal, pages: initialPages }, categorias] =
    await Promise.all([
      getProductosCatalogo({
        sort:      sp.sort  ?? "reciente",
        marca:     sp.marca ?? "",
        q:         sp.q     ?? "",
        soloStock: sp.stock === "1",
        page,
        limit:     24,
      }),
      getCategorias().catch(() => []),
    ]);

  return (
    <>
      {/* H1 semántico en el servidor: CatalogClient es "use client" y
          llega por streaming, así que su encabezado no estaría en el
          HTML inicial que rastrea Google. */}
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