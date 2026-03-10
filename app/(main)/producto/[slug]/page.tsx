// app/(main)/producto/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./components/ProductDetailClient";
import { RelatedProducts }     from "@/app/global/components/products/RelatedProducts";
import type { ProductoDetalle } from "@/app/global/types/product-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function fetchProducto(slug: string): Promise<ProductoDetalle | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/productos/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const producto = await fetchProducto(slug);

  if (!producto) {
    return { title: "Producto no encontrado — Craftqube" };
  }

  return {
    title:       producto.meta_titulo       ?? `${producto.titulo} — Craftqube`,
    description: producto.meta_descripcion  ?? producto.descripcion_corta ?? undefined,
    openGraph: {
      title:       producto.meta_titulo       ?? producto.titulo,
      description: producto.meta_descripcion  ?? producto.descripcion_corta ?? undefined,
      type:        "website",
    },
  };
}

export default async function ProductoPage({ params }: PageProps) {
  const { slug } = await params;
  const producto = await fetchProducto(slug);

  if (!producto) notFound();

  const categoriaSlug = producto.categorias[0]?.slug ?? "";

  return (
    <>
      <ProductDetailClient producto={producto} />

      {/* Productos relacionados — solo si tiene categoría */}
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