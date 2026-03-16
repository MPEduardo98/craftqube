// app/global/components/products/ProductCard.tsx
"use client";

import { useState }    from "react";
import Link            from "next/link";
import Image           from "next/image";
import { motion }      from "framer-motion";
import { useWishlist } from "@/app/global/context/WishlistContext";
import { useCart }     from "@/app/global/context/CartContext";
import type { Producto } from "@/app/global/types/product";
import { formatPrice }   from "@/app/global/lib/format";
import { resolveImageUrl } from "@/app/global/lib/resolveImageUrl";

/* ── Ilustración placeholder ────────────────────────────── */
function FallbackIllustration({ categoria }: { categoria?: string | null }) {
  const cat    = (categoria ?? "").toLowerCase();
  const gradId = `grad-${cat.replace(/\s+/g, "-")}-${Math.random().toString(36).substring(7)}`;

  return (
    <svg viewBox="0 0 160 160" width="100%" height="100%" style={{ maxWidth: 120, maxHeight: 120 }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2563EB" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {cat.includes("perfil") || cat.includes("aluminio") ? (
        <>
          <path d="M80 130 L80 50 L130 50" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.55" />
          <rect x="55" y="28" width="30" height="30" rx="3" fill={`url(#${gradId})`} opacity="0.5" />
          <circle cx="80" cy="50"  r="5" fill="#2563EB" opacity="0.6" />
          <circle cx="80" cy="130" r="5" fill="#2563EB" opacity="0.6" />
          <circle cx="130" cy="50" r="5" fill="#2563EB" opacity="0.6" />
        </>
      ) : (
        <>
          <circle cx="80" cy="80" r="40" fill="none" stroke="#2563EB" strokeWidth="2" opacity="0.2" />
          <polygon points="80,22 92,54 68,54"    fill="#2563EB" opacity="0.65" />
          <polygon points="80,138 92,106 68,106" fill="#2563EB" opacity="0.65" />
          <polygon points="22,80 54,68 54,92"    fill="#2563EB" opacity="0.65" />
          <polygon points="138,80 106,68 106,92" fill="#2563EB" opacity="0.65" />
          <circle cx="80" cy="80" r="16" fill={`url(#${gradId})`} opacity="0.85" />
        </>
      )}
    </svg>
  );
}

interface ProductCardProps {
  producto:    Producto;
  imageSizes?: string;
}

