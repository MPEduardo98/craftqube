// app/(main)/catalogo/components/CatalogGrid.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard }         from "@/app/global/components/products/ProductCard";
import { ProductCardSkeleton } from "@/app/global/components/products/ProductCardSkeleton";
import type { Producto } from "@/app/global/types/product";

/* ── Skeleton list row ── */
function ListSkeleton() {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl animate-pulse"
      style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
    >
      <div className="shrink-0 rounded-lg" style={{ width: 72, height: 72, background: "var(--color-cq-surface-2)" }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 rounded w-24" style={{ background: "var(--color-cq-border)" }} />
        <div className="h-4 rounded w-3/4" style={{ background: "var(--color-cq-border)" }} />
        <div className="h-3 rounded w-1/2" style={{ background: "var(--color-cq-border)" }} />
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <div className="h-5 rounded w-20" style={{ background: "var(--color-cq-border)" }} />
        <div className="h-8 rounded-lg w-28" style={{ background: "var(--color-cq-accent-glow)" }} />
      </div>
    </div>
  );
}

/* ── Lista row ── */
function ListRow({ producto }: { producto: Producto }) {
  const imageSrc = producto.imagen_nombre
    ? `/productos/${producto.id}/${producto.imagen_nombre}`
    : null;
  const tieneStock = (producto.stock ?? 0) > 0;
  const tieneDescuento =
    producto.precio_original !== null &&
    producto.precio_original > 0 &&
    producto.precio_original > (producto.precio ?? 0);

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl"
      style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
    >
      <Link
        href={`/producto/${producto.slug}`}
        className="relative shrink-0 rounded-lg overflow-hidden"
        style={{ width: 72, height: 72, background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}
      >
        {imageSrc ? (
          <Image src={imageSrc} alt={producto.imagen_alt ?? producto.titulo} fill className="object-contain p-2" sizes="72px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 40 40" width="24" height="24">
              <circle cx="20" cy="20" r="10" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.4"/>
              <circle cx="20" cy="20" r="4" fill="#2563EB" opacity="0.5"/>
            </svg>
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {producto.sku && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--color-cq-muted-2)", letterSpacing: "0.06em" }}>
            {producto.sku}
          </span>
        )}
        <Link href={`/producto/${producto.slug}`} style={{ textDecoration: "none" }}>
          <p className="font-bold leading-snug line-clamp-1 hover:text-blue-500 transition-colors"
            style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "var(--color-cq-text)", letterSpacing: "0.01em" }}>
            {producto.titulo}
          </p>
        </Link>
        {producto.descripcion_corta && (
          <p className="line-clamp-1" style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--color-cq-muted)", marginTop: "2px" }}>
            {producto.descripcion_corta}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {producto.categoria && (
            <span className="px-1.5 py-0.5 rounded text-xs" style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.04em", background: "var(--color-cq-surface-2)", color: "var(--color-cq-muted)", border: "1px solid var(--color-cq-border)" }}>
              {producto.categoria}
            </span>
          )}
          {producto.marca && (
            <span className="px-1.5 py-0.5 rounded text-xs" style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.04em", background: "var(--color-cq-accent-glow)", color: "var(--color-cq-accent)", border: "1px solid rgba(37,99,235,0.15)" }}>
              {producto.marca}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
        <div>
          {producto.precio !== null && producto.precio > 0 ? (
            <div className="flex flex-col items-end">
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
                ${producto.precio.toLocaleString("es-MX")}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--color-cq-muted-2)", marginLeft: "3px" }}>MXN</span>
              </span>
              {tieneDescuento && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--color-cq-muted-2)", textDecoration: "line-through" }}>
                  ${producto.precio_original!.toLocaleString("es-MX")}
                </span>
              )}
            </div>
          ) : (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-cq-muted-2)" }}>Consultar</span>
          )}
        </div>
        <Link
          href={`/producto/${producto.slug}`}
          className="flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold"
          style={{
            height: 32, padding: "0 14px",
            background: tieneStock ? "var(--color-cq-primary)" : "var(--color-cq-surface-2)",
            color: tieneStock ? "white" : "var(--color-cq-muted-2)",
            textDecoration: "none", fontFamily: "var(--font-display)",
            fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase",
            border: tieneStock ? "none" : "1px solid var(--color-cq-border)",
            whiteSpace: "nowrap",
          }}
        >
          Ver producto
        </Link>
      </div>
    </div>
  );
}

/* ── Paginación ── */
function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const range: (number | "...")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 2 && i <= page + 2)) range.push(i);
    else if (range[range.length - 1] !== "...") range.push("...");
  }
  return (
    <div className="flex items-center justify-center gap-1 pt-8">
      <button onClick={() => onChange(page - 1)} disabled={page <= 1}
        className="flex items-center justify-center rounded-lg disabled:opacity-30"
        style={{ width: 36, height: 36, background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)", cursor: page <= 1 ? "not-allowed" : "pointer", color: "var(--color-cq-muted)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      {range.map((r, i) => r === "..." ? (
        <span key={`e${i}`} style={{ width: 36, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--color-cq-muted-2)" }}>…</span>
      ) : (
        <button key={r} onClick={() => onChange(r as number)}
          className="flex items-center justify-center rounded-lg font-bold"
          style={{
            width: 36, height: 36, cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.04em",
            background: r === page ? "var(--color-cq-accent)" : "var(--color-cq-surface)",
            color: r === page ? "white" : "var(--color-cq-muted)",
            border: r === page ? "none" : "1px solid var(--color-cq-border)",
          }}>
          {r}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page >= pages}
        className="flex items-center justify-center rounded-lg disabled:opacity-30"
        style={{ width: 36, height: 36, background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)", cursor: page >= pages ? "not-allowed" : "pointer", color: "var(--color-cq-muted)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  );
}

/* ── Main export ── */
interface CatalogGridProps {
  productos: Producto[];
  loading:   boolean;
  view:      "grid" | "list";
  page:      number;
  pages:     number;
  onPageChange: (p: number) => void;
}

const SKELETON_COUNT = 12;

export function CatalogGrid({ productos, loading, view, page, pages, onPageChange }: CatalogGridProps) {
  if (!loading && productos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-5 py-28"
      >
        <svg viewBox="0 0 80 80" fill="none" width="64" height="64">
          <rect x="12" y="12" width="56" height="56" rx="8" stroke="var(--color-cq-border)" strokeWidth="2"/>
          <path d="M28 40h24M40 28v24" stroke="var(--color-cq-border-2)" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <div className="text-center">
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--color-cq-text)" }}>
            Sin resultados
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--color-cq-muted)", marginTop: "4px" }}>
            Intenta ajustar los filtros o tu búsqueda
          </p>
        </div>
      </motion.div>
    );
  }

  if (view === "list") {
    return (
      <div>
        <div className="flex flex-col gap-2">
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <ListSkeleton key={i} />)
            : productos.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <ListRow producto={p} />
                </motion.div>
              ))
          }
        </div>
        <Pagination page={page} pages={pages} onChange={onPageChange} />
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {productos.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                style={{ height: "100%" }}
              >
                <ProductCard
                  producto={p}
                  imageSizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <Pagination page={page} pages={pages} onChange={onPageChange} />
    </div>
  );
}