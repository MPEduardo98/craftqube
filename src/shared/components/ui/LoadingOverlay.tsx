// app/global/components/ui/LoadingOverlay.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  visible:   boolean;
  message?:  string;
  /** "fill" = cubre al padre relativo | "fixed" = pantalla completa */
  mode?:     "fill" | "fixed";
}

export function LoadingOverlay({
  visible,
  message = "Cargando...",
  mode    = "fill",
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position:       mode === "fixed" ? "fixed" : "absolute",
            inset:          0,
            zIndex:         50,
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "16px",
            background:     "var(--color-cq-bg)",
            backdropFilter: "none",
            borderRadius:   "inherit",
          }}
        >
          {/* Spinner — arco giratorio minimalista */}
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          >
            <circle
              cx="14" cy="14" r="11"
              stroke="var(--color-cq-border)"
              strokeWidth="2.5"
            />
            <circle
              cx="14" cy="14" r="11"
              stroke="var(--color-cq-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="18 52"
              strokeDashoffset="0"
            />
          </motion.svg>

          {/* Mensaje */}
          {message && (
            <p style={{
              fontFamily:    "var(--font-mono)",
              fontSize:      "0.65rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color:         "var(--color-cq-muted)",
              margin:        0,
            }}>
              {message}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}