export function ProductCard({ producto, imageSizes }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered,  setHovered]  = useState(false);

  const { toggleItem, isWished }       = useWishlist();
  const { addItem, updateQty, items }  = useCart();

  const tieneStock     = (producto.stock ?? 0) > 0;
  const tieneDescuento =
    producto.precio_original !== null &&
    producto.precio_original > 0 &&
    producto.precio_original > (producto.precio ?? 0);

  // resolveImageUrl maneja tanto URLs completas de R2 como nombres locales legacy
  const imageSrc = !imgError
    ? resolveImageUrl(producto.imagen_nombre, producto.id)
    : null;

  const descuentoPct = tieneDescuento
    ? Math.round(((producto.precio_original! - producto.precio!) / producto.precio_original!) * 100)
    : 0;

  const wished         = isWished(producto.id);
  const varianteId     = producto.id;
  const itemEnCarrito  = items.find(item => item.varianteId === varianteId);
  const mostrarSelector = !!itemEnCarrito;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    toggleItem({
      productoId:   producto.id,
      slug:         producto.slug,
      titulo:       producto.titulo,
      precio:       producto.precio ?? 0,
      imagenNombre: producto.imagen_nombre ?? null,
      imagenAlt:    producto.imagen_alt ?? null,
      marca:        producto.marca ?? null,
    });
  };

  const handleAgregarAlCarrito = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!tieneStock) return;
    addItem({
      productoId:   producto.id,
      varianteId,
      titulo:       producto.titulo,
      slug:         producto.slug,
      sku:          producto.sku ?? `PROD-${producto.id}`,
      precio:       producto.precio ?? 0,
      cantidad:     1,
      imagenNombre: producto.imagen_nombre ?? null,
      imagenAlt:    producto.imagen_alt ?? null,
      atributos:    [],
    });
  };

  const handleIncrementar = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (itemEnCarrito) updateQty(varianteId, itemEnCarrito.cantidad + 1);
  };

  const handleDecrementar = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (itemEnCarrito && itemEnCarrito.cantidad > 1) updateQty(varianteId, itemEnCarrito.cantidad - 1);
  };

  return (
    <motion.article
      className="flex flex-col rounded-xl overflow-hidden cq-product-card"
      style={{ background: "var(--color-cq-surface)", height: "100%", width: "100%", border: "1px solid var(--color-cq-border)" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={()   => setHovered(false)}
    >
      {/* ── Imagen 1:1 ── */}
      <Link
        href={`/producto/${producto.slug}`}
        className="relative w-full overflow-hidden shrink-0 block"
        style={{ aspectRatio: "1 / 1", background: "var(--color-cq-surface-2)", borderBottom: "1px solid var(--color-cq-border)" }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={producto.imagen_alt ?? producto.titulo}
            fill
            className="object-contain p-3 transition-transform duration-300"
            style={{ transform: hovered ? "scale(1.04)" : "scale(1)" }}
            sizes={imageSizes ?? "(max-width: 640px) 50vw, 25vw"}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FallbackIllustration categoria={producto.categoria} />
          </div>
        )}

        {/* Badge descuento */}
        {tieneDescuento && (
          <span
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-white font-bold"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.06em", background: "var(--color-cq-accent)" }}
          >
            -{descuentoPct}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
          style={{
            background: wished ? "var(--color-cq-accent)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
            border: wished ? "none" : "1px solid var(--color-cq-border)",
          }}
          aria-label={wished ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <svg viewBox="0 0 24 24" width="12" height="12" fill={wished ? "white" : "none"} stroke={wished ? "white" : "var(--color-cq-muted)"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </Link>

      {/* ── Info ── */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        {/* Marca */}
        {producto.marca && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--color-cq-muted-2)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {producto.marca}
          </span>
        )}

        {/* Título */}
        <Link href={`/producto/${producto.slug}`} style={{ textDecoration: "none" }}>
          <p
            className="leading-snug line-clamp-2 hover:text-blue-500 transition-colors"
            style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 700, color: "var(--color-cq-text)", letterSpacing: "0.01em" }}
          >
            {producto.titulo}
          </p>
        </Link>

        {/* SKU */}
        {producto.sku && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", color: "var(--color-cq-muted-2)", letterSpacing: "0.06em" }}>
            {producto.sku}
          </span>
        )}

        <div className="flex-1" />

        {/* Precio + stock + CTA */}
        <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid var(--color-cq-border)" }}>
          <div>
            {producto.precio !== null && producto.precio > 0 ? (
              <div className="flex items-baseline gap-1.5">
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                  {formatPrice(producto.precio)}
                </span>
                {tieneDescuento && (
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--color-cq-muted-2)", textDecoration: "line-through" }}>
                    {formatPrice(producto.precio_original!)}
                  </span>
                )}
              </div>
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-cq-muted-2)" }}>Consultar precio</span>
            )}
          </div>

          {!tieneStock ? (
            <span
              className="flex items-center justify-center rounded-lg text-xs"
              style={{ height: 32, background: "var(--color-cq-surface-2)", color: "var(--color-cq-muted-2)", fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.06em", border: "1px solid var(--color-cq-border)" }}
            >
              Sin stock
            </span>
          ) : mostrarSelector ? (
            <div className="flex items-center justify-between rounded-lg overflow-hidden" style={{ height: 32, border: "1px solid var(--color-cq-accent)", background: "var(--color-cq-accent-glow)" }}>
              <button onClick={handleDecrementar} className="flex items-center justify-center h-full px-3 hover:bg-blue-50 transition" style={{ color: "var(--color-cq-accent)" }}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
              </button>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, color: "var(--color-cq-accent)" }}>
                {itemEnCarrito?.cantidad}
              </span>
              <button onClick={handleIncrementar} className="flex items-center justify-center h-full px-3 hover:bg-blue-50 transition" style={{ color: "var(--color-cq-accent)" }}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAgregarAlCarrito}
              className="flex items-center justify-center gap-1.5 rounded-lg font-bold transition-all"
              style={{
                height: 32,
                background:  "var(--color-cq-primary)",
                color:       "white",
                fontFamily:  "var(--font-display)",
                fontSize:    "0.62rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Agregar
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}