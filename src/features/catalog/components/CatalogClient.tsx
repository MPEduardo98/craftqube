// app/(main)/catalogo/components/CatalogClient.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FilterSidebar }  from "./FilterSidebar";
import { CatalogToolbar } from "./CatalogToolbar";
import { CatalogGrid }    from "./CatalogGrid";
import type { Producto } from "@/features/products/types/product";

interface Categoria {
  id: number; nombre: string; slug: string; total_productos: number;
}
interface Marca {
  id: number; nombre: string; slug: string; total_productos: number;
}
interface Meta {
  total: number; page: number; limit: number; pages: number;
}

const LIMIT = 24;

// ── CAMBIO SEO: props opcionales para hidratación SSR ────────
interface Props {
  initialProductos?:  Producto[];
  initialTotal?:      number;
  initialPages?:      number;
  initialCategorias?: Categoria[];
  /** Slug de categoría cuando se monta desde /categoria/[slug].
   *  La categoría vive en la ruta, no en un query param. */
  categoriaSlug?:     string;
  /** Encabezado visible. En /categoria/[slug] es el nombre de la
   *  categoría; en /catalogo, "Catálogo".
   *  Nota: el <h1> real lo renderiza la página servidor —este
   *  componente es "use client" y su HTML llega por streaming,
   *  así que un <h1> aquí no estaría en la respuesta inicial. */
  titulo?:            string;
  descripcion?:       string | null;
  /** Breadcrumb SSR ya renderizado por la página servidor. */
  breadcrumb?:        React.ReactNode;
}

