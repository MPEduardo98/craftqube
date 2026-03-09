// app/global/components/products/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Producto } from "@/app/global/types/product";

/* ─── Fallback illustration por categoría ─────────────────── */
function FallbackIllustration({ categoria }: { categoria: string | null }) {
  const cat = (categoria ?? "").toLowerCase();
  // Usamos id estático para el gradiente — sin Math.random (SSR safe)
  const gradId = `grad-fallback-${cat.slice(0, 6).replace(/\s/g, "")}`;

  return (
    <svg
      viewBox="0 0 160 160"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
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
          <polygon points="80,22 92,54 68,54" fill="#2563EB" opacity="0.65" />
          <polygon points="80,138 92,106 68,106" fill="#2563EB" opacity="0.65" />
          <polygon points="22,80 54,68 54,92" fill="#2563EB" opacity="0.65" />
          <polygon points="138,80 106,68 106,92" fill="#2563EB" opacity="0.65" />
          <circle cx="80" cy="80" r="16" fill={`url(#${gradId})`} opacity="0.85" />
        </>
      )}
    </svg>
  );
}

/* ─── Props ───────────────────────────────────────────────── */
interface ProductCardProps {
  producto: Producto;
  /** Tamaños para el atributo sizes de Next Image. Default razonable ya incluido. */
  imageSizes?: string;
}

/* ─── Componente ─────────────────────────────────────────── */
export function ProductCard({ producto, imageSizes }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const tieneStock    = (producto.stock ?? 0) > 0;
  const tieneDescuento =
    producto.precio_original !== null &&
    producto.precio_original > 0 &&
    producto.precio_original > (producto.precio ?? 0);

  // Construye la ruta de imagen: /uploads/productos/[id]/[nombre_archivo]
  const imageSrc =
    producto.imagen_nombre && !imgError
      ? `/productos/${producto.id}/${producto.imagen_nombre}`
      : null;

  const descuentoPct = tieneDescuento
    ? Math.round(((producto.precio_original! - producto.precio!) / producto.precio_original!) * 100)
    : 0;

  return (
    <motion.article
      className="group flex flex-col rounded-xl overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
      }}
      whileHover={{
        y: -3,
        borderColor: "rgba(37,99,235,0.25)",
      }}
      transition={{ duration: 0.2 }}
    >
      {/* ── Imagen 1:1 ── */}
      <Link
        href={`/productos/${producto.slug}`}
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "1 / 1",
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
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
            className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-md"
            style={{
              background: "#1D4ED8",
              color: "white",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.6rem",
              letterSpacing: "0.04em",
            }}
          >
            -{descuentoPct}%
          </span>
        )}

        {/* Stock indicator */}
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full block"
          title={tieneStock ? "En stock" : "Stock limitado"}
          style={{
            background: tieneStock ? "#22c55e" : "#f59e0b",
          }}
        />
      </Link>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-3.5 gap-1.5">
        {/* SKU */}
        {producto.sku && (
          <span
            style={{
              fontFamily: "var(--font-mono, monospace)",
              color: "#94A3B8",
              fontSize: "0.6rem",
              letterSpacing: "0.06em",
            }}
          >
            {producto.sku}
          </span>
        )}

        {/* Título */}
        <Link href={`/productos/${producto.slug}`} style={{ textDecoration: "none" }}>
          <h3
            className="text-sm font-bold leading-snug transition-colors group-hover:text-blue-600"
            style={{
              fontFamily: "var(--font-display, sans-serif)",
              color: "#0F172A",
              letterSpacing: "0.01em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {producto.titulo}
          </h3>
        </Link>

        {/* Categoría */}
        {producto.categoria && (
          <span
            className="self-start px-2 py-0.5 rounded-md"
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.58rem",
              letterSpacing: "0.04em",
              background: "rgba(37,99,235,0.07)",
              color: "#1D4ED8",
              border: "1px solid rgba(37,99,235,0.12)",
            }}
          >
            {producto.categoria}
          </span>
        )}

        {/* Descripción corta */}
        {producto.descripcion_corta && (
          <p
            className="text-xs leading-relaxed"
            style={{
              color: "#64748B",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {producto.descripcion_corta}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Precio + CTA */}
        <div
          className="flex flex-col gap-2 pt-2"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          {producto.precio !== null && producto.precio > 0 ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className="font-bold"
                style={{
                  color: "#0F172A",
                  fontSize: "1rem",
                  fontFamily: "var(--font-display, sans-serif)",
                }}
              >
                ${producto.precio.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>
              {tieneDescuento && (
                <span
                  className="line-through text-xs"
                  style={{ color: "#94A3B8" }}
                >
                  ${producto.precio_original!.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          ) : (
            <span
              style={{
                fontSize: "0.7rem",
                color: "#94A3B8",
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              Consultar precio
            </span>
          )}

          <Link
            href={`/productos/${producto.slug}`}
            className="w-full text-center text-xs font-bold py-2 rounded-lg transition-colors"
            style={{
              background: "rgba(37,99,235,0.08)",
              color: "#1D4ED8",
              border: "1px solid rgba(37,99,235,0.15)",
              fontFamily: "var(--font-display, sans-serif)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
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