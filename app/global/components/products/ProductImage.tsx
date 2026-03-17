"use client";
// app/global/components/products/ProductImage.tsx
import { useState }        from "react";
import Image               from "next/image";
import { resolveImageUrl } from "@/app/global/lib/resolveImageUrl";

/* ── Fallback SVG ────────────────────────────────────────────── */
function ImageFallback({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`flex items-center justify-center ${className ?? ""}`}
      style={{ background: "var(--color-cq-surface-2, #f1f5f9)", ...style }}
    >
      <svg
        width="32" height="32" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ color: "var(--color-cq-muted-2, #cbd5e1)" }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
}

/* ── Props ───────────────────────────────────────────────────── */
interface ProductImageProps {
  /** Valor crudo de la DB: URL completa de R2 o solo nombre de archivo */
  url:         string | null | undefined;
  productoId:  number | undefined;
  alt:         string;
  fill?:       boolean;
  width?:      number;
  height?:     number;
  sizes?:      string;
  priority?:   boolean;
  className?:  string;
  style?:      React.CSSProperties;
  objectFit?:  "cover" | "contain";
}

/**
 * Componente único para mostrar imágenes de productos.
 * Centraliza resolución de URL (R2 / local) y manejo de fallback.
 *
 * Uso en fill mode (el contenedor debe tener position: relative):
 *   <ProductImage url={url} productoId={id} alt={alt} fill sizes="..." />
 *
 * Uso con dimensiones fijas:
 *   <ProductImage url={url} productoId={id} alt={alt} width={80} height={80} />
 */
export function ProductImage({
  url,
  productoId,
  alt,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  className,
  style,
  objectFit = "cover",
}: ProductImageProps) {
  const [broken, setBroken] = useState(false);
  const src = resolveImageUrl(url, productoId);

  if (!src || broken) {
    if (fill) {
      return <ImageFallback className="absolute inset-0 w-full h-full" />;
    }
    return (
      <ImageFallback
        style={{ width: width ?? 40, height: height ?? 40, borderRadius: 8, ...style }}
      />
    );
  }

  const imgStyle: React.CSSProperties = {
    objectFit,
    ...style,
  };

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 640px) 100vw, 50vw"}
        priority={priority}
        className={className}
        style={imgStyle}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 40}
      height={height ?? 40}
      sizes={sizes}
      priority={priority}
      className={className}
      style={imgStyle}
      onError={() => setBroken(true)}
    />
  );
}