export function CatalogClient({
  initialProductos  = [],
  initialTotal      = 0,
  initialPages      = 0,
  initialCategorias = [],
  categoriaSlug,
  titulo      = "Catálogo",
  descripcion = null,
  breadcrumb  = null,
}: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  /* ── URL → state inicial ── */
  const [q,           setQ]           = useState(searchParams.get("q")     ?? "");
  // La categoría de la ruta manda sobre cualquier ?cat= heredado.
  const [cat,         setCat]         = useState(categoriaSlug ?? searchParams.get("cat") ?? "");
  const [marca,       setMarca]       = useState(searchParams.get("marca") ?? "");
  const [soloStock,   setSoloStock]   = useState(searchParams.get("stock") === "1");
  const [sort,        setSort]        = useState(searchParams.get("sort")  ?? "reciente");
  const [page,        setPage]        = useState(parseInt(searchParams.get("page") ?? "1", 10));
  const [view,        setView]        = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Datos ─────────────────────────────────────────────────
     La página servidor ya hizo el fetch con los filtros que venían
     en la URL (cat/marca/sort/stock/q/page), así que initialProductos
     SIEMPRE corresponde al estado inicial —haya query params o no.
     Partimos de esos datos y sin loading: descartarlos para volver a
     pedir exactamente lo mismo dejaba el grid vacío durante la
     hidratación, y el footer saltaba hasta chocar con el header. */
  const [productos,  setProductos]  = useState<Producto[]>(initialProductos);
  const [meta,       setMeta]       = useState<Meta>({
    total: initialTotal,
    page,
    limit: LIMIT,
    pages: initialPages,
  });
  const [loading,    setLoading]    = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>(
    initialCategorias.length > 0 ? initialCategorias : []
  );
  const [marcas,     setMarcas]     = useState<Marca[]>([]);

  /* ── Debounce search ── */
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedQ, setDebouncedQ] = useState(q);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedQ(q), 380);
    return () => clearTimeout(searchTimer.current);
  }, [q]);

  /* ── Ruta → estado ────────────────────────────────────────
     Navegar entre categorías (o volver con el botón "atrás")
     remonta la página servidor con otro categoriaSlug pero
     reutiliza esta instancia. Sin esto, el estado local se
     quedaría con la categoría anterior. */
  useEffect(() => {
    setCat(categoriaSlug ?? "");
  }, [categoriaSlug]);

  /* ── Cargar categorías y marcas una sola vez ── */
  useEffect(() => {
    // Solo fetch categorías si no vinieron del servidor
    if (categorias.length === 0) {
      fetch("/api/categorias")
        .then((r) => r.json())
        .then((j) => { if (j.success) setCategorias(j.data); })
        .catch(() => {});
    }

    fetch("/api/marcas")
      .then((r) => r.json())
      .then((j) => { if (j.success) setMarcas(j.data); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Sincronizar URL ──────────────────────────────────────
     La categoría es la única faceta que vive en la ruta
     (/categoria/<slug>) porque es la que queremos indexable.
     El resto —marca, orden, stock, página, búsqueda— son
     refinamientos y quedan como query params. */
  const syncURL = useCallback((overrides: Record<string, string | number | boolean>) => {
    const params = new URLSearchParams();
    const state = { q: debouncedQ, cat, marca, stock: soloStock ? "1" : "", sort, page, ...overrides };
    if (state.q)         params.set("q",     String(state.q));
    if (state.marca)     params.set("marca", String(state.marca));
    if (state.stock)     params.set("stock", "1");
    if (state.sort !== "reciente") params.set("sort", String(state.sort));
    if (Number(state.page) > 1)    params.set("page", String(state.page));

    const base = state.cat ? `/categoria/${state.cat}` : "/catalogo";
    const qs   = params.toString();
    const url  = `${base}${qs ? `?${qs}` : ""}`;

    // Cambiar de categoría cambia de ruta → push, para que el
    // botón "atrás" del navegador funcione como el usuario espera.
    // Cambiar un filtro dentro de la misma ruta → replace.
    const cambioDeRuta = String(state.cat) !== cat;
    if (cambioDeRuta) router.push(url, { scroll: false });
    else              router.replace(url, { scroll: false });
  }, [debouncedQ, cat, marca, soloStock, sort, page, router]);

  /* ── Fetch productos ── */
  // El primer render siempre reutiliza los datos SSR: refetchear al
  // montar pediría la misma consulta que ya viene en el HTML.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (debouncedQ) params.set("q",     debouncedQ);
    if (cat)        params.set("cat",   cat);
    if (marca)      params.set("marca", marca);
    if (soloStock)  params.set("stock", "1");
    params.set("sort",  sort);
    params.set("page",  String(page));
    params.set("limit", String(LIMIT));

    setLoading(true);
    fetch(`/api/catalogo?${params.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setProductos(j.data);
          setMeta(j.meta);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedQ, cat, marca, soloStock, sort, page]);

  /* ── Helpers con reset de página ── */
  const handleCat = (v: string)    => { setCat(v); setPage(1); syncURL({ cat: v, page: 1 }); };
  const handleMarca = (v: string)  => { setMarca(v); setPage(1); syncURL({ marca: v, page: 1 }); };
  const handleStock = (v: boolean) => { setSoloStock(v); setPage(1); syncURL({ stock: v ? "1" : "", page: 1 }); };
  const handleSort = (v: string)   => { setSort(v); setPage(1); syncURL({ sort: v, page: 1 }); };
  const handlePage = (p: number)   => { setPage(p); syncURL({ page: p }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  // "Limpiar todo" desde /categoria/<slug> conserva la categoría:
  // es la ruta en la que estás, no un filtro que quitaste.
  const handleClearAll = ()        => {
    setQ(""); setDebouncedQ(""); setCat(categoriaSlug ?? "");
    setMarca(""); setSoloStock(false); setSort("reciente"); setPage(1);
    router.replace(categoriaSlug ? `/categoria/${categoriaSlug}` : "/catalogo", { scroll: false });
  };

  // En /categoria/<slug> la categoría no es un filtro activo que
  // se pueda quitar: es la página. No cuenta ni aparece como chip.
  const catEsFiltro  = !categoriaSlug && !!cat;
  const totalActivos = [catEsFiltro ? cat : "", marca, soloStock ? "stock" : ""].filter(Boolean).length;

  /* ── Active filter chips ── */
  const chips: { label: string; onRemove: () => void }[] = [];
  if (catEsFiltro) chips.push({ label: categorias.find((c) => c.slug === cat)?.nombre ?? cat, onRemove: () => handleCat("") });
  if (marca)      chips.push({ label: marca, onRemove: () => handleMarca("") });
  if (soloStock)  chips.push({ label: "En stock", onRemove: () => handleStock(false) });
  if (debouncedQ) chips.push({ label: `"${debouncedQ}"`, onRemove: () => { setQ(""); setDebouncedQ(""); syncURL({ q: "" }); } });

  return (
    <div className="min-h-screen" style={{ background: "var(--color-cq-bg)" }}>
      {/* Grid bg */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(37,99,235,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.025) 1px, transparent 1px)",
        backgroundSize: "48px 48px", zIndex: 0,
      }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 pt-20 pb-16 lg:pt-24">

        {/* ── Header ── */}
        {breadcrumb}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="text-label mb-1">Tienda</p>
          {/* El <h1> semántico lo emite la página servidor (ver Props.titulo).
              Aquí sólo va la versión visual, para no duplicar el encabezado. */}
          <p aria-hidden className="text-display" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "var(--color-cq-text)", margin: 0 }}>
            {titulo}
          </p>
          {descripcion && (
            <p style={{ marginTop: "10px", maxWidth: "620px", fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: 1.6, color: "var(--color-cq-muted)" }}>
              {descripcion}
            </p>
          )}
        </motion.div>

        {/* ── Search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative mb-6"
          style={{ maxWidth: "560px" }}
        >
          <svg
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            width="16" height="16"
            className="absolute pointer-events-none"
            style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-cq-muted)" }}
          >
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            placeholder="Buscar productos, SKU, marca…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            style={{
              width: "100%", paddingLeft: 40, paddingRight: q ? 36 : 16,
              paddingTop: 10, paddingBottom: 10,
              background:   "var(--color-cq-surface)",
              border:       "1px solid var(--color-cq-border)",
              borderRadius: "12px",
              fontFamily:   "var(--font-body)",
              fontSize:     "0.85rem",
              color:        "var(--color-cq-text)",
              outline:      "none",
            }}
          />
          <AnimatePresence>
            {q && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => { setQ(""); setPage(1); }}
                className="absolute flex items-center justify-center rounded-full"
                style={{ right: 10, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, background: "var(--color-cq-muted-2)", color: "white", border: "none", cursor: "pointer" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="9" height="9"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Active chips ── */}
        <AnimatePresence>
          {chips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center flex-wrap gap-2 mb-5"
            >
              {chips.map((chip) => (
                <motion.button
                  key={chip.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={chip.onRemove}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background:    "var(--color-cq-accent-glow)",
                    border:        "1px solid rgba(37,99,235,0.25)",
                    color:         "var(--color-cq-accent)",
                    fontFamily:    "var(--font-mono)",
                    fontSize:      "0.62rem",
                    letterSpacing: "0.04em",
                    cursor:        "pointer",
                  }}
                >
                  {chip.label}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="9" height="9"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Layout 2 cols ── */}
        <div className="flex gap-8 items-start">

          {/* Sidebar desktop */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="hidden lg:block shrink-0 sticky top-24"
            style={{ width: "220px" }}
          >
            <FilterSidebar
              categorias={categorias}
              marcas={marcas}
              selectedCat={cat}
              selectedMarca={marca}
              soloStock={soloStock}
              onCatChange={handleCat}
              onMarcaChange={handleMarca}
              onStockChange={handleStock}
              onClearAll={handleClearAll}
              totalActivos={totalActivos}
            />
          </motion.div>

          {/* Contenido */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Botón filtros mobile */}
            <div className="flex items-center justify-between lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  background: totalActivos > 0 ? "var(--color-cq-accent-glow)" : "var(--color-cq-surface)",
                  border: `1px solid ${totalActivos > 0 ? "rgba(37,99,235,0.3)" : "var(--color-cq-border)"}`,
                  color: totalActivos > 0 ? "var(--color-cq-accent)" : "var(--color-cq-muted)",
                  fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.08em",
                  cursor: "pointer",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                Filtros {totalActivos > 0 && `(${totalActivos})`}
              </button>
              <CatalogToolbar total={meta.total} sort={sort} view={view} loading={loading} onSortChange={handleSort} onViewChange={setView} />
            </div>

            {/* Toolbar desktop */}
            <div className="hidden lg:block">
              <CatalogToolbar total={meta.total} sort={sort} view={view} loading={loading} onSortChange={handleSort} onViewChange={setView} />
            </div>

            <CatalogGrid
              productos={productos}
              loading={loading}
              view={view}
              page={page}
              pages={meta.pages}
              onPageChange={handlePage}
            />
          </div>
        </div>
      </div>

      {/* ── Sidebar mobile drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 bottom-0 z-50 overflow-y-auto"
              style={{ width: 280, background: "var(--color-cq-surface)", borderRight: "1px solid var(--color-cq-border)", padding: "24px 20px" }}
            >
              <div className="flex items-center justify-between mb-6">
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--color-cq-text)" }}>Filtros</span>
                <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-cq-muted)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <FilterSidebar
                categorias={categorias}
                marcas={marcas}
                selectedCat={cat}
                selectedMarca={marca}
                soloStock={soloStock}
                onCatChange={(v) => { handleCat(v); setSidebarOpen(false); }}
                onMarcaChange={(v) => { handleMarca(v); setSidebarOpen(false); }}
                onStockChange={(v) => { handleStock(v); setSidebarOpen(false); }}
                onClearAll={() => { handleClearAll(); setSidebarOpen(false); }}
                totalActivos={totalActivos}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}