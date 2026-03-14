// app/global/lib/seo/jsonld.ts
// ─────────────────────────────────────────────────────────────
// Constructores de JSON-LD para Schema.org.
// - buildProductJsonLd     → Product + Offer/AggregateOffer
// - buildBreadcrumbJsonLd  → BreadcrumbList
// - buildCategoryJsonLd    → ItemList
// - buildOrganizationJsonLd → Organization (usado en layout)
// ─────────────────────────────────────────────────────────────
import type { ProductoDetalle } from "@/app/global/types/product-detail";
import type { Producto }        from "@/app/global/types/product";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.com";
const SITE_NAME = "CraftQube";
const CURRENCY  = "MXN";

// ── Product Schema ────────────────────────────────────────────
export function buildProductJsonLd(producto: ProductoDetalle): object {
  const varianteDefault =
    producto.variantes.find((v) => v.es_default) ?? producto.variantes[0];

  // Imagen principal — construye URL absoluta
  const imagenPrincipal = producto.imagenes[0];
  const imageUrl = imagenPrincipal
    ? `${SITE_URL}/uploads/productos/${producto.id}/${imagenPrincipal.url.split("/").pop()}`
    : undefined;

  const canonicalUrl = `${SITE_URL}/producto/${producto.slug}`;

  // Fecha de expiración de precio (7 días)
  const priceValidUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // MySQL devuelve DECIMAL como string — Number() normaliza ambos casos
  const offers = producto.variantes.map((v) => ({
    "@type":           "Offer",
    sku:               v.sku,
    price:             Number(v.precio_final).toFixed(2),
    priceCurrency:     CURRENCY,
    priceValidUntil,
    availability:
      v.stock > 0 || v.vender_sin_existencia
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    url:    canonicalUrl,
    seller: { "@type": "Organization", name: SITE_NAME },
  }));

  const offerNode =
    offers.length === 1
      ? offers[0]
      : {
          "@type":        "AggregateOffer",
          lowPrice:       Math.min(...producto.variantes.map((v) => Number(v.precio_final))).toFixed(2),
          highPrice:      Math.max(...producto.variantes.map((v) => Number(v.precio_final))).toFixed(2),
          priceCurrency:  CURRENCY,
          offerCount:     offers.length,
          offers,
        };

  return {
    "@context":   "https://schema.org",
    "@type":      "Product",
    name:         producto.titulo,
    description:  producto.descripcion_corta ?? undefined,
    sku:          varianteDefault?.sku,
    url:          canonicalUrl,
    image:        imageUrl,
    ...(producto.marca && {
      brand: { "@type": "Brand", name: producto.marca },
    }),
    ...(producto.categorias[0] && {
      category: producto.categorias[0].nombre,
    }),
    offers: offerNode,
    ...(producto.updated_at && { dateModified: producto.updated_at }),
    ...(producto.created_at && { datePublished: producto.created_at }),
  };
}

// ── BreadcrumbList Schema ────────────────────────────────────
export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[]
): object {
  return {
    "@context":        "https://schema.org",
    "@type":           "BreadcrumbList",
    itemListElement:   items.map((item, i) => ({
      "@type":    "ListItem",
      position:   i + 1,
      name:       item.name,
      item:       item.url,
    })),
  };
}

// ── ItemList Schema (para páginas de categoría) ──────────────
export function buildCategoryJsonLd(
  categoria: { nombre: string; slug: string; descripcion: string | null },
  productos:  Pick<Producto, "titulo" | "slug">[]
): object {
  return {
    "@context":     "https://schema.org",
    "@type":        "ItemList",
    name:           categoria.nombre,
    description:    categoria.descripcion ?? undefined,
    url:            `${SITE_URL}/categoria/${categoria.slug}`,
    numberOfItems:  productos.length,
    itemListElement: productos.map((p, i) => ({
      "@type":    "ListItem",
      position:   i + 1,
      url:        `${SITE_URL}/producto/${p.slug}`,
      name:       p.titulo,
    })),
  };
}

// ── Organization Schema (una sola vez en layout) ─────────────
export function buildOrganizationJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type":    "Organization",
    name:       SITE_NAME,
    url:        SITE_URL,
    logo:       `${SITE_URL}/logo.png`,
    sameAs:     [],
    contactPoint: {
      "@type":           "ContactPoint",
      contactType:       "customer service",
      availableLanguage: "Spanish",
    },
  };
}