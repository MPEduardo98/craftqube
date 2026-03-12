// app/global/components/alerts/AlertContainer.tsx
"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert, type Alert, type AlertType } from "@/app/global/context/AlertContext";

const CONFIG: Record<AlertType, {
  accent:    string;
  iconBg:    string;
  iconColor: string;
  icon:      React.ReactNode;
}> = {
  success: {
    accent:    "#10b981",
    iconBg:    "rgba(16,185,129,0.12)",
    iconColor: "#10b981",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    accent:    "#ef4444",
    iconBg:    "rgba(239,68,68,0.12)",
    iconColor: "#ef4444",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  warning: {
    accent:    "#f59e0b",
    iconBg:    "rgba(245,158,11,0.12)",
    iconColor: "#f59e0b",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  info: {
    accent:    "#3b82f6",
    iconBg:    "rgba(59,130,246,0.12)",
    iconColor: "#3b82f6",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
};

function ProgressBar({ duration, accent }: { duration: number; accent: string }) {
  if (!duration || duration <= 0) return null;
  return (
    <motion.div
      style={{
        position:        "absolute",
        bottom:          0,
        left:            0,
        height:          "2px",
        background:      accent,
        opacity:         0.4,
        transformOrigin: "left",
      }}
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{ duration: duration / 1000, ease: "linear" }}
    />
  );
}

function AlertItem({ alert }: { alert: Alert }) {
  const { dismiss } = useAlert();
  const cfg         = CONFIG[alert.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1,  y: 0,   scale: 1    }}
      exit={{    opacity: 0,  y: 8,   scale: 0.96, transition: { duration: 0.16 } }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      style={{
        position:     "relative",
        display:      "flex",
        alignItems:   "flex-start",
        gap:          "12px",
        padding:      "14px 16px",
        borderRadius: "12px",
        background:   "var(--color-cq-surface)",
        border:       "1px solid var(--color-cq-border)",
        borderLeft:   `3px solid ${cfg.accent}`,
        boxShadow:    "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        overflow:     "hidden",
        minWidth:     "300px",
        maxWidth:     "380px",
        width:        "100%",
      }}
    >
      <div style={{
        flexShrink:     0,
        width:          "30px",
        height:         "30px",
        borderRadius:   "8px",
        background:     cfg.iconBg,
        color:          cfg.iconColor,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        marginTop:      "1px",
      }}>
        {cfg.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingTop: "2px" }}>
        {alert.title && (
          <p style={{
            fontFamily:    "var(--font-display)",
            fontSize:      "0.75rem",
            fontWeight:    700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color:         cfg.accent,
            margin:        "0 0 3px",
            lineHeight:    1.2,
          }}>
            {alert.title}
          </p>
        )}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize:   "0.82rem",
          color:      "var(--color-cq-text)",
          lineHeight: 1.5,
          margin:     0,
        }}>
          {alert.message}
        </p>
      </div>

      <motion.button
        onClick={() => dismiss(alert.id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          flexShrink:     0,
          width:          "22px",
          height:         "22px",
          borderRadius:   "6px",
          background:     "transparent",
          border:         "none",
          cursor:         "pointer",
          color:          "var(--color-cq-muted)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          padding:        0,
          marginTop:      "2px",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </motion.button>

      {alert.duration && alert.duration > 0 && (
        <ProgressBar duration={alert.duration} accent={cfg.accent} />
      )}
    </motion.div>
  );
}

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