// app/global/components/products/ProductCard.tsx
"use client";

import Link   from "next/link";
import Image  from "next/image";
import { useState } from "react";
import { motion }   from "framer-motion";
import type { Producto } from "@/app/global/types/product";

/* ─── Fallback illustration ──────────────────────────────── */
function FallbackIllustration({ categoria }: { categoria: string | null }) {
  const cat    = (categoria ?? "").toLowerCase();
  const gradId = `grad-fb-${cat.slice(0, 6).replace(/\s/g, "")}`;

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#2563EB" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      {cat.includes("perfil") ? (
        <>
          <rect x="45" y="15" width="28" height="130" rx="3" fill={`url(#${gradId})`} />
          <rect x="83" y="15" width="28" height="130" rx="3" fill={`url(#${gradId})`} opacity="0.7" />
          <rect x="35" y="60" width="90" height="20" rx="3" fill={`url(#${gradId})`} opacity="0.3" />
          <rect x="35" y="88" width="90" height="20" rx="3" fill={`url(#${gradId})`} opacity="0.2" />
        </>
      ) : cat.includes("accesorio") || cat.includes("tornillo") || cat.includes("escuadra") ? (
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
          <polygon points="80,22 92,54 68,54"   fill="#2563EB" opacity="0.65" />
          <polygon points="80,138 92,106 68,106" fill="#2563EB" opacity="0.65" />
          <polygon points="22,80 54,68 54,92"   fill="#2563EB" opacity="0.65" />
          <polygon points="138,80 106,68 106,92" fill="#2563EB" opacity="0.65" />
          <circle cx="80" cy="80" r="16" fill={`url(#${gradId})`} opacity="0.85" />
        </>
      )}
    </svg>
  );
}

/* ─── Props ──────────────────────────────────────────────── */
interface ProductCardProps {
  producto:   Producto;
  imageSizes?: string;
}

/* ─── Componente ─────────────────────────────────────────── */
export function ProductCard({ producto, imageSizes }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

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

  return (
    <motion.article
      className="group flex flex-col rounded-xl overflow-hidden cq-product-card"
      style={{ background: "var(--color-cq-surface)", height: "100%", width: "100%" }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      {/* ── Imagen 1:1 ── */}
      <Link
        href={`/productos/${producto.slug}`}
        className="relative w-full overflow-hidden shrink-0"
        style={{
          aspectRatio: "1 / 1",
          background: "var(--color-cq-surface-2)",
          borderBottom: "1px solid var(--color-cq-border)",
          display: "block",
        }}
        tabIndex={-1}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={producto.imagen_alt ?? producto.titulo}
            fill
            className="object-contain p-3 transition-transform duration-400 group-hover:scale-105"
            sizes={imageSizes ?? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <FallbackIllustration categoria={producto.categoria} />
          </div>
        )}

        {/* Descuento badge */}
        {tieneDescuento && (
          <span
            className="absolute top-2 left-2 font-bold px-2 py-0.5 rounded-md"
            style={{
              background: "var(--color-cq-primary)",
              color: "white",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.58rem",
              letterSpacing: "0.04em",
            }}
          >
            -{descuentoPct}%
          </span>
        )}

        {/* Stock dot */}
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full block"
          title={tieneStock ? "En stock" : "Stock limitado"}
          style={{ background: tieneStock ? "#22c55e" : "#f59e0b" }}
        />
      </Link>

      {/* ── Info — altura fija por zonas ── */}
      <div className="flex flex-col flex-1 p-3.5">

        {/* Zona 1: SKU — altura fija 16px */}
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

        {/* Zona 2: Título — siempre 2 líneas exactas */}
        <Link href={`/productos/${producto.slug}`} style={{ textDecoration: "none" }}>
          <h3
            className="transition-colors group-hover:text-blue-500"
            style={{
              fontFamily:        "var(--font-display, sans-serif)",
              color:             "var(--color-cq-text)",
              fontSize:          "0.8rem",
              fontWeight:        700,
              letterSpacing:     "0.01em",
              lineHeight:        1.3,
              /* Bloque de exactamente 2 líneas */
              display:           "-webkit-box",
              WebkitLineClamp:   2,
              WebkitBoxOrient:   "vertical",
              overflow:          "hidden",
              height:            "2.6em",
              marginBottom:      "6px",
            }}
          >
            {producto.titulo}
          </h3>
        </Link>

        {/* Zona 3: Categoría — altura fija 22px */}
        <div style={{ height: "22px", marginBottom: "6px" }}>
          {producto.categoria && (
            <span
              className="inline-block px-2 py-0.5 rounded-md"
              style={{
                fontFamily:    "var(--font-mono, monospace)",
                fontSize:      "0.56rem",
                letterSpacing: "0.04em",
                background:    "var(--color-cq-accent-glow)",
                color:         "var(--color-cq-accent)",
                border:        "1px solid rgba(37,99,235,0.15)",
                whiteSpace:    "nowrap",
              }}
            >
              {producto.categoria}
            </span>
          )}
        </div>

        {/* Spacer — empuja precio al fondo */}
        <div className="flex-1" />

        {/* Zona 4: Precio + CTA — siempre al fondo */}
        <div
          className="flex flex-col gap-2 pt-2"
          style={{ borderTop: "1px solid var(--color-cq-border)" }}
        >
          {/* Precio */}
          <div style={{ height: "24px", display: "flex", alignItems: "center", gap: "6px" }}>
            {producto.precio !== null && producto.precio > 0 ? (
              <>
                <span style={{
                  color:         "var(--color-cq-text)",
                  fontSize:      "1rem",
                  fontWeight:    700,
                  fontFamily:    "var(--font-display, sans-serif)",
                  lineHeight:    1,
                }}>
                  ${producto.precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
                {tieneDescuento && (
                  <span className="line-through" style={{ color: "var(--color-cq-muted-2)", fontSize: "0.7rem" }}>
                    ${producto.precio_original!.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </>
            ) : (
              <span style={{
                fontSize:      "0.7rem",
                color:         "var(--color-cq-muted-2)",
                fontFamily:    "var(--font-mono, monospace)",
              }}>
                Consultar precio
              </span>
            )}
          </div>

          {/* CTA */}
          <Link
            href={`/productos/${producto.slug}`}
            className="w-full text-center font-bold rounded-lg transition-colors"
            style={{
              display:        "block",
              padding:        "0.5rem 0",
              background:     "var(--color-cq-accent-glow)",
              color:          "var(--color-cq-accent)",
              border:         "1px solid rgba(37,99,235,0.15)",
              fontFamily:     "var(--font-display, sans-serif)",
              fontSize:       "0.65rem",
              letterSpacing:  "0.08em",
              textTransform:  "uppercase",
              textDecoration: "none",
            }}
          >
            Ver producto
          </Link>
        </div>
      </div>
    </motion.article>
  );
}