// app/(main)/producto/[slug]/components/ProductDetailClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProductGallery }         from "./ProductGallery";
import { ProductVariantSelector } from "./ProductVariantSelector";
import { ProductSpecs }           from "./ProductSpecs";
import { useCart }                from "@/app/global/context/CartContext";
import { useWishlist }            from "@/app/global/context/WishlistContext";
import { formatPrice }            from "@/app/global/lib/format";
import type { ProductoDetalle, ProductoVariante } from "@/app/global/types/product-detail";

const FaIcons = {
  truck: (
    <svg viewBox="0 0 640 512" fill="currentColor" width="16" height="16">
      <path d="M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 448 512" fill="currentColor" width="14" height="16">
      <path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/>
    </svg>
  ),
  rotateLeft: (
    <svg viewBox="0 0 512 512" fill="currentColor" width="16" height="16">
      <path d="M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 173c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z"/>
    </svg>
  ),
  cartShopping: (
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
  const sinExistencia  = selectedVariante?.vender_sin_existencia === 1;
  const tieneStock     = stock > 0 || sinExistencia;
  const tieneDescuento = precioOriginal > 0 && precioOriginal > precio;
  const descuento      = tieneDescuento ? Math.round((1 - precio / precioOriginal) * 100) : 0;
  const wished         = isWished(producto.id);

  const imagenesVariante = selectedVariante
    ? producto.imagenes.filter((img) => img.variante_id === selectedVariante.id)
    : [];
  const imagenesMostrar =
    imagenesVariante.length > 0
      ? imagenesVariante
      : producto.imagenes.filter((img) => img.variante_id === null);
  const imagenPrincipal = imagenesMostrar[0] ?? null;

  const handleAddToCart = () => {
    if (!selectedVariante || !tieneStock) return;
    addItem({
      productoId:   producto.id,
      varianteId:   selectedVariante.id,
      titulo:       producto.titulo,
      slug:         producto.slug,
      sku:          selectedVariante.sku,
      precio:       selectedVariante.precio_final,
      cantidad,
      imagenNombre: imagenPrincipal ? imagenPrincipal.url.split("/").pop() ?? null : null,
      imagenAlt:    imagenPrincipal?.alt ?? producto.titulo,
      atributos:    selectedVariante.atributos.map((a) => ({ atributo: a.atributo, valor: a.valor })),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistToggle = () => {
    toggleItem({
      productoId:   producto.id,
      slug:         producto.slug,
      titulo:       producto.titulo,
      precio,
      imagenNombre: imagenPrincipal ? imagenPrincipal.url.split("/").pop() ?? null : null,
      imagenAlt:    imagenPrincipal?.alt ?? producto.titulo,
      marca:        producto.marca ?? null,
    });
  };

  const handleCantidadChange = (val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1) setCantidad(n);
    else if (val === "") setCantidad(1);
  };

  const incrementar = () => setCantidad((p) => p + 1);
  const decrementar = () => setCantidad((p) => Math.max(1, p - 1));

  const TRUST_BADGES = [
    { icon: FaIcons.truck,      label: "Envío rápido"     },
    { icon: FaIcons.lock,       label: "Pago seguro"      },
    { icon: FaIcons.rotateLeft, label: "Devolución fácil" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(37,99,235,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.025) 1px, transparent 1px)", backgroundSize: "48px 48px", zIndex: 0 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-8 lg:pt-24 lg:pb-14">

        {/* Breadcrumb */}
        <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
          className="mb-8 flex items-center gap-2 flex-wrap"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
          <Link href="/" className="hover:text-blue-500 transition-colors uppercase" style={{ color: "var(--color-cq-muted)", textDecoration: "none" }}>Inicio</Link>
          <span style={{ color: "var(--color-cq-border)" }}>›</span>
          <Link href="/catalogo" className="hover:text-blue-500 transition-colors uppercase" style={{ color: "var(--color-cq-muted)", textDecoration: "none" }}>Catálogo</Link>
          {producto.categorias[0] && (
            <>
              <span style={{ color: "var(--color-cq-border)" }}>›</span>
              <Link href={`/catalogo?cat=${producto.categorias[0].slug}`} className="hover:text-blue-500 transition-colors uppercase" style={{ color: "var(--color-cq-muted)", textDecoration: "none" }}>
                {producto.categorias[0].nombre}
              </Link>
            </>
          )}
          <span style={{ color: "var(--color-cq-border)" }}>›</span>
          <span className="uppercase" style={{ color: "var(--color-cq-text)" }}>{producto.titulo}</span>
        </motion.nav>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* Galería */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
            <ProductGallery imagenes={imagenesMostrar} productoId={producto.id} titulo={producto.titulo} />
          </motion.div>

          {/* Info */}
          <div className="flex flex-col gap-5">

            {/* Marca + categorías */}
            <motion.div {...fadeUp(0)} className="flex flex-wrap gap-2">
              {producto.marca && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold"
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

            {producto.descripcion_corta && (
              <motion.p {...fadeUp(0.14)} className="text-base leading-relaxed" style={{ color: "var(--color-cq-muted)" }}>
                {producto.descripcion_corta}
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
                    style={{ width: "44px", height: "52px", color: "var(--color-cq-text)", cursor: cantidad <= 1 ? "not-allowed" : "pointer" }}>
                    {FaIcons.minus}
                  </button>
                  <input type="number" min={1} value={cantidad}
                    onChange={(e) => handleCantidadChange(e.target.value)}
                    className="text-center font-bold text-sm outline-none bg-transparent"
                    style={{ width: "68px", height: "52px", color: "var(--color-cq-text)", fontFamily: "var(--font-mono)", borderLeft: "1px solid var(--color-cq-border)", borderRight: "1px solid var(--color-cq-border)" }}
                  />
                  <button onClick={incrementar}
                    className="flex items-center justify-center transition-all"
                    style={{ width: "44px", height: "52px", color: "var(--color-cq-text)", cursor: "pointer" }}>
                    {FaIcons.plus}
                  </button>
                </div>

                <motion.button onClick={handleAddToCart} disabled={!tieneStock}
                  whileHover={tieneStock ? { scale: 1.02, y: -1 } : {}}
                  whileTap={tieneStock ? { scale: 0.97 } : {}}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-sm"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em", textTransform: "uppercase", height: "52px", minWidth: "160px", background: tieneStock ? (added ? "#16A34A" : "var(--color-cq-primary)") : "var(--color-cq-surface-2)", color: tieneStock ? "white" : "var(--color-cq-muted-2)", border: tieneStock ? "none" : "1px solid var(--color-cq-border)", cursor: tieneStock ? "pointer" : "not-allowed", boxShadow: tieneStock ? "0 4px 20px rgba(29,78,216,0.3)" : "none", transition: "background 0.25s ease, box-shadow 0.25s ease" }}>
                  {added ? <>{FaIcons.check} Agregado</> : <>{FaIcons.cartShopping} {tieneStock ? "Agregar al carrito" : "Sin stock"}</>}
                </motion.button>

                <motion.button onClick={handleWishlistToggle}
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.88 }}
                  title={wished ? "Quitar de favoritos" : "Guardar en favoritos"}
                  className="flex items-center justify-center rounded-xl shrink-0 relative overflow-hidden"
                  style={{ width: "52px", height: "52px", border: wished ? "1.5px solid rgba(239,68,68,0.35)" : "1.5px solid var(--color-cq-border)", background: wished ? "rgba(239,68,68,0.07)" : "var(--color-cq-surface)", color: wished ? "#EF4444" : "var(--color-cq-muted)", cursor: "pointer", transition: "background 0.2s ease, border-color 0.2s ease, color 0.2s ease" }}>
                  <AnimatePresence mode="wait">
                    <motion.span key={wished ? "filled" : "outline"}
                      initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="flex items-center justify-center">
                      <HeartIcon filled={wished} />
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            {/* Trust badges */}
            <motion.div {...fadeUp(0.42)} className="grid grid-cols-3 gap-3">
              {TRUST_BADGES.map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2 py-3 rounded-xl text-center"
                  style={{ background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}>
                  <span style={{ color: "var(--color-cq-accent)" }}>{b.icon}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
                    {b.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Specs */}
        {producto.metacampos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-14">
            <ProductSpecs metacampos={producto.metacampos} varianteActiva={selectedVariante} />
          </motion.div>
        )}
      </div>
    </div>
  );
}