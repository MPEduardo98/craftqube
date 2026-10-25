// shared/components/analitica/AvisoAnalitica.tsx
// ─────────────────────────────────────────────────────────────
// Aviso de consentimiento de analítica con el diseño de la tienda.
// El núcleo sólo mide si el visitante acepta (setAnalyticsConsent);
// sin respuesta, rechazo o Do Not Track no se envía nada.
// Se vuelve a abrir desde el footer con abrirPreferenciasAnalitica().
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { setAnalyticsConsent } from "@mpeduardo98/commerce-core/analytics/client";

const CLAVE_CONSENTIMIENTO = "cc-analytics-consent";
const EVENTO_CONSENTIMIENTO = "cc-analytics-consent";
const EVENTO_ABRIR         = "cq-abrir-preferencias-analitica";

export const URL_PRIVACIDAD = "/politicas/politica-de-privacidad";

export function abrirPreferenciasAnalitica() {
  window.dispatchEvent(new Event(EVENTO_ABRIR));
}

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO_CONSENTIMIENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO_CONSENTIMIENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

/** true si el visitante aún no decide y su navegador no pide «No rastrear». */
function faltaPreguntar() {
  try {
    return !localStorage.getItem(CLAVE_CONSENTIMIENTO) && navigator.doNotTrack !== "1";
  } catch {
    return false; // Sin almacenamiento no se mide: no hace falta preguntar.
  }
}

export function AvisoAnalitica() {
  const pendiente               = useSyncExternalStore(suscribir, faltaPreguntar, () => false);
  const [abierto, setAbierto]   = useState(false);
  const reducirMovimiento       = useReducedMotion();
  const visible                 = pendiente || abierto;

  useEffect(() => {
    const abrir = () => setAbierto(true);
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR, abrir);
  }, []);

  const responder = (acepta: boolean) => {
    setAnalyticsConsent(acepta);
    setAbierto(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label="Preferencias de analítica"
          className="fixed z-50 bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm rounded-xl p-5"
          style={{
            background: "var(--color-cq-surface)",
            border:     "1px solid var(--color-cq-border)",
            boxShadow:  "0 12px 40px rgba(0,0,0,0.25)",
          }}
          initial={reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="mb-1"
            style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "var(--color-cq-text)" }}
          >
            <i className="fa-solid fa-chart-simple mr-2" style={{ color: "var(--color-cq-accent)" }} />
            ¿Nos ayudas a mejorar?
          </p>
          <p className="text-sm mb-4" style={{ color: "var(--color-cq-muted)", lineHeight: 1.55 }}>
            Medimos visitas, clics y uso del carrito de forma anónima, sin guardar tu IP ni tus datos.
            Es opcional. <Link href={URL_PRIVACIDAD} className="underline" style={{ color: "var(--color-cq-text-2)" }}>Aviso de privacidad</Link>
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary flex-1 justify-center" onClick={() => responder(true)}>
              Aceptar
            </button>
            <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => responder(false)}>
              Rechazar
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
