// app/(main)/producto/[slug]/components/ProductDetailClient.tsx
"use client";

import { useState }             from "react";
import Link                     from "next/link";
import Image                    from "next/image";
import { motion }               from "framer-motion";
import { useCart }              from "@/app/global/context/CartContext";
import { useWishlist }          from "@/app/global/context/WishlistContext";
import { formatPrice }          from "@/app/global/lib/format";
import { ProductVariantSelector } from "./ProductVariantSelector";
import { ProductSpecs }         from "./ProductSpecs";
import type { ProductoDetalle, ProductoVariante } from "@/app/global/types/product-detail";
import { resolveImageUrl } from "@/app/global/lib/resolveImageUrl";


const Icons = {
  cart: (
    <svg viewBox="0 0 576 512" fill="currentColor" width="16" height="16">
      <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 448 512" fill="currentColor" width="14" height="16">
      <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
    </svg>
  ),
  arrowLeft: (
    <svg viewBox="0 0 448 512" fill="currentColor" width="12" height="14">
      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
    </svg>
  ),
  minus: (
    <svg viewBox="0 0 448 512" fill="currentColor" width="12" height="12">
      <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 448 512" fill="currentColor" width="12" height="12">
      <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
    </svg>
  ),
};

function HeartIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg viewBox="0 0 512 512" fill="#EF4444" width="17" height="17">
      <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
    </svg>
  ) : (
    <svg viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" width="17" height="17">
      <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
    </svg>
  );
}

function fadeUp(delay: number) {
  return {
    initial:    { opacity: 0, y: 16 },
    animate:    { opacity: 1, y: 0 },
    transition: { delay, duration: 0.4, ease: "easeOut" as const },
  };
}

interface Props {
  producto: ProductoDetalle;
}

