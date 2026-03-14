// app/(main)/categoria/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────
// Página de categoría SSR — indexable sin JavaScript.
//
// Arquitectura:
//  - Server Component puro
//  - SSG via generateStaticParams
//  - metadata dinámica + canonical + OG + Twitter
//  - JSON-LD BreadcrumbList + ItemList
//  - Grid de productos renderizado en el servidor (HTML inicial)
//  - Paginación por URL (?page=N) — amigable a crawlers
// ─────────────────────────────────────────────────────────────
import type { Metadata }       from "next";
import { notFound }            from "next/navigation";
import Link                    from "next/link";
import { getCategoriaBySlug }  from "@/app/global/lib/db/getCategoriaBySlug";
import { getAllCategoriaSlugs } from "@/app/global/lib/db/getAllSlugs";
import { getProductosCatalogo } from "@/app/global/lib/db/getProductosCatalogo";
import { buildBreadcrumbJsonLd, buildCategoryJsonLd } from "@/app/global/lib/seo/jsonld";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.com";
const PAGE_SIZE = 24;

interface PageProps {
  params:      Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// ── SSG ───────────────────────────────────────────────────────
export async function generateStaticParams() {
  const categorias = await getAllCategoriaSlugs();
  return categorias.map(({ slug }) => ({ slug }));
}

// ── Metadata dinámica ─────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug }   = await params;
  const categoria  = await getCategoriaBySlug(slug);

  if (!categoria) return { title: "Categoría no encontrada" };

  const title = `${categoria.nombre} — CraftQube`;
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
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url:      canonicalUrl,
      siteName: "CraftQube",
      locale:   "es_MX",
      type:     "website",
      images:   [{ url: imageUrl, width: 1200, height: 630, alt: categoria.nombre }],
    },
    twitter: {
      card:   "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

// ── Componente de tarjeta de producto (SSR, sin JS) ──────────
function ProductoCard({
  slug,
  titulo,
  descripcion_corta,
  imagen_nombre,
  imagen_alt,
  precio,
  precio_original,
  stock,
  id,
  marca,
}: {
  slug:             string;
  titulo:           string;
  descripcion_corta?: string | null;
  imagen_nombre?:   string | null;
  imagen_alt?:      string | null;
  precio?:          number | null;
  precio_original?: number | null;
  stock?:           number | null;
  id:               number;
  marca?:           string | null;
}) {
  const imageUrl = imagen_nombre
    ? `/uploads/productos/${id}/${imagen_nombre}`
    : null;
  const enStock  = (stock ?? 0) > 0;

  return (
    <article
      style={{
        border:       "1px solid var(--color-cq-border)",
        borderRadius: "16px",
        overflow:     "hidden",
        background:   "var(--color-cq-surface)",
        display:      "flex",
        flexDirection: "column",
        transition:   "border-color 0.2s",
      }}
    >
      <Link
        href={`/producto/${slug}`}
        aria-label={`Ver ${titulo}`}
        style={{ display: "contents", textDecoration: "none" }}
      >
        {/* Imagen */}
        <div
          style={{
            aspectRatio: "1 / 1",
            background:  "var(--color-cq-surface-2)",
            display:     "flex",
            alignItems:  "center",
            justifyContent: "center",
            overflow:    "hidden",
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={imagen_alt ?? titulo}
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: "1rem" }}
            />
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-cq-border)" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          {marca && (
            <span
              style={{
                fontFamily:    "var(--font-mono)",
                fontSize:      "0.62rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color:         "var(--color-cq-muted)",
              }}
            >
              {marca}
            </span>
          )}

          <h2
            style={{
              fontFamily:      "var(--font-display)",
              fontSize:        "0.9rem",
              fontWeight:      700,
              color:           "var(--color-cq-text)",
              lineHeight:      1.3,
              letterSpacing:   "-0.01em",
              display:         "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow:        "hidden",
            }}
          >
            {titulo}
          </h2>

          {descripcion_corta && (
            <p
              style={{
                fontFamily:      "var(--font-body)",
                fontSize:        "0.75rem",
                color:           "var(--color-cq-muted)",
                lineHeight:      1.5,
                display:         "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow:        "hidden",
              }}
            >
              {descripcion_corta}
            </p>
          )}

          <div style={{ marginTop: "auto", paddingTop: "8px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              {precio && (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize:   "1rem",
                    fontWeight: 700,
                    color:      "var(--color-cq-accent)",
                  }}
                >
                  ${precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  <span style={{ fontSize: "0.65rem", marginLeft: "2px", fontWeight: 400, color: "var(--color-cq-muted)" }}>MXN</span>
                </p>
              )}
              {precio_original && precio && precio_original > precio && (
                <p
                  style={{
                    fontFamily:     "var(--font-mono)",
                    fontSize:       "0.72rem",
                    color:          "var(--color-cq-muted)",
                    textDecoration: "line-through",
                  }}
                >
                  ${precio_original.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
            <span
              style={{
                fontFamily:    "var(--font-mono)",
                fontSize:      "0.6rem",
                letterSpacing: "0.08em",
                padding:       "3px 8px",
                borderRadius:  "99px",
                background:    enStock ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                color:         enStock ? "rgb(22,163,74)"      : "rgb(220,38,38)",
                border:        `1px solid ${enStock ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
              }}
            >
              {enStock ? "En stock" : "Sin stock"}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

// ── Paginación SSR ────────────────────────────────────────────
function Paginacion({
  slug,
  page,
  pages,
}: {
  slug:  string;
  page:  number;
  pages: number;
}) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Paginación" style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px", flexWrap: "wrap" }}>
      {page > 1 && (
        <Link
          href={`/categoria/${slug}?page=${page - 1}`}
          style={{
            padding:      "8px 16px",
            borderRadius: "8px",
            border:       "1px solid var(--color-cq-border)",
            fontFamily:   "var(--font-mono)",
            fontSize:     "0.72rem",
            color:        "var(--color-cq-muted)",
            textDecoration: "none",
          }}
        >
          ← Anterior
        </Link>
      )}

      {Array.from({ length: pages }, (_, i) => i + 1)
        .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages)
        .map((p, i, arr) => (
          <>
            {i > 0 && arr[i - 1] !== p - 1 && (
              <span key={`ellipsis-${p}`} style={{ padding: "8px 4px", color: "var(--color-cq-muted)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>…</span>
            )}
            <Link
              key={p}
              href={p === 1 ? `/categoria/${slug}` : `/categoria/${slug}?page=${p}`}
              aria-current={p === page ? "page" : undefined}
              style={{
                padding:      "8px 14px",
                borderRadius: "8px",
                border:       `1px solid ${p === page ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
                fontFamily:   "var(--font-mono)",
                fontSize:     "0.72rem",
                color:        p === page ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
                textDecoration: "none",
                fontWeight:   p === page ? 700 : 400,
              }}
            >
              {p}
            </Link>
          </>
        ))}

      {page < pages && (
        <Link
          href={`/categoria/${slug}?page=${page + 1}`}
          style={{
            padding:      "8px 16px",
            borderRadius: "8px",
            border:       "1px solid var(--color-cq-border)",
            fontFamily:   "var(--font-mono)",
            fontSize:     "0.72rem",
            color:        "var(--color-cq-muted)",
            textDecoration: "none",
          }}
        >
          Siguiente →
        </Link>
      )}
    </nav>
  );
}

