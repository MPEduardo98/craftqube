// app/global/components/products/ProductCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useWishlist } from "@/app/global/context/WishlistContext";
import { useCart } from "@/app/global/context/CartContext";
import type { Producto } from "@/app/global/types/product";
import { formatPrice } from "@/app/global/lib/format";

/* ── Ilustración placeholder ────────────────────────────── */
function FallbackIllustration({ categoria }: { categoria?: string | null }) {
  const cat = (categoria ?? "").toLowerCase();
  const gradId = `grad-${cat.replace(/\s+/g, "-")}-${Math.random().toString(36).substring(7)}`;

  return (
    <svg viewBox="0 0 160 160" width="100%" height="100%" style={{ maxWidth: 120, maxHeight: 120 }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {cat.includes("perfil") || cat.includes("aluminio") ? (
        <>
          <path d="M80 130 L80 50 L130 50" stroke="#2563EB" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.55" />
          <rect x="55" y="28" width="30" height="30" rx="3" fill={`url(#${gradId})`} opacity="0.5" />
          <circle cx="80" cy="50" r="5" fill="#2563EB" opacity="0.6" />
          <circle cx="80" cy="130" r="5" fill="#2563EB" opacity="0.6" />
          <circle cx="130" cy="50" r="5" fill="#2563EB" opacity="0.6" />
        </>
      ) : cat.includes("laptop") || cat.includes("tech") ? (
        <>
          <rect x="25" y="30" width="110" height="76" rx="5" stroke="#2563EB" strokeWidth="3" fill="none" opacity="0.5" />
          <rect x="35" y="40" width="90" height="56" rx="3" fill={`url(#${gradId})`} opacity="0.6" />
          <rect x="10" y="112" width="140" height="10" rx="5" fill={`url(#${gradId})`} opacity="0.3" />
          <rect x="55" y="108" width="50" height="4" rx="2" fill="#2563EB" opacity="0.35" />
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
  const [hovered, setHovered]   = useState(false);

  const { toggleItem, isWished } = useWishlist();
  const { addItem, updateQty, items } = useCart();

  const tieneStock     = (producto.stock ?? 0) > 0;
  const tieneDescuento =
    producto.precio_original !== null &&
    producto.precio_original > 0 &&
    producto.precio_original > (producto.precio ?? 0);

  const imageSrc =
    producto.imagen_nombre && !imgError
      ? `/productos/${producto.id}/${producto.imagen_nombre}`
      : null;

  const descuentoPct = tieneDescuento
    ? Math.round(((producto.precio_original! - producto.precio!) / producto.precio_original!) * 100)
    : 0;

  const wished        = isWished(producto.id);
  const varianteId    = producto.id;
  const itemEnCarrito = items.find(item => item.varianteId === varianteId);
  const mostrarSelector = !!itemEnCarrito;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.preventDefault();
    e.stopPropagation();
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
    e.preventDefault();
    e.stopPropagation();
    if (itemEnCarrito) updateQty(varianteId, itemEnCarrito.cantidad + 1);
  };

  const handleDecrementar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (itemEnCarrito && itemEnCarrito.cantidad > 1) updateQty(varianteId, itemEnCarrito.cantidad - 1);
  };

  return (
    <motion.article
      className="flex flex-col rounded-xl overflow-hidden cq-product-card"
      style={{ background: "var(--color-cq-surface)", height: "100%", width: "100%", border: "1px solid var(--color-cq-border)" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* ── Imagen 1:1 ── */}
      <Link
        href={`/producto/${producto.slug}`}
        className="relative w-full overflow-hidden shrink-0 block"
        style={{ aspectRatio: "1 / 1", background: "var(--color-cq-surface-2)", borderBottom: "1px solid var(--color-cq-border)" }}
      >
        {imageSrc ? (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              animate={{ scale: hovered ? 1.1 : 1 }}
              transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Image
                src={imageSrc}
                alt={producto.imagen_alt ?? producto.titulo}
                fill
                className="object-contain p-3"
                sizes={imageSizes ?? "(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"}
                onError={() => setImgError(true)}
              />
            </motion.div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <motion.div animate={{ scale: hovered ? 1.06 : 1 }} transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}>
              <FallbackIllustration categoria={producto.categoria} />
            </motion.div>
          </div>
        )}

        {tieneDescuento && (
          <span className="absolute top-2 left-2 font-bold px-2 py-0.5 rounded-md pointer-events-none"
            style={{ background: "var(--color-cq-primary)", color: "white", fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", letterSpacing: "0.04em" }}>
            -{descuentoPct}%
          </span>
        )}

        {producto.marca && (
          <span className="absolute top-2 right-2 pointer-events-none"
            style={{ display: "inline-block", padding: "3px 8px", borderRadius: "99px", background: "var(--color-cq-primary)", boxShadow: "0 2px 8px rgba(29,78,216,0.3)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.54rem", letterSpacing: "0.06em", color: "#ffffff", fontWeight: 600, whiteSpace: "nowrap" }}>
            {producto.marca}
          </span>
        )}

        <motion.button
          onClick={handleWishlistToggle}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.85 }}
          title={wished ? "Quitar de favoritos" : "Guardar en favoritos"}
          className="absolute bottom-2 left-2 flex items-center justify-center rounded-lg z-10"
          style={{ width: "28px", height: "28px", background: wished ? "rgba(239,68,68,0.12)" : "var(--color-cq-surface)", border: wished ? "1px solid rgba(239,68,68,0.3)" : "1px solid var(--color-cq-border)", color: wished ? "#EF4444" : "var(--color-cq-muted)" }}
        >
          <svg viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth={wished ? 0 : 2} width="13" height="13">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.button>
      </Link>

      {/* ── Contenido ── */}
      <div className="flex-1 flex flex-col p-3.5 gap-2">
        {producto.categoria && (
          <span className="uppercase" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", letterSpacing: "0.08em", color: "var(--color-cq-muted-2)", fontWeight: 600 }}>
            {producto.categoria}
          </span>
        )}

        <Link
          href={`/producto/${producto.slug}`}
          className="line-clamp-2 flex-1 font-semibold leading-snug hover:text-blue-500 transition-colors"
          style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.88rem", color: "var(--color-cq-text)", textDecoration: "none", minHeight: "2.6em" }}
        >
          {producto.titulo}
        </Link>

        <div className="flex items-baseline gap-2 flex-wrap">
          <span style={{ fontFamily: "var(--font-display, sans-serif)", fontSize: "1.1rem", fontWeight: 800, color: "var(--color-cq-text)" }}>
            {formatPrice(producto.precio ?? 0)}
          </span>
          {tieneDescuento && (
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", color: "var(--color-cq-muted-2)", textDecoration: "line-through", textDecorationThickness: "1px" }}>
              {formatPrice(producto.precio_original!)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2">
          {!mostrarSelector ? (
            <motion.button
              onClick={handleAgregarAlCarrito}
              disabled={!tieneStock}
              whileHover={tieneStock ? { scale: 1.02 } : {}}
              whileTap={tieneStock ? { scale: 0.98 } : {}}
              className="flex items-center justify-center gap-1.5 rounded-lg font-bold text-xs w-full"
              style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: "0.06em", textTransform: "uppercase", height: "38px", background: tieneStock ? "var(--color-cq-primary)" : "var(--color-cq-surface-2)", color: tieneStock ? "#ffffff" : "var(--color-cq-muted-2)", border: tieneStock ? "none" : "1px solid var(--color-cq-border)", boxShadow: tieneStock ? "0 2px 12px rgba(29,78,216,0.25)" : "none", cursor: tieneStock ? "pointer" : "not-allowed", opacity: tieneStock ? 1 : 0.6 }}
            >
              {tieneStock ? (
                <>
                  <svg viewBox="0 0 576 512" fill="currentColor" width="12" height="12">
                    <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                  </svg>
                  Agregar
                </>
              ) : "Sin stock"}
            </motion.button>
          ) : (
            <div className="flex items-center rounded-lg overflow-hidden w-full"
              style={{ border: "1px solid var(--color-cq-border)", height: "38px", background: "var(--color-cq-surface)" }}>
              <button onClick={handleDecrementar} className="flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ width: "38px", height: "38px", color: "var(--color-cq-text)", cursor: "pointer", border: "none", background: "transparent" }}>
                <svg viewBox="0 0 448 512" fill="currentColor" width="10" height="10"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>
              </button>
              <div className="flex-1 flex items-center justify-center font-bold text-sm"
                style={{ color: "var(--color-cq-text)", fontFamily: "var(--font-mono)", borderLeft: "1px solid var(--color-cq-border)", borderRight: "1px solid var(--color-cq-border)" }}>
                {itemEnCarrito?.cantidad ?? 1}
              </div>
              <button onClick={handleIncrementar} className="flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ width: "38px", height: "38px", color: "var(--color-cq-text)", cursor: "pointer", border: "none", background: "transparent" }}>
                <svg viewBox="0 0 448 512" fill="currentColor" width="10" height="10"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}