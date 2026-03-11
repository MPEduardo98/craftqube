// app/global/components/alerts/AlertContainer.tsx
"use client";

import { useEffect, useRef } from "react";
import { createPortal }      from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert, type Alert, type AlertType } from "@/app/global/context/AlertContext";

/* ── Configuración visual por tipo ───────────────────────── */
const CONFIG: Record<AlertType, {
  bg:        string;
  border:    string;
  iconBg:    string;
  iconColor: string;
  barColor:  string;
  textColor: string;
  muteColor: string;
  icon:      React.ReactNode;
}> = {
  success: {
    bg:        "var(--color-cq-primary)",
    border:    "rgba(255,255,255,0.15)",
    iconBg:    "rgba(255,255,255,0.15)",
    iconColor: "white",
    barColor:  "rgba(255,255,255,0.6)",
    textColor: "white",
    muteColor: "rgba(255,255,255,0.7)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    bg:        "var(--color-cq-primary)",
    border:    "rgba(255,255,255,0.15)",
    iconBg:    "rgba(255,255,255,0.15)",
    iconColor: "white",
    barColor:  "rgba(255,255,255,0.6)",
    textColor: "white",
    muteColor: "rgba(255,255,255,0.7)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
  warning: {
    bg:        "var(--color-cq-primary)",
    border:    "rgba(255,255,255,0.15)",
    iconBg:    "rgba(255,255,255,0.15)",
    iconColor: "white",
    barColor:  "rgba(255,255,255,0.6)",
    textColor: "white",
    muteColor: "rgba(255,255,255,0.7)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  info: {
    bg:        "var(--color-cq-primary)",
    border:    "rgba(255,255,255,0.15)",
    iconBg:    "rgba(255,255,255,0.15)",
    iconColor: "white",
    barColor:  "rgba(255,255,255,0.6)",
    textColor: "white",
    muteColor: "rgba(255,255,255,0.7)",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
};

/* ── Barra de progreso ───────────────────────────────────── */
function ProgressBar({ duration, color }: { duration: number; color: string }) {
  if (!duration || duration <= 0) return null;
  return (
    <motion.div
      style={{
        position:     "absolute",
        bottom:       0,
        left:         0,
        height:       "2px",
        background:   color,
        borderRadius: "0 0 12px 12px",
        transformOrigin: "left",
      }}
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{ duration: duration / 1000, ease: "linear" }}
    />
  );
}

/* ── Ítem individual ─────────────────────────────────────── */
function AlertItem({ alert }: { alert: Alert }) {
  const { dismiss }  = useAlert();
  const cfg          = CONFIG[alert.type];
  const pauseRef     = useRef<number | null>(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      style={{
        position:     "relative",
        display:      "flex",
        alignItems:   "flex-start",
        gap:          "12px",
        padding:      "10px 13px",
        borderRadius: "10px",
        background:   cfg.bg,
        border:       `1px solid ${cfg.border}`,
        boxShadow:    "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
        overflow:     "hidden",
        cursor:       "default",
        minWidth:     "300px",
        maxWidth:     "420px",
        width:        "100%",
        backdropFilter: "blur(12px)",
      }}
      onMouseEnter={() => {
        // pausar el timer visual (no bloquea el real, solo UX)
        pauseRef.current = Date.now();
      }}
    >
      {/* Ícono */}
      <div style={{
        flexShrink:     0,
        width:          "28px",
        height:         "28px",
        borderRadius:   "7px",
        background:     cfg.iconBg,
        color:          cfg.iconColor,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        marginTop:      "1px",
      }}>
        {cfg.icon}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {alert.title && (
          <p style={{
            fontFamily:   "var(--font-display)",
            fontSize:     "0.72rem",
            fontWeight:   700,
            letterSpacing:"0.04em",
            textTransform:"uppercase",
            color:        cfg.textColor,
            marginBottom: "2px",
            lineHeight:   1.2,
          }}>
            {alert.title}
          </p>
        )}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize:   "0.76rem",
          color:      alert.title ? cfg.muteColor : cfg.textColor,
          lineHeight: 1.45,
          margin:     0,
        }}>
          {alert.message}
        </p>
      </div>

      {/* Cerrar */}
      <motion.button
        onClick={() => dismiss(alert.id)}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.9 }}
        style={{
          flexShrink:     0,
          width:          "22px",
          height:         "22px",
          borderRadius:   "6px",
          background:     "transparent",
          border:         "none",
          cursor:         "pointer",
          color:          "rgba(255,255,255,0.6)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        0,
          marginTop:      "2px",
          transition:     "color 0.15s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "white")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)")}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </motion.button>

      {/* Barra de progreso */}
      {alert.duration && alert.duration > 0 && (
        <ProgressBar duration={alert.duration} color={cfg.barColor} />
      )}
    </motion.div>
  );
}

/* ── Contenedor principal (portal) ──────────────────────── */
export function AlertContainer() {
  const { alerts } = useAlert();

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      style={{
        position:      "fixed",
        top:           "24px",
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
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}