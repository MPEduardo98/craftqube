// app/(main)/catalogo/components/CatalogClient.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FilterSidebar }  from "./FilterSidebar";
import { CatalogToolbar } from "./CatalogToolbar";
import { CatalogGrid }    from "./CatalogGrid";
import type { Producto } from "@/app/global/types/product";

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
}

export function CatalogClient({
  initialProductos  = [],
  initialTotal      = 0,
  initialPages      = 0,
  initialCategorias = [],
}: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  /* ── URL → state inicial ── */
  const [q,           setQ]           = useState(searchParams.get("q")     ?? "");
  const [cat,         setCat]         = useState(searchParams.get("cat")   ?? "");
  const [marca,       setMarca]       = useState(searchParams.get("marca") ?? "");
  const [soloStock,   setSoloStock]   = useState(searchParams.get("stock") === "1");
  const [sort,        setSort]        = useState(searchParams.get("sort")  ?? "reciente");
  const [page,        setPage]        = useState(parseInt(searchParams.get("page") ?? "1", 10));
  const [view,        setView]        = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── CAMBIO SEO: detectar si hay filtros en URL ─────────────
     Si no los hay, usamos los datos SSR del servidor directamente
     y saltamos el primer fetch para evitar doble carga. */
  const hasUrlFilters = !!(
    searchParams.get("q")     ||
    searchParams.get("cat")   ||
    searchParams.get("marca") ||
    searchParams.get("stock") ||
    searchParams.get("sort")  ||
    searchParams.get("page")
  );

  /* ── Datos ── */
  const [productos,  setProductos]  = useState<Producto[]>(
    hasUrlFilters ? [] : initialProductos
  );
  const [meta,       setMeta]       = useState<Meta>({
    total: hasUrlFilters ? 0 : initialTotal,
    page:  1,
    limit: LIMIT,
    pages: hasUrlFilters ? 0 : initialPages,
  });
  const [loading,    setLoading]    = useState(hasUrlFilters);
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

  /* ── Sincronizar URL ── */
  const syncURL = useCallback((overrides: Record<string, string | number | boolean>) => {
    const params = new URLSearchParams();
    const state = { q: debouncedQ, cat, marca, stock: soloStock ? "1" : "", sort, page, ...overrides };
    if (state.q)         params.set("q",     String(state.q));
    if (state.cat)       params.set("cat",   String(state.cat));
    if (state.marca)     params.set("marca", String(state.marca));
    if (state.stock)     params.set("stock", "1");
    if (state.sort !== "reciente") params.set("sort", String(state.sort));
    if (Number(state.page) > 1)    params.set("page", String(state.page));
    const qs = params.toString();
    router.replace(`/catalogo${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [debouncedQ, cat, marca, soloStock, sort, page, router]);

  /* ── Fetch productos ── */
  // CAMBIO SEO: saltamos el primer render si los datos vienen del servidor
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current && !hasUrlFilters) {
      isFirstRender.current = false;
      return;
    }
    isFirstRender.current = false;

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
  const handleClearAll = ()        => { setQ(""); setCat(""); setMarca(""); setSoloStock(false); setSort("reciente"); setPage(1); router.replace("/catalogo", { scroll: false }); };

  const totalActivos = [cat, marca, soloStock ? "stock" : ""].filter(Boolean).length;

  /* ── Active filter chips ── */
  const chips: { label: string; onRemove: () => void }[] = [];
  if (cat)        chips.push({ label: categorias.find((c) => c.slug === cat)?.nombre ?? cat, onRemove: () => handleCat("") });
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="text-label mb-1">Tienda</p>
          <h1 className="text-display" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "var(--color-cq-text)" }}>
            Catálogo
          </h1>
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