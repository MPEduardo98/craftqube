// app/(main)/producto/[slug]/components/ProductGallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductoImagen } from "@/app/global/types/product-detail";
import { resolveImageUrl } from "@/app/global/lib/resolveImageUrl";

interface Props {
  imagenes:   ProductoImagen[];
  productoId: number;
  titulo:     string;
}

export function ProductGallery({ imagenes, productoId, titulo }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection]     = useState(0);

  const handleSelect = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const handlePrev = () => {
    if (activeIndex > 0) handleSelect(activeIndex - 1);
  };

  const handleNext = () => {
    if (activeIndex < imagenes.length - 1) handleSelect(activeIndex + 1);
  };

  if (imagenes.length === 0) {
    return (
      <div
        className="aspect-square rounded-2xl flex items-center justify-center"
        style={{ background: "var(--color-cq-surface-2)", border: "1px solid var(--color-cq-border)" }}
      >
        <div className="flex flex-col items-center gap-3 opacity-30">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
            SIN IMAGEN
          </span>
        </div>
      </div>
    );
  }

  const active = imagenes[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* ── Main image ──────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-cq-surface)",
          border:     "1px solid var(--color-cq-border)",
          aspectRatio: "1 / 1",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={resolveImageUrl(active.url, productoId) ?? ""}
              alt={active.alt ?? titulo}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows — only when multiple images */}
        {imagenes.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
              style={{
                background: "var(--color-cq-surface)",
                border:     "1px solid var(--color-cq-border)",
                color:      "var(--color-cq-text)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex === imagenes.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
              style={{
                background: "var(--color-cq-surface)",
                border:     "1px solid var(--color-cq-border)",
                color:      "var(--color-cq-text)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* Dot counter */}
        {imagenes.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imagenes.map((_, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className="rounded-full transition-all"
                style={{
                  width:      i === activeIndex ? "16px" : "6px",
                  height:     "6px",
                  background: i === activeIndex ? "var(--color-cq-accent)" : "var(--color-cq-border-2)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnails ──────────────────────────────────────────── */}
      {imagenes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imagenes.map((img, i) => (
            <motion.button
              key={img.id}
              onClick={() => handleSelect(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative shrink-0 rounded-lg overflow-hidden transition-all"
              style={{
                width:  "68px",
                height: "68px",
                border: i === activeIndex
                  ? "2px solid var(--color-cq-accent)"
                  : "2px solid var(--color-cq-border)",
                background: "var(--color-cq-surface)",
              }}
            >
              <Image
                src={resolveImageUrl(img.url, productoId) ?? ""}
                alt={img.alt ?? `${titulo} ${i + 1}`}
                fill
                className="object-contain p-1.5"
                sizes="68px"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}