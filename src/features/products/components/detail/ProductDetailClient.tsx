// app/(main)/producto/[slug]/components/ProductDetailClient.tsx
"use client";

import { useVenta } from "@/shared/context/ContextoVenta";
import { BotonCotizacion } from "@/shared/ui/BotonCotizacion";
import { useState }               from "react";
import { useFichaProducto }       from "@mpeduardo98/commerce-core/ficha";
import Link                       from "next/link";
import Image                      from "next/image";
import { motion }                 from "framer-motion";
import { useCart }                from "@/features/cart/context/CartContext";
import { useWishlist }            from "@/features/wishlist/context/WishlistContext";
import { useCurrency }            from "@/shared/context/CurrencyContext";
import { ProductVariantSelector } from "./ProductVariantSelector";
import { ProductSpecs }           from "./ProductSpecs";
import { ShareButton }            from "./ShareButton";
import { PlanCorte }              from "./PlanCorte";
import { useTopeFijo }            from "@/features/products/hooks/useTopeFijo";
import type { ProductoDetalle } from "@/features/products/types/product-detail";
import { resolveImageUrl }        from "@/features/media/lib/resolveImageUrl";
import { sanitizeRichText, hasRichTextContent } from "@/shared/lib/rich-text";

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
  const { ventaEnLinea, mostrarPrecios } = useVenta();
  const { addItem }              = useCart();
  const { toggleItem, isWished } = useWishlist();
  const { format }               = useCurrency();

  // Variante, precios, existencia, cantidad y plan de corte: la lógica es del core.
  const ficha = useFichaProducto(producto, { ventaEnLinea, mostrarPrecios });
  const [added, setAdded] = useState(false);

  // 112px = header + aire. Sólo aplica en escritorio, donde la columna es sticky.
  const [refInfo, topInfo] = useTopeFijo<HTMLDivElement>(112);

  const {
    variante: selectedVariante, imagen: imagenActiva, plan: planCorte,
    precioBase, precioOriginal, stock, tieneDescuento, descuento, cantidad,
  } = ficha;
  const configTramos   = planCorte.config;
  const precio         = ficha.precioUnitario;
  const tieneStock     = ficha.disponible;
  const puedeComprar   = tieneStock;
  const wished         = isWished(producto.id);
  const tieneEspecificaciones = producto.metacampos.length > 0 || selectedVariante !== null ||
    Boolean(producto.envio && (producto.envio.largo || producto.envio.ancho || producto.envio.alto || producto.envio.peso));

  const { incrementar, decrementar } = ficha;

  const handleAgregarCarrito = () => {
    if (!ficha.lineaCarrito) return;
    addItem(ficha.lineaCarrito);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = () => {
    toggleItem({
      productoId:   producto.id,
      varianteId:   selectedVariante?.id ?? null,
      slug:         producto.slug,
      titulo:       producto.titulo,
      precio:       precioBase,
      imagenNombre: imagenActiva?.url ?? null,
      imagenAlt:    imagenActiva?.alt ?? null,
      marca:        producto.marca ?? null,
    });
  };

  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-10">
        {/* En escritorio la info queda fija a la derecha mientras la
            columna izquierda (galería + especificaciones) se desplaza. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-14">

          {/* ── Galería ── */}
          <div className="flex min-w-0 flex-col gap-3 lg:col-start-1 lg:row-start-1">
            <div className="relative">
            <motion.div
              {...fadeUp(0)}
              className="relative rounded-2xl overflow-hidden"
              style={{ aspectRatio: "1 / 1", background: "var(--color-cq-surface)", border: "1px solid var(--color-cq-border)" }}
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
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-xl p-1 shadow-sm" style={{ background: "color-mix(in srgb, var(--color-cq-surface) 90%, transparent)", backdropFilter: "blur(8px)" }} role="group" aria-label="Acciones del producto">
                <motion.button
                  onClick={handleWishlist}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{ width: "44px", height: "44px", border: "none", background: "transparent", color: "var(--color-cq-muted)", cursor: "pointer" }}
                  aria-pressed={wished}
                  aria-label={wished ? "Quitar de favoritos" : "Agregar a favoritos"}
                  title={wished ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  <HeartIcon filled={wished} />
                </motion.button>

                <ShareButton titulo={producto.titulo} slug={producto.slug} />
            </div>
            </div>

            {producto.imagenes.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {producto.imagenes.slice(0, 6).map((img, i) => {
                  const isActive = img.id === imagenActiva?.id;
                  return (
                    <button
                      key={img.id}
                      onClick={() => ficha.seleccionarImagen(img)}
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
          <div ref={refInfo} style={{ top: topInfo }}
            className="flex min-w-0 flex-col gap-5 lg:sticky lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">

            {/* Badges */}
            <motion.div {...fadeUp(0)} className="flex flex-wrap gap-2">
              {producto.marca && (
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--color-cq-accent-glow)", color: "var(--color-cq-accent)", border: "1px solid rgba(37,99,235,0.2)" }}>
                  {producto.marca}
                </span>
              )}
              {producto.categorias.map((c) => (
                <Link key={c.id} href={`/categoria/${c.slug}`}
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

            {hasRichTextContent(producto.descripcion) && (
              <motion.div
                {...fadeUp(0.14)}
                className="cq-rich-text text-base text-justify [&_*]:text-justify!"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(producto.descripcion) }}
              />
            )}

            <div style={{ height: "1px", background: "var(--color-cq-border)" }} />

            {/* Precio + stock */}
            <motion.div {...fadeUp(0.21)} className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                {mostrarPrecios && precio > 0 ? (
                  <span className="text-display" style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", color: "var(--color-cq-text)" }}>
                    {format(precioBase)}
                  </span>
                ) : (
                  <span className="text-base" style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
                    Precio a consultar
                  </span>
                )}
                {ventaEnLinea && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: tieneStock ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${tieneStock ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: tieneStock ? "#22C55E" : "#EF4444", whiteSpace: "nowrap" }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tieneStock ? "#22C55E" : "#EF4444" }} />
                  {tieneStock ? (stock > 10 ? "En stock" : `Últimas ${stock} unidades`) : "Agotado"}
                </span>}
              </div>
              {mostrarPrecios && precio > 0 && tieneDescuento && (
                <div className="flex items-center gap-2">
                  <span className="text-base line-through" style={{ color: "var(--color-cq-muted-2)" }}>{format(precioOriginal)}</span>
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
                <ProductVariantSelector variantes={producto.variantes} selectedId={selectedVariante.id} opciones={ficha.opcionesAtributos} onSelect={ficha.seleccionarVariante} />
              </motion.div>
            )}

            {/* Plan de corte */}
            {configTramos && (
              <motion.div {...fadeUp(0.32)}>
                <PlanCorte config={configTramos} estado={planCorte} precioBase={precioBase} mostrarPrecios={mostrarPrecios} format={format} />
              </motion.div>
            )}

            {/* Cantidad + CTA */}
            <motion.div {...fadeUp(0.35)} className="flex flex-col gap-1.5">
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-cq-muted)" }}>
                {planCorte.plan ? "Piezas con este plan" : "Cantidad"}
                {mostrarPrecios && precio > 0 && (cantidad > 1 || planCorte.cargo > 0) && (
                  <span style={{ marginLeft: "0.75rem", color: "var(--color-cq-accent)", letterSpacing: "0.04em" }}>
                    = {format(ficha.total)}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center rounded-xl overflow-hidden shrink-0"
                  style={{ border: "1.5px solid var(--color-cq-border)", background: "var(--color-cq-surface)", height: "52px" }}>
                  <button onClick={decrementar} disabled={cantidad <= 1}
                    className="flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ width: "56px", height: "52px", color: "var(--color-cq-text)", cursor: cantidad <= 1 ? "not-allowed" : "pointer", background: "none", border: "none" }}>
                    {Icons.minus}
                  </button>
                  <span className="text-base font-bold tabular-nums"
                    style={{ minWidth: "48px", textAlign: "center", fontFamily: "var(--font-display)", color: "var(--color-cq-text)" }}>
                    {cantidad}
                  </span>
                  <button onClick={incrementar}
                    className="flex items-center justify-center transition-all"
                    style={{ width: "56px", height: "52px", color: "var(--color-cq-text)", cursor: "pointer", background: "none", border: "none" }}>
                    {Icons.plus}
                  </button>
                </div>

                {!ventaEnLinea ? (
                  <BotonCotizacion className="h-[52px] min-w-[160px] flex-1" producto={producto.titulo} slug={producto.slug} detalle={ficha.resumen.join(" · ")} />
                ) : <motion.button
                  onClick={handleAgregarCarrito}
                  disabled={!puedeComprar}
                  whileHover={puedeComprar ? { scale: 1.02 } : {}}
                  whileTap={puedeComprar ? { scale: 0.98 } : {}}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl font-bold transition-all"
                  style={{
                    height:     "52px",
                    minWidth:   "160px",
                    background: puedeComprar ? (added ? "rgba(22,163,74,0.9)" : "var(--color-cq-accent)") : "var(--color-cq-surface-2)",
                    color:      puedeComprar ? "#fff" : "var(--color-cq-muted-2)",
                    border:     "none",
                    cursor:     puedeComprar ? "pointer" : "not-allowed",
                    fontSize:   "0.9rem",
                    letterSpacing: "0.02em",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {added ? Icons.check : Icons.cart}
                  {added ? "Agregado" : tieneStock ? "Agregar al carrito" : "Sin stock"}
                </motion.button>}


              </div>
            </motion.div>

            {tieneEspecificaciones && (
              <button
                type="button"
                onClick={() => {
                  const seccion = document.getElementById("especificaciones");
                  seccion?.focus({ preventScroll: true });
                  seccion?.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
                    block: "start",
                  });
                }}
                className="inline-flex items-center gap-2 self-start py-2 text-sm font-semibold hover:underline"
                style={{ color: "var(--color-cq-accent)", cursor: "pointer" }}
                aria-controls="especificaciones"
              >
                Ver especificaciones
                <i className="fa-solid fa-arrow-down text-xs" aria-hidden="true" />
              </button>
            )}
          </div>

        {tieneEspecificaciones && (
          <section
            id="especificaciones"
            aria-labelledby="titulo-especificaciones"
            tabIndex={-1}
            className="min-w-0 border-t pt-10 sm:pt-14 lg:col-start-1 lg:row-start-2 lg:border-t-0 lg:pt-0"
            style={{ borderColor: "var(--color-cq-border)", scrollMarginTop: "9rem" }}
          >
            <h2 id="titulo-especificaciones" className="text-display mb-6 text-2xl sm:text-3xl"
              style={{ color: "var(--color-cq-text)" }}>
              Especificaciones del producto
            </h2>
            <ProductSpecs metacampos={producto.metacampos} varianteActiva={selectedVariante} envio={producto.envio} />
          </section>
        )}
        </div>
      </div>
    </main>
  );
}