export function ProductDetailClient({ producto }: Props) {
  const { addItem }              = useCart();
  const { toggleItem, isWished } = useWishlist();

  const defaultVariante =
    producto.variantes.find((v) => v.es_default === 1) ??
    producto.variantes[0] ??
    null;

  const [selectedVariante, setSelectedVariante] = useState<ProductoVariante | null>(defaultVariante);
  const [added,    setAdded]    = useState(false);
  const [cantidad, setCantidad] = useState(1);

  const precio         = selectedVariante?.precio_final    ?? 0;
  const precioOriginal = selectedVariante?.precio_original ?? 0;
  const stock          = selectedVariante?.stock           ?? 0;
  const tieneStock     = stock > 0 || (selectedVariante?.vender_sin_existencia === 1);
  const tieneDescuento = precioOriginal > precio && precioOriginal > 0;
  const descuento      = tieneDescuento ? Math.round(((precioOriginal - precio) / precioOriginal) * 100) : 0;
  const wished         = isWished(producto.id);

  const imagenActiva = selectedVariante
    ? (producto.imagenes.find((img) => img.variante_id === selectedVariante.id) ?? producto.imagenes[0])
    : producto.imagenes[0];

  const incrementar = () => setCantidad((c) => (stock > 0 ? Math.min(c + 1, stock) : c + 1));
  const decrementar = () => setCantidad((c) => Math.max(1, c - 1));

  const handleAgregarCarrito = () => {
    if (!tieneStock || !selectedVariante) return;
    addItem({
      productoId:   producto.id,
      varianteId:   selectedVariante.id,
      titulo:       producto.titulo,
      slug:         producto.slug,
      sku:          selectedVariante.sku,
      precio,
      cantidad,
      imagenNombre: imagenActiva?.url.split("/").pop() ?? null,
      imagenAlt:    imagenActiva?.alt ?? null,
      atributos:    selectedVariante.atributos.map((a) => ({ atributo: a.atributo, valor: a.valor })),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = () => {
    toggleItem({
      productoId:   producto.id,
      slug:         producto.slug,
      titulo:       producto.titulo,
      precio,
      imagenNombre: imagenActiva?.url.split("/").pop() ?? null,
      imagenAlt:    imagenActiva?.alt ?? null,
      marca:        producto.marca ?? null,
    });
  };

  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          {/* ── Galería ── */}
          <div className="w-full lg:w-1/2 flex flex-col gap-3">
            <motion.div
              {...fadeUp(0)}
              className="relative rounded-2xl overflow-hidden"
              style={{
                aspectRatio: "1 / 1",
                background:  "var(--color-cq-surface)",
                border:      "1px solid var(--color-cq-border)",
              }}
            >
              {imagenActiva ? (
                <Image
                  src={resolveImageUrl(imagenActiva.url, producto.id) ?? ""}
                  alt={imagenActiva.alt ?? producto.titulo}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{ color: "var(--color-cq-muted-2)" }}>
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
            </motion.div>

            {producto.imagenes.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {producto.imagenes.slice(0, 6).map((img, i) => {
                  const isActive = img.id === imagenActiva?.id;
                  return (
                    <button
                      key={img.id}
                      onClick={() => setSelectedVariante(
                        img.variante_id
                          ? (producto.variantes.find((v) => v.id === img.variante_id) ?? selectedVariante)
                          : selectedVariante
                      )}
                      className="relative rounded-xl overflow-hidden shrink-0 transition-all"
                      style={{
                        width:  "64px",
                        height: "64px",
                        border: `1.5px solid ${isActive ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
                        background: "var(--color-cq-surface)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <Image
                        src={img.url.startsWith("http") ? img.url : `/productos/${producto.id}/${img.url}`}
                        alt={img.alt ?? `Imagen ${i + 1}`}
                        fill
                        className="object-contain p-1.5"
                        sizes="64px"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="w-full lg:w-1/2 flex flex-col gap-5">

            {/* Badges */}
            <motion.div {...fadeUp(0)} className="flex flex-wrap gap-2">
              {producto.marca && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--color-cq-accent-glow)", color: "var(--color-cq-accent)", border: "1px solid rgba(37,99,235,0.2)" }}>
                  {producto.marca}
                </span>
              )}
              {producto.categorias.map((c) => (
                <Link key={c.id} href={`/catalogo?cat=${c.slug}`}
                  className="px-2.5 py-1 rounded-md text-xs transition-all hover:border-blue-400"
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--color-cq-surface)", color: "var(--color-cq-muted)", border: "1px solid var(--color-cq-border)", textDecoration: "none" }}>
                  {c.nombre}
                </Link>
              ))}
            </motion.div>

            {/* Título */}
            <motion.h1 {...fadeUp(0.07)} className="text-display"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "var(--color-cq-text)", lineHeight: 1.1 }}>
              {producto.titulo}
            </motion.h1>

            {producto.descripcion && (
              <motion.p {...fadeUp(0.14)} className="text-base leading-relaxed" style={{ color: "var(--color-cq-muted)" }}>
                {producto.descripcion}
              </motion.p>
            )}

            <div style={{ height: "1px", background: "var(--color-cq-border)" }} />

            {/* Precio + stock */}
            <motion.div {...fadeUp(0.21)} className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                {precio > 0 ? (
                  <span className="text-display" style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", color: "var(--color-cq-text)" }}>
                    {formatPrice(precio)}
                  </span>
                ) : (
                  <span className="text-base" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
                    Precio a consultar
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: tieneStock ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${tieneStock ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: tieneStock ? "#22C55E" : "#EF4444", whiteSpace: "nowrap" }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tieneStock ? "#22C55E" : "#EF4444" }} />
                  {tieneStock ? (stock > 10 ? "En stock" : `Últimas ${stock} unidades`) : "Agotado"}
                </span>
              </div>
              {precio > 0 && tieneDescuento && (
                <div className="flex items-center gap-2">
                  <span className="text-base line-through" style={{ color: "var(--color-cq-muted-2)" }}>{formatPrice(precioOriginal)}</span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold"
                    style={{ fontFamily: "var(--font-mono)", background: "rgba(22,163,74,0.12)", color: "#16A34A", border: "1px solid rgba(22,163,74,0.2)" }}>
                    -{descuento}%
                  </span>
                </div>
              )}
            </motion.div>

            {/* Variantes */}
            {selectedVariante && (
              <motion.div {...fadeUp(0.28)}>
                <ProductVariantSelector variantes={producto.variantes} selectedId={selectedVariante.id} onSelect={setSelectedVariante} />
              </motion.div>
            )}

            {/* Cantidad + CTA */}
            <motion.div {...fadeUp(0.35)} className="flex flex-col gap-1.5">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
                Cantidad
                {precio > 0 && cantidad > 1 && (
                  <span style={{ marginLeft: "0.75rem", color: "var(--color-cq-accent)", letterSpacing: "0.04em" }}>
                    = {formatPrice(precio * cantidad)}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center rounded-xl overflow-hidden shrink-0"
                  style={{ border: "1.5px solid var(--color-cq-border)", background: "var(--color-cq-surface)", height: "52px" }}>
                  <button onClick={decrementar} disabled={cantidad <= 1}
                    className="flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ width: "44px", height: "52px", color: "var(--color-cq-text)", cursor: cantidad <= 1 ? "not-allowed" : "pointer", background: "none", border: "none" }}>
                    {Icons.minus}
                  </button>
                  <span className="text-base font-bold tabular-nums"
                    style={{ minWidth: "36px", textAlign: "center", fontFamily: "var(--font-display)", color: "var(--color-cq-text)" }}>
                    {cantidad}
                  </span>
                  <button onClick={incrementar}
                    className="flex items-center justify-center transition-all"
                    style={{ width: "44px", height: "52px", color: "var(--color-cq-text)", cursor: "pointer", background: "none", border: "none" }}>
                    {Icons.plus}
                  </button>
                </div>

                <motion.button
                  onClick={handleAgregarCarrito}
                  disabled={!tieneStock}
                  whileHover={tieneStock ? { scale: 1.02 } : {}}
                  whileTap={tieneStock ? { scale: 0.98 } : {}}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold transition-all"
                  style={{
                    height:     "52px",
                    minWidth:   "160px",
                    background: tieneStock ? (added ? "rgba(22,163,74,0.9)" : "var(--color-cq-accent)") : "var(--color-cq-surface-2)",
                    color:      tieneStock ? "#fff" : "var(--color-cq-muted-2)",
                    border:     "none",
                    cursor:     tieneStock ? "pointer" : "not-allowed",
                    fontSize:   "0.9rem",
                    letterSpacing: "0.02em",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {added ? Icons.check : Icons.cart}
                  {added ? "Agregado" : tieneStock ? "Agregar al carrito" : "Sin stock"}
                </motion.button>

                <motion.button
                  onClick={handleWishlist}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{ width: "52px", height: "52px", border: "1.5px solid var(--color-cq-border)", background: "var(--color-cq-surface)", color: "var(--color-cq-muted)", cursor: "pointer" }}
                  title={wished ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  <HeartIcon filled={wished} />
                </motion.button>
              </div>
            </motion.div>

            {/* Especificaciones */}
            {(producto.metacampos.length > 0 || selectedVariante) && (
              <motion.div {...fadeUp(0.42)}>
                <ProductSpecs metacampos={producto.metacampos} varianteActiva={selectedVariante} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}