// ── Página principal ──────────────────────────────────────────
export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const { slug }    = await params;
  const { page: rawPage } = await searchParams;
  const page        = Math.max(1, parseInt(rawPage ?? "1", 10));

  const [categoria, { productos, total, pages }] = await Promise.all([
    getCategoriaBySlug(slug),
    getProductosCatalogo({ cat: slug, page, limit: PAGE_SIZE }),
  ]);

  if (!categoria) notFound();

  const canonicalUrl    = `${SITE_URL}/categoria/${slug}`;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio",                url: SITE_URL },
    { name: "Catálogo",              url: `${SITE_URL}/catalogo` },
    { name: categoria.nombre,        url: canonicalUrl },
  ]);
  const categoryJsonLd  = buildCategoryJsonLd(categoria, productos);

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryJsonLd) }}
      />

      <section aria-labelledby="categoria-titulo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: "24px" }}>
            <ol
              className="flex items-center gap-1.5 flex-wrap"
              style={{
                fontFamily:    "var(--font-mono)",
                fontSize:      "0.68rem",
                letterSpacing: "0.06em",
                color:         "var(--color-cq-muted)",
                listStyle:     "none",
                padding:       0,
                margin:        0,
              }}
            >
              <li><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Inicio</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/catalogo" style={{ color: "inherit", textDecoration: "none" }}>Catálogo</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" style={{ color: "var(--color-cq-text)" }}>{categoria.nombre}</li>
            </ol>
          </nav>

          {/* Header de categoría */}
          <header style={{ marginBottom: "36px" }}>
            <h1
              id="categoria-titulo"
              style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight:    800,
                color:         "var(--color-cq-text)",
                letterSpacing: "-0.02em",
                lineHeight:    1.1,
              }}
            >
              {categoria.nombre}
            </h1>

            {categoria.descripcion && (
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize:   "1rem",
                  color:      "var(--color-cq-muted)",
                  marginTop:  "12px",
                  maxWidth:   "65ch",
                  lineHeight: 1.7,
                }}
              >
                {categoria.descripcion}
              </p>
            )}

            <p
              style={{
                fontFamily:    "var(--font-mono)",
                fontSize:      "0.72rem",
                color:         "var(--color-cq-muted)",
                marginTop:     "10px",
                letterSpacing: "0.06em",
              }}
            >
              {total} {total === 1 ? "producto" : "productos"}
              {pages > 1 && ` · Página ${page} de ${pages}`}
            </p>

            {/* CTA al catálogo completo con filtro activo */}
            <Link
              href={`/catalogo?cat=${slug}`}
              style={{
                display:       "inline-flex",
                alignItems:    "center",
                gap:           "6px",
                marginTop:     "14px",
                fontFamily:    "var(--font-mono)",
                fontSize:      "0.68rem",
                letterSpacing: "0.08em",
                color:         "var(--color-cq-accent)",
                textDecoration: "none",
              }}
            >
              Ver con filtros avanzados
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </header>

          {/* Grid de productos — SSR puro, indexable sin JS */}
          {productos.length > 0 ? (
            <div
              style={{
                display:               "grid",
                gridTemplateColumns:   "repeat(auto-fill, minmax(220px, 1fr))",
                gap:                   "20px",
              }}
            >
              {productos.map((p) => (
                <ProductoCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <p
              style={{
                fontFamily: "var(--font-body)",
                color:      "var(--color-cq-muted)",
                textAlign:  "center",
                padding:    "60px 0",
              }}
            >
              No hay productos en esta categoría por el momento.
            </p>
          )}

          {/* Paginación */}
          <Paginacion slug={slug} page={page} pages={pages} />
        </div>
      </section>
    </>
  );
}