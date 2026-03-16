// app/(main)/categoria/[slug]/page.tsx
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
  params:       Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
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
  descripcion,
  imagen_nombre,
  imagen_alt,
  precio,
  precio_original,
  stock,
  id,
  marca,
}: {
  slug:            string;
  titulo:          string;
  descripcion?:    string | null;
  imagen_nombre?:  string | null;
  imagen_alt?:     string | null;
  precio?:         number | null;
  precio_original?: number | null;
  stock?:          number | null;
  id:              number;
  marca?:          string | null;
}) {
  const imageUrl = imagen_nombre
    ? `/uploads/productos/${id}/${imagen_nombre}`
    : null;
  const enStock = (stock ?? 0) > 0;

  return (
    <article
      style={{
        border:        "1px solid var(--color-cq-border)",
        borderRadius:  "16px",
        overflow:      "hidden",
        background:    "var(--color-cq-surface)",
        display:       "flex",
        flexDirection: "column",
        transition:    "border-color 0.2s",
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
            aspectRatio:    "1 / 1",
            background:     "var(--color-cq-surface-2)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            overflow:       "hidden",
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
              fontFamily:  "var(--font-display)",
              fontSize:    "0.9rem",
              fontWeight:  700,
              color:       "var(--color-cq-text)",
              lineHeight:  1.3,
              margin:      0,
              display:     "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as const,
              overflow:    "hidden",
            }}
          >
            {titulo}
          </h2>

          {descripcion && (
            <p
              style={{
                fontFamily:  "var(--font-body)",
                fontSize:    "0.78rem",
                color:       "var(--color-cq-muted)",
                lineHeight:  1.5,
                margin:      0,
                display:     "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
                overflow:    "hidden",
              }}
            >
              {descripcion}
            </p>
          )}

          <div style={{ marginTop: "auto", paddingTop: "8px", display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
            {precio != null && precio > 0 ? (
              <>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize:   "1.1rem",
                    fontWeight: 800,
                    color:      "var(--color-cq-text)",
                  }}
                >
                  ${Number(precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
                {precio_original != null && precio_original > precio && (
                  <span
                    style={{
                      fontFamily:            "var(--font-mono)",
                      fontSize:              "0.72rem",
                      color:                 "var(--color-cq-muted-2)",
                      textDecoration:        "line-through",
                      textDecorationThickness: "1px",
                    }}
                  >
                    ${Number(precio_original).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </>
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-cq-muted)", letterSpacing: "0.06em" }}>
                Consultar precio
              </span>
            )}
          </div>

          <div
            style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          "5px",
              fontFamily:   "var(--font-mono)",
              fontSize:     "0.6rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color:        enStock ? "#22C55E" : "var(--color-cq-muted-2)",
            }}
          >
            <span
              style={{
                width:        "5px",
                height:       "5px",
                borderRadius: "50%",
                background:   enStock ? "#22C55E" : "var(--color-cq-muted-2)",
                flexShrink:   0,
              }}
            />
            {enStock ? "En stock" : "Agotado"}
          </div>
        </div>
      </Link>
    </article>
  );
}

// ── Paginación ────────────────────────────────────────────────
function Paginacion({ slug, page, pages }: { slug: string; page: number; pages: number }) {
  if (pages <= 1) return null;

  return (
    <nav
      aria-label="Paginación"
      style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", marginTop: "40px", flexWrap: "wrap" }}
    >
      {page > 1 && (
        <Link
          href={page === 2 ? `/categoria/${slug}` : `/categoria/${slug}?page=${page - 1}`}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--color-cq-border)", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-cq-muted)", textDecoration: "none" }}
        >
          ← Anterior
        </Link>
      )}

      {Array.from({ length: Math.min(5, pages) }, (_, i) => {
        const start = Math.max(1, Math.min(page - 2, pages - 4));
        const p     = start + i;
        return (
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
        );
      })}

      {page < pages && (
        <Link
          href={`/categoria/${slug}?page=${page + 1}`}
          style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--color-cq-border)", fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-cq-muted)", textDecoration: "none" }}
        >
          Siguiente →
        </Link>
      )}
    </nav>
  );
}

// ── Página principal ──────────────────────────────────────────
export default async function CategoriaPage({ params, searchParams }: PageProps) {
  const { slug }          = await params;
  const { page: rawPage } = await searchParams;
  const page              = Math.max(1, parseInt(rawPage ?? "1", 10));

  const [categoria, { productos, total, pages }] = await Promise.all([
    getCategoriaBySlug(slug),
    getProductosCatalogo({ cat: slug, page, limit: PAGE_SIZE }),
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

      <section aria-labelledby="categoria-titulo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: "24px" }}>
            <ol style={{ display: "flex", alignItems: "center", gap: "6px", listStyle: "none", margin: 0, padding: 0, fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-cq-muted)" }}>
              <li><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Inicio</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/catalogo" style={{ color: "inherit", textDecoration: "none" }}>Catálogo</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" style={{ color: "var(--color-cq-text)" }}>{categoria.nombre}</li>
            </ol>
          </nav>

          {/* Header */}
          <header style={{ marginBottom: "32px" }}>
            <h1 id="categoria-titulo" className="text-display" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", color: "var(--color-cq-text)" }}>
              {categoria.nombre}
            </h1>
            {categoria.descripcion && (
              <p style={{ marginTop: "8px", fontFamily: "var(--font-body)", color: "var(--color-cq-muted)", maxWidth: "600px" }}>
                {categoria.descripcion}
              </p>
            )}
            <p style={{ marginTop: "6px", fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--color-cq-muted-2)", letterSpacing: "0.06em" }}>
              {total} {total === 1 ? "producto" : "productos"}
              {pages > 1 && ` · Página ${page} de ${pages}`}
            </p>

            <Link
              href={`/catalogo?cat=${slug}`}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "14px", fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.08em", color: "var(--color-cq-accent)", textDecoration: "none" }}
            >
              Ver con filtros avanzados
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </header>

          {/* Grid de productos — SSR puro, indexable sin JS */}
          {productos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
              {productos.map((p) => (
                <ProductoCard key={p.id} {...p} />
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-cq-muted)", textAlign: "center", padding: "60px 0" }}>
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