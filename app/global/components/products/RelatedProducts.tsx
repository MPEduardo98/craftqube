// app/global/components/products/RelatedProducts.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ProductCard }         from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import type { Producto } from "@/app/global/types/product";

const IconChevronLeft = () => (
  <svg viewBox="0 0 320 512" fill="currentColor" width="10" height="16">
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/>
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 320 512" fill="currentColor" width="10" height="16">
    <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
  </svg>
);

interface RelatedProductsProps {
  categoriaSlug:  string;
  productoSlug:   string;
  titulo?:        string;
  limit?:         number;
  layout?:        "scroll" | "grid";
}

const CARD_W        = 220;
const SCROLL_AMOUNT = CARD_W * 2;

export function RelatedProducts({
  categoriaSlug,
  productoSlug,
  titulo  = "Productos relacionados",
  limit   = 6,
  layout  = "scroll",
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categoriaSlug) return;
    setLoading(true);
    fetch(
      `/api/productos/relacionados?categoria=${encodeURIComponent(categoriaSlug)}&excluir=${encodeURIComponent(productoSlug)}&limit=${limit}`
    )
      .then((r) => r.json())
      .then((json) => { if (json.success) setProducts(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [categoriaSlug, productoSlug, limit]);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || layout !== "scroll") return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateScrollState); ro.disconnect(); };
  }, [products, layout]);

  const scrollTo = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  if (!loading && products.length === 0) return null;

  const skeletonCount = Math.min(limit, 4);

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <p className="section-label">{categoriaSlug.replace(/-/g, " ")}</p>
          <h2
            className="text-display"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--color-cq-text)" }}
          >
            {titulo}
          </h2>
        </div>

        {layout === "scroll" && !loading && (
          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              onClick={() => scrollTo("left")}
              disabled={!canLeft}
              whileTap={canLeft ? { scale: 0.92 } : {}}
              className="flex items-center justify-center rounded-lg transition-all disabled:opacity-25"
              style={{
                width: "36px", height: "36px",
                border: "1.5px solid var(--color-cq-border)",
                background: canLeft ? "var(--color-cq-surface)" : "var(--color-cq-surface-2)",
                color: "var(--color-cq-text)",
                cursor: canLeft ? "pointer" : "default",
              }}
            >
              <IconChevronLeft />
            </motion.button>
            <motion.button
              onClick={() => scrollTo("right")}
              disabled={!canRight}
              whileTap={canRight ? { scale: 0.92 } : {}}
              className="flex items-center justify-center rounded-lg transition-all disabled:opacity-25"
              style={{
                width: "36px", height: "36px",
                border: "1.5px solid var(--color-cq-border)",
                background: canRight ? "var(--color-cq-surface)" : "var(--color-cq-surface-2)",
                color: "var(--color-cq-text)",
                cursor: canRight ? "pointer" : "default",
              }}
            >
              <IconChevronRight />
            </motion.button>
          </div>
        )}
      </div>

      {/* ── Contenido ── */}
      {loading ? (
        /* Skeletons */
        <div
          className={
            layout === "scroll"
              ? "flex gap-4 overflow-hidden"
              : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          }
        >
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              style={layout === "scroll" ? { minWidth: `${CARD_W}px`, flex: `0 0 ${CARD_W}px` } : {}}
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
        ) : layout === "scroll" ? (
          /* Scroll horizontal — grid de 1 fila fuerza altura uniforme en todas las cards */
          <div
            ref={scrollRef}
            style={{
              display:               "grid",
              gridAutoFlow:          "column",
              gridAutoColumns:       `${CARD_W}px`,
              gridTemplateRows:      "1fr",
              gap:                   "16px",
              overflowX:             "auto",
              overflowY:             "hidden",
              paddingBottom:         "8px",
              scrollbarWidth:        "none",
              msOverflowStyle:       "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
                style={{ minWidth: 0, display: "flex", flexDirection: "column" }}
              >
                <ProductCard producto={product} imageSizes={`${CARD_W}px`} />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Grid */
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
              >
                <ProductCard
                  producto={product}
                  imageSizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </motion.div>
            ))}
          </motion.div>
        )}
    </motion.section>
  );
}