// app/(main)/catalogo/components/FilterSidebar.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  total_productos: number;
}

interface Marca {
  id: number;
  nombre: string;
  slug: string;
  total_productos: number;
}

interface FilterSidebarProps {
  categorias:        Categoria[];
  marcas:            Marca[];
  selectedCat:       string;
  selectedMarca:     string;
  soloStock:         boolean;
  onCatChange:       (slug: string) => void;
  onMarcaChange:     (nombre: string) => void;
  onStockChange:     (v: boolean) => void;
  onClearAll:        () => void;
  totalActivos:      number;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5" style={{ paddingBottom: "20px", borderBottom: "1px solid var(--color-cq-border)" }}>
      <span style={{
        fontFamily:    "var(--font-mono)",
        fontSize:      "0.6rem",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color:         "var(--color-cq-muted)",
        fontWeight:    600,
      }}>
        {title}
      </span>
      {children}
    </div>
  );
}

function CheckItem({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between gap-2 w-full group"
      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="shrink-0 flex items-center justify-center rounded"
          style={{
            width:      "14px",
            height:     "14px",
            border:     checked ? "2px solid var(--color-cq-accent)" : "1.5px solid var(--color-cq-border-2)",
            background: checked ? "var(--color-cq-accent)" : "transparent",
            transition: "all 0.15s ease",
          }}
        >
          {checked && (
            <svg viewBox="0 0 12 12" fill="none" width="8" height="8">
              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span style={{
          fontFamily: "var(--font-body)",
          fontSize:   "0.78rem",
          color:      checked ? "var(--color-cq-text)" : "var(--color-cq-muted)",
          fontWeight: checked ? 600 : 400,
          transition: "color 0.15s ease",
        }}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span style={{
          fontFamily:  "var(--font-mono)",
          fontSize:    "0.6rem",
          color:       "var(--color-cq-muted-2)",
          letterSpacing: "0.04em",
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

export function FilterSidebar({
  categorias,
  marcas,
  selectedCat,
  selectedMarca,
  soloStock,
  onCatChange,
  onMarcaChange,
  onStockChange,
  onClearAll,
  totalActivos,
}: FilterSidebarProps) {
  return (
    <aside className="flex flex-col gap-5" style={{ width: "100%" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "0.85rem",
          fontWeight:    700,
          color:         "var(--color-cq-text)",
          letterSpacing: "0.02em",
        }}>
          Filtros
        </span>
        <AnimatePresence>
          {totalActivos > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClearAll}
              style={{
                fontFamily:    "var(--font-mono)",
                fontSize:      "0.58rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color:         "var(--color-cq-accent)",
                background:    "none",
                border:        "none",
                cursor:        "pointer",
                padding:       "2px 6px",
              }}
            >
              Limpiar ({totalActivos})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Stock toggle */}
      <FilterSection title="Disponibilidad">
        <button
          onClick={() => onStockChange(!soloStock)}
          className="flex items-center gap-2.5"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 0" }}
        >
          <div
            className="relative shrink-0"
            style={{
              width:        "32px",
              height:       "18px",
              borderRadius: "999px",
              background:   soloStock ? "var(--color-cq-accent)" : "var(--color-cq-border-2)",
              transition:   "background 0.2s ease",
            }}
          >
            <motion.div
              animate={{ x: soloStock ? 16 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{
                position:     "absolute",
                top:          "2px",
                width:        "14px",
                height:       "14px",
                borderRadius: "50%",
                background:   "white",
                boxShadow:    "0 1px 4px rgba(0,0,0,0.2)",
              }}
            />
          </div>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize:   "0.78rem",
            color:      soloStock ? "var(--color-cq-text)" : "var(--color-cq-muted)",
            fontWeight: soloStock ? 600 : 400,
          }}>
            Solo en stock
          </span>
        </button>
      </FilterSection>

      {/* Categorías */}
      {categorias.length > 0 && (
        <FilterSection title="Categoría">
          <div className="flex flex-col gap-1">
            {categorias.map((cat) => (
              <CheckItem
                key={cat.id}
                label={cat.nombre}
                count={cat.total_productos}
                checked={selectedCat === cat.slug}
                onChange={() => onCatChange(selectedCat === cat.slug ? "" : cat.slug)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Marcas */}
      {marcas.length > 0 && (
        <FilterSection title="Marca">
          <div className="flex flex-col gap-1">
            {marcas.map((m) => (
              <CheckItem
                key={m.id}
                label={m.nombre}
                count={m.total_productos}
                checked={selectedMarca === m.nombre}
                onChange={() => onMarcaChange(selectedMarca === m.nombre ? "" : m.nombre)}
              />
            ))}
          </div>
        </FilterSection>
      )}
    </aside>
  );
}