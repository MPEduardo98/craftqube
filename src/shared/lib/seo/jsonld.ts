// app/global/lib/seo/jsonld.ts
import type { ProductoDetalle } from "@/features/products/types/product-detail";
import type { Producto }        from "@/features/products/types/product";
import { richTextToPlain }      from "@/shared/lib/rich-text";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.mx";
const SITE_NAME = "CraftQube";
const CURRENCY  = "MXN";

// ── Product Schema ────────────────────────────────────────────
export function buildProductJsonLd(producto: ProductoDetalle): object {
  const varianteDefault =
    producto.variantes.find((v) => v.es_default) ?? producto.variantes[0];

  const imagenPrincipal = producto.imagenes[0];
  const imageUrl = imagenPrincipal
    ? `${SITE_URL}/uploads/productos/${producto.id}/${imagenPrincipal.url.split("/").pop()}`
    : undefined;

  const canonicalUrl = `${SITE_URL}/producto/${producto.slug}`;

  const priceValidUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

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
    // La descripción se guarda como HTML del editor; schema.org espera texto.
    description:  richTextToPlain(producto.descripcion) || undefined,
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
// OnlineStore es el subtipo de Organization que Google recomienda
// para tiendas. La política de devoluciones va aquí, a nivel tienda,
// para que aplique a todos los productos sin repetirla en cada uno.
export function buildOrganizationJsonLd(tienda: {
  nombre: string; logo: string; email: string; telefono: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type":    "OnlineStore",
    "@id":      `${SITE_URL}/#organizacion`,
    name:       tienda.nombre || SITE_NAME,
    url:        SITE_URL,
    logo:       tienda.logo,
    ...(tienda.email    && { email:     tienda.email }),
    ...(tienda.telefono && { telephone: tienda.telefono }),
    contactPoint: {
      "@type":           "ContactPoint",
      contactType:       "customer service",
      availableLanguage: "Spanish",
      areaServed:        "MX",
      ...(tienda.email    && { email:     tienda.email }),
      ...(tienda.telefono && { telephone: tienda.telefono }),
    },
    // Debe coincidir con /politicas/politica-de-reembolso: por regla
    // general no se aceptan devoluciones.
    hasMerchantReturnPolicy: {
      "@type":              "MerchantReturnPolicy",
      applicableCountry:    "MX",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      merchantReturnLink:   `${SITE_URL}/politicas/politica-de-reembolso`,
    },
  };
}

// ── WebSite Schema (nombre del sitio en los resultados) ──────
export function buildWebSiteJsonLd(nombre: string): object {
  return {
    "@context":  "https://schema.org",
    "@type":     "WebSite",
    "@id":       `${SITE_URL}/#sitio`,
    name:        nombre || SITE_NAME,
    url:         SITE_URL,
    inLanguage:  "es-MX",
    publisher:   { "@id": `${SITE_URL}/#organizacion` },
  };
}

// ── Imagen al compartir cuando la página no tiene una propia ──
// Es el logo configurado en /admin/ajustes; sin él, el del repo.
export function imagenSocial(logoUrl: string | null): string {
  return logoUrl || `${SITE_URL}/Logo.png`;
}