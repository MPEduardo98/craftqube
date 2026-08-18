// app/(main)/categoria/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────
// URL canónica de una categoría: /categoria/<slug>
//
// Antes existían DOS páginas para lo mismo:
//   /categoria/<slug>        → grid SSR simple, sin filtros
//   /catalogo?cat=<slug>     → catálogo con filtros, sin SEO
// Eran contenido duplicado y dos sitios que mantener.
//
// Ahora esta ruta sirve el catálogo COMPLETO (mismos filtros,
// orden y vistas) precargado con la categoría, y /catalogo?cat=
// redirige 301 aquí. La categoría es la única faceta en la ruta
// porque es la que queremos indexable; marca/orden/stock/página
// siguen siendo query params.
// ─────────────────────────────────────────────────────────────
import type { Metadata }        from "next";
import { notFound }             from "next/navigation";
import Link                     from "next/link";
import { Suspense }             from "react";
import { getCategoriaBySlug }   from "@/features/categories/lib/getCategoriaBySlug";
import { getAllCategoriaSlugs } from "@/features/products/lib/getAllSlugs";
import { getProductosCatalogo } from "@/features/catalog/lib/getProductosCatalogo";
import { getCategorias }        from "@/features/categories/lib/getCategorias";
import { CatalogClient }        from "@/features/catalog/components/CatalogClient";
import { buildBreadcrumbJsonLd, buildCategoryJsonLd } from "@/shared/lib/seo/jsonld";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.mx";
const PAGE_SIZE = 24;

interface PageProps {
  params:       Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; marca?: string; sort?: string; stock?: string; q?: string }>;
}

// ── SSG ───────────────────────────────────────────────────────
export async function generateStaticParams() {
  const categorias = await getAllCategoriaSlugs();
  return categorias.map(({ slug }) => ({ slug }));
}

// ── Metadata dinámica ─────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug }  = await params;
  const categoria = await getCategoriaBySlug(slug);

  if (!categoria) return { title: "Categoría no encontrada" };

  // Sin sufijo: el template del layout raíz ya añade " — CraftQube".
  const title = categoria.nombre;
  const description =
    categoria.descripcion ??
    `Explora nuestra selección de ${categoria.nombre} en CraftQube México. Perfiles de aluminio y accesorios industriales de alta calidad con entrega rápida.`;
  const canonicalUrl = `${SITE_URL}/categoria/${slug}`;
  const imageUrl     = categoria.imagen
    ? `/uploads/categorias/${categoria.imagen}`
    : "/og-default.jpg";

  return {
    title,
    description,
    // Canonical siempre sin query params: las variantes filtradas
    // (?marca=, ?sort=, ?page=) consolidan en la URL limpia.
    alternates: { canonical: canonicalUrl },
    openGraph: {
      // og:title no pasa por el template del layout: va completo.
      title:    `${categoria.nombre} — CraftQube`,
      description,
      url:      canonicalUrl,
      siteName: "CraftQube",
      locale:   "es_MX",
      type:     "website",
      images:   [{ url: imageUrl, width: 1200, height: 630, alt: categoria.nombre }],
    },
    twitter: {
      card:   "summary_large_image",
      title:  `${categoria.nombre} — CraftQube`,
      description,
      images: [imageUrl],
    },
  };
}

// ── Breadcrumb (SSR, indexable sin JS) ────────────────────────
function Breadcrumb({ nombre }: { nombre: string }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: "20px" }}>
      <ol style={{ display: "flex", alignItems: "center", gap: "6px", listStyle: "none", margin: 0, padding: 0, fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-cq-muted)" }}>
        <li><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Inicio</Link></li>
        <li aria-hidden>/</li>
        <li><Link href="/catalogo" style={{ color: "inherit", textDecoration: "none" }}>Catálogo</Link></li>
        <li aria-hidden>/</li>
        <li aria-current="page" style={{ color: "var(--color-cq-text)" }}>{nombre}</li>
      </ol>
    </nav>
  );
}

// ── Página principal ──────────────────────────────────────────
export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp       = await searchParams;
  const page     = Math.max(1, parseInt(sp.page ?? "1", 10));

  // SSR de la primera carga con los filtros que vengan en la URL,
  // para que el HTML inicial ya traiga los productos correctos.
  const [categoria, { productos, total, pages }, categorias] = await Promise.all([
    getCategoriaBySlug(slug),
    getProductosCatalogo({
      cat:       slug,
      page,
      limit:     PAGE_SIZE,
      marca:     sp.marca ?? "",
      sort:      sp.sort  ?? "reciente",
      q:         sp.q     ?? "",
      soloStock: sp.stock === "1",
    }),
    getCategorias().catch(() => []),
  ]);

  if (!categoria) notFound();

  const canonicalUrl     = `${SITE_URL}/categoria/${slug}`;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio",         url: SITE_URL },
    { name: "Catálogo",       url: `${SITE_URL}/catalogo` },
    { name: categoria.nombre, url: canonicalUrl },
  ]);
  const categoryJsonLd = buildCategoryJsonLd(categoria, productos);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }} />

      {/* H1 semántico en el servidor: CatalogClient es "use client" y
          llega por streaming, así que su encabezado no estaría en el
          HTML inicial que rastrea Google. */}
      <h1 className="sr-only">
        {categoria.nombre} — CraftQube
      </h1>

      <Suspense fallback={null}>
        <CatalogClient
          categoriaSlug={slug}
          titulo={categoria.nombre}
          descripcion={categoria.descripcion}
          breadcrumb={<Breadcrumb nombre={categoria.nombre} />}
          initialProductos={productos}
          initialTotal={total}
          initialPages={pages}
          initialCategorias={categorias}
        />
      </Suspense>
    </>
  );
}
