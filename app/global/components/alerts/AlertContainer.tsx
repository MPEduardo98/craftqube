// app/global/components/alerts/AlertContainer.tsx
"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert, type Alert, type AlertType } from "@/app/global/context/AlertContext";

/* ── Configuración por tipo ─────────────────────────────────────────────── */
const CONFIG: Record<AlertType, {
  bg:        string;
  icon:      React.ReactNode;
}> = {
  success: {
    bg: "var(--color-cq-primary)",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    bg: "#dc2626",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  warning: {
    bg: "#d97706",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  info: {
    bg: "var(--color-cq-primary)",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
};

/* ── Barra de progreso ─────────────────────────────────────────────────── */
function ProgressBar({ duration }: { duration: number }) {
  if (!duration || duration <= 0) return null;
  return (
    <motion.div
      style={{
        position:        "absolute",
        bottom:          0,
        left:            0,
        height:          "2px",
        background:      "rgba(255,255,255,0.35)",
        transformOrigin: "left",
        width:           "100%",
      }}
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{ duration: duration / 1000, ease: "linear" }}
    />
  );
}

/* ── Item individual ───────────────────────────────────────────────────── */
function AlertItem({ alert }: { alert: Alert }) {
  const { dismiss } = useAlert();
  const cfg         = CONFIG[alert.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1,  y: 0,  scale: 1    }}
      exit={{    opacity: 0,  y: 6,  scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      style={{
        position:     "relative",
        display:      "flex",
        alignItems:   "center",
        gap:          "12px",
        padding:      "13px 14px 13px 16px",
        borderRadius: "12px",
        background:   cfg.bg,
        boxShadow:    "0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)",
        overflow:     "hidden",
        minWidth:     "280px",
        maxWidth:     "360px",
        width:        "100%",
      }}
    >
      {/* Ícono */}
      <div style={{
        flexShrink:     0,
        width:          "30px",
        height:         "30px",
        borderRadius:   "8px",
        background:     "rgba(255,255,255,0.18)",
        color:          "white",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
      }}>
        {cfg.icon}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {alert.title && (
          <p style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.72rem",
            fontWeight:    700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color:         "rgba(255,255,255,0.7)",
            margin:        "0 0 2px",
            lineHeight:    1.2,
          }}>
            {alert.title}
          </p>
        )}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize:   "0.83rem",
          fontWeight: 500,
          color:      "white",
          lineHeight: 1.45,
          margin:     0,
        }}>
          {alert.message}
        </p>
      </div>

      {/* Botón cerrar */}
      <motion.button
        onClick={() => dismiss(alert.id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          flexShrink:     0,
          width:          "22px",
          height:         "22px",
          borderRadius:   "6px",
          background:     "rgba(255,255,255,0.15)",
          border:         "none",
          cursor:         "pointer",
          color:          "rgba(255,255,255,0.8)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </motion.button>

      {/* Barra de progreso */}
      {alert.duration && alert.duration > 0 && (
        <ProgressBar duration={alert.duration} />
      )}
    </motion.div>
  );
}

/* ── Contenedor principal ──────────────────────────────────────────────── */
export function AlertContainer() {
  const { alerts } = useAlert();

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      style={{
        position:      "fixed",
        bottom:        "24px",
        right:         "24px",
        zIndex:        9999,
        display:       "flex",
        flexDirection: "column",
        gap:           "8px",
        alignItems:    "flex-end",
        pointerEvents: alerts.length ? "auto" : "none",
      }}
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="sync">
        {alerts.map((a) => <AlertItem key={a.id} alert={a} />)}
      </AnimatePresence>
    </div>,
    document.body
  );
}