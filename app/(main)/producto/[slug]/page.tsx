// app/(main)/producto/[slug]/page.tsx
import type { Metadata }           from "next";
import { notFound }                from "next/navigation";
import { ProductDetailClient }     from "./components/ProductDetailClient";
import { RelatedProducts }         from "@/app/global/components/products/RelatedProducts";
import { getProductoBySlug }       from "@/app/global/lib/db/getProductoBySlug";
import { getAllProductoSlugs }      from "@/app/global/lib/db/getAllSlugs";
import { buildProductJsonLd, buildBreadcrumbJsonLd } from "@/app/global/lib/seo/jsonld";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// SSG: pre-genera todas las páginas de producto en build
export async function generateStaticParams() {
  const slugs = await getAllProductoSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug }   = await params;
  const producto   = await getProductoBySlug(slug);

  if (!producto) return { title: "Producto no encontrado — Craftqube" };

  const title        = producto.meta_titulo      ?? `${producto.titulo} — Craftqube`;
  const description  = producto.meta_descripcion ?? producto.descripcion_corta ?? undefined;
  const canonicalUrl = `${SITE_URL}/producto/${slug}`;

  const imagenPrincipal = producto.imagenes[0];
  const ogImageUrl = imagenPrincipal
    ? `/uploads/productos/${producto.id}/${imagenPrincipal.url.split("/").pop()}`
    : "/og-default.jpg";

  const varianteDefault = producto.variantes.find((v) => v.es_default) ?? producto.variantes[0];
  const precio          = varianteDefault?.precio_final;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url:      canonicalUrl,
      siteName: "CraftQube",
      locale:   "es_MX",
      type:     "website",
      images: [
        {
          url:    ogImageUrl,
          width:  1200,
          height: 630,
          alt:    imagenPrincipal?.alt ?? producto.titulo,
        },
      ],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImageUrl],
    },
    other: {
      ...(precio && {
        "product:price:amount":   Number(precio).toFixed(2),
        "product:price:currency": "MXN",
      }),
    },
  };
}

export default async function ProductoPage({ params }: PageProps) {
  const { slug }   = await params;
  const producto   = await getProductoBySlug(slug);

  if (!producto) notFound();

  const categoriaSlug = producto.categorias[0]?.slug ?? "";

  // JSON-LD
  const productJsonLd    = buildProductJsonLd(producto);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio",   url: SITE_URL },
    { name: "Catálogo", url: `${SITE_URL}/catalogo` },
    ...(producto.categorias[0]
      ? [{ name: producto.categorias[0].nombre, url: `${SITE_URL}/categoria/${categoriaSlug}` }]
      : []
    ),
    { name: producto.titulo, url: `${SITE_URL}/producto/${slug}` },
  ]);

  return (
    <>
      {/* JSON-LD invisible — solo para crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Tu componente original intacto */}
      <ProductDetailClient producto={producto} />

      {categoriaSlug && (
        <div
          className="relative"
          style={{ background: "var(--color-cq-surface)", borderTop: "1px solid var(--color-cq-border)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <RelatedProducts
              categoriaSlug={categoriaSlug}
              productoSlug={slug}
              titulo="También te puede interesar"
              limit={5}
              layout="scroll"
            />
          </div>
        </div>
      )}
    </>
  );
}