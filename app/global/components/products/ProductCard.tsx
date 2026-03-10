// app/global/components/products/ProductCard.tsx
// ZOOM via Framer Motion (onHoverStart/End + motion.div) para animación suave
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/app/global/context/WishlistContext";
import type { Producto } from "@/app/global/types/product";

/* ─── Fallback illustration ──────────────────────────────── */
function FallbackIllustration({ categoria }: { categoria?: string | null }) {
  const cat    = (categoria ?? "").toLowerCase();
  const gradId = `grad-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[90px]">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#2563EB" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {cat.includes("perfil") || cat.includes("aluminio") || cat.includes("estructura") ? (
        <>
          <rect x="20" y="20" width="120" height="24" rx="4" fill={`url(#${gradId})`} opacity="0.6" />
          <rect x="20" y="52" width="120" height="24" rx="4" fill={`url(#${gradId})`} opacity="0.45" />
          <rect x="20" y="84" width="120" height="24" rx="4" fill={`url(#${gradId})`} opacity="0.3" />
          <rect x="20" y="116" width="120" height="24" rx="4" fill={`url(#${gradId})`} opacity="0.18" />
        </>
      ) : cat.includes("tornill") || cat.includes("accesorio") || cat.includes("conector") ? (
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

/* ─── Props ──────────────────────────────────────────────── */
interface ProductCardProps {
  producto:    Producto;
  imageSizes?: string;
}

/* ─── Componente ─────────────────────────────────────────── */
export function ProductCard({ producto, imageSizes }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);
  const { toggleItem, isWished } = useWishlist();

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

  const wished = isWished(producto.id);

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

  return (
    <motion.article
      className="flex flex-col rounded-xl overflow-hidden cq-product-card"
      style={{ background: "var(--color-cq-surface)", height: "100%", width: "100%" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* ── Imagen 1:1 ── */}
      <div
        className="relative w-full overflow-hidden shrink-0"
        style={{
          aspectRatio:  "1 / 1",
          background:   "var(--color-cq-surface-2)",
          borderBottom: "1px solid var(--color-cq-border)",
        }}
      >
        <Link
          href={`/producto/${producto.slug}`}
          className="absolute inset-0"
          tabIndex={-1}
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
              <motion.div
                animate={{ scale: hovered ? 1.06 : 1 }}
                transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <FallbackIllustration categoria={producto.categoria} />
              </motion.div>
            </div>
          )}
        </Link>

        {/* Badge descuento */}
        {tieneDescuento && (
          <span
            className="absolute top-2 left-2 font-bold px-2 py-0.5 rounded-md pointer-events-none"
            style={{
              background:    "var(--color-cq-primary)",
              color:         "white",
              fontFamily:    "var(--font-mono, monospace)",
              fontSize:      "0.58rem",
              letterSpacing: "0.04em",
            }}
          >
            -{descuentoPct}%
          </span>
        )}

        {/* Badge marca */}
        {producto.marca && (
          <span
            className="absolute top-2 right-2 pointer-events-none"
            style={{
              display:       "inline-block",
              padding:       "3px 8px",
              borderRadius:  "99px",
              background:    "var(--color-cq-primary)",
              boxShadow:     "0 2px 8px rgba(29,78,216,0.3)",
              fontFamily:    "var(--font-mono, monospace)",
              fontSize:      "0.54rem",
              letterSpacing: "0.06em",
              color:         "#ffffff",
              fontWeight:    600,
              whiteSpace:    "nowrap",
            }}
          >
            {producto.marca}
          </span>
        )}

        {/* ── Botón Wishlist ── */}
        <motion.button
          onClick={handleWishlistToggle}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.85 }}
          title={wished ? "Quitar de favoritos" : "Guardar en favoritos"}
          className="absolute bottom-2 left-2 flex items-center justify-center rounded-lg z-10"
          style={{
            width:   "28px",
            height:  "28px",
            background: wished
              ? "rgba(239,68,68,0.12)"
              : "var(--color-cq-surface)",
            border: wished
              ? "1px solid rgba(239,68,68,0.3)"
              : "1px solid var(--color-cq-border)",
            color:   wished ? "#EF4444" : "var(--color-cq-muted-2)",
            cursor:  "pointer",
            backdropFilter: "blur(6px)",
            transition: "background 0.18s ease, border-color 0.18s ease, color 0.18s ease",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={wished ? "filled" : "outline"}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              {wished ? (
                <svg viewBox="0 0 512 512" fill="#EF4444" width="12" height="12">
                  <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="40" width="12" height="12">
                  <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
                </svg>
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Dot de stock */}
        <span
          className="absolute bottom-2 right-2 w-2 h-2 rounded-full block pointer-events-none"
          title={tieneStock ? "En stock" : "Sin stock"}
          style={{ background: tieneStock ? "#22c55e" : "#f59e0b" }}
        />
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-3.5">

        {/* SKU */}
        <div style={{ height: "16px", marginBottom: "4px" }}>
          {producto.sku && (
            <span style={{
              fontFamily:    "var(--font-mono, monospace)",
              color:         "var(--color-cq-muted-2)",
              fontSize:      "0.58rem",
              letterSpacing: "0.06em",
              lineHeight:    1,
            }}>
              {producto.sku}
            </span>
          )}
        </div>

        {/* Título — 2 líneas exactas */}
        <Link href={`/producto/${producto.slug}`} style={{ textDecoration: "none" }}>
          <h3
            style={{
              fontFamily:      "var(--font-display, sans-serif)",
              color:           "var(--color-cq-text)",
              fontSize:        "0.8rem",
              fontWeight:      700,
              letterSpacing:   "0.01em",
              lineHeight:      1.3,
              display:         "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow:        "hidden",
              height:          "2.6em",
              marginBottom:    "6px",
            }}
          >
            {producto.titulo}
          </h3>
        </Link>

        <div className="flex-1" />

        {/* Precio + CTA */}
        <div
          className="flex flex-col gap-2 pt-2"
          style={{ borderTop: "1px solid var(--color-cq-border)" }}
        >
          {/* Precio */}
          <div style={{ height: "24px", display: "flex", alignItems: "center", gap: "6px" }}>
            {producto.precio !== null && producto.precio > 0 ? (
              <>
                <span style={{
                  fontFamily:    "var(--font-display, sans-serif)",
                  color:         "var(--color-cq-text)",
                  fontSize:      "0.95rem",
                  fontWeight:    700,
                  letterSpacing: "0.01em",
                  lineHeight:    1,
                }}>
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency", currency: "MXN", maximumFractionDigits: 0,
                  }).format(producto.precio)}
                  <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", letterSpacing: "0.06em", marginLeft: "3px", color: "var(--color-cq-muted-2)" }}>MXN</span>
                </span>
                {tieneDescuento && (
                  <span style={{
                    fontFamily:    "var(--font-mono, monospace)",
                    color:         "var(--color-cq-muted-2)",
                    fontSize:      "0.68rem",
                    textDecoration: "line-through",
                    lineHeight:    1,
                  }}>
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency", currency: "MXN", maximumFractionDigits: 0,
                    }).format(producto.precio_original!)}
                  </span>
                )}
              </>
            ) : (
              <span style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-cq-muted-2)", fontSize: "0.68rem", letterSpacing: "0.06em" }}>
                Precio a consultar
              </span>
            )}
          </div>

          {/* CTA */}
          <Link
            href={`/producto/${producto.slug}`}
            className="flex items-center justify-center gap-1.5 w-full rounded-lg text-xs font-bold"
            style={{
              fontFamily:    "var(--font-display, sans-serif)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              height:        "34px",
              textDecoration: "none",
              background:    tieneStock ? "var(--color-cq-primary)" : "var(--color-cq-surface-2)",
              color:         tieneStock ? "#ffffff" : "var(--color-cq-muted-2)",
              border:        tieneStock ? "none" : "1px solid var(--color-cq-border)",
              boxShadow:     tieneStock ? "0 2px 12px rgba(29,78,216,0.25)" : "none",
              opacity:       tieneStock ? 1 : 0.6,
              pointerEvents: tieneStock ? "auto" : "none",
              transition:    "none",
            }}
          >
            {tieneStock ? (
              <>
                <svg viewBox="0 0 576 512" fill="currentColor" width="12" height="12">
                  <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                </svg>
                Agregar al carrito
              </>
            ) : "Sin stock"}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}