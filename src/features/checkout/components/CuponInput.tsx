// features/checkout/components/CuponInput.tsx
// ─────────────────────────────────────────────────────────────
// Campo de cupón del checkout.
//
// No valida nada por su cuenta: entrega el código al padre, que
// recalcula el resumen contra el servidor. El descuento real sale
// siempre de ese cálculo, así que lo que se ve aquí no puede
// diferir de lo que se cobra.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState }                from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  /** Código aplicado y confirmado por el servidor; null si no hay. */
  aplicado:   string | null;
  /** true mientras el servidor recalcula el resumen. */
  cargando:   boolean;
  onAplicar:  (codigo: string) => void;
  onQuitar:   () => void;
  /** Descuento ya calculado, para poder mostrarlo junto al código. */
  etiqueta?:  string | null;
  /**
   * Muestra el campo directamente, sin el enlace que lo despliega.
   * Se usa cuando el componente ya vive en un card con su propio
   * título, donde preguntar "¿tienes un cupón?" sobra.
   */
  abiertoPorDefecto?: boolean;
}

export function CuponInput({
  aplicado, cargando, onAplicar, onQuitar, etiqueta, abiertoPorDefecto = false,
}: Props) {
  const [codigo,  setCodigo]  = useState("");
  const [abierto, setAbierto] = useState(abiertoPorDefecto);
  const [focused, setFocused] = useState(false);

  const aplicar = () => {
    const limpio = codigo.trim();
    if (!limpio || cargando) return;
    onAplicar(limpio.toUpperCase());
  };

  const quitar = () => {
    setCodigo("");
    onQuitar();
  };

  /* ── Cupón activo ── */
  if (aplicado) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
        style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.22)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <i className="fa-solid fa-tag"
            style={{ fontSize: "0.8rem", color: "#16a34a", flexShrink: 0 }} />
          <div className="min-w-0">
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", fontWeight: 700,
              letterSpacing: "0.06em", color: "#15803d", margin: 0 }}>
              {aplicado}
            </p>
            {etiqueta && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem",
                color: "var(--color-cq-muted)", margin: 0, marginTop: 1 }}>
                {etiqueta}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={quitar}
          disabled={cargando}
          aria-label={`Quitar el cupón ${aplicado}`}
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em",
            textTransform: "uppercase", color: "var(--color-cq-muted)",
            background: "none", border: "none", flexShrink: 0,
            cursor: cargando ? "not-allowed" : "pointer",
            opacity: cargando ? 0.5 : 1,
          }}
        >
          Quitar
        </button>
      </motion.div>
    );
  }

  /* ── Sin cupón: enlace que despliega el campo ── */
  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex items-center gap-2 self-start"
        style={{
          fontFamily: "var(--font-body)", fontSize: "0.82rem",
          color: "var(--color-cq-accent)", background: "none",
          border: "none", padding: 0, cursor: "pointer",
        }}
      >
        <i className="fa-solid fa-tag" style={{ fontSize: "0.72rem" }} />
        ¿Tienes un cupón de descuento?
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="flex items-stretch gap-2"
        style={{ overflow: "hidden" }}
      >
        <input
          type="text"
          value={codigo}
          // Sólo cuando el comprador lo abrió a propósito: si el campo
          // ya viene desplegado, robar el foco al entrar al paso mueve
          // la página sola.
          autoFocus={!abiertoPorDefecto}
          placeholder="CÓDIGO DE CUPÓN"
          maxLength={60}
          disabled={cargando}
          onChange={(e) => setCodigo(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // Enter dentro del checkout enviaría el formulario del paso.
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); aplicar(); } }}
          style={{
            flex: 1, minWidth: 0, height: 44, padding: "0 12px", borderRadius: 8,
            border: `1.5px solid ${focused ? "var(--color-cq-accent)" : "var(--color-cq-border)"}`,
            background: "var(--color-cq-surface)", color: "var(--color-cq-text)",
            fontFamily: "var(--font-mono)", fontSize: "0.8rem", letterSpacing: "0.08em",
            textTransform: "uppercase", outline: "none",
            transition: "border-color 0.2s ease",
            boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.12)" : "none",
          }}
        />

        <motion.button
          type="button"
          onClick={aplicar}
          disabled={cargando || !codigo.trim()}
          whileTap={{ scale: 0.98 }}
          style={{
            height: 44, padding: "0 18px", borderRadius: 8, flexShrink: 0,
            border: "1.5px solid var(--color-cq-accent)",
            background: "var(--color-cq-accent)", color: "#fff",
            fontFamily: "var(--font-mono)", fontSize: "0.68rem",
            letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
            cursor: cargando || !codigo.trim() ? "not-allowed" : "pointer",
            opacity: cargando || !codigo.trim() ? 0.55 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {cargando
            ? <i className="fa-solid fa-circle-notch fa-spin" />
            : "Aplicar"}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
