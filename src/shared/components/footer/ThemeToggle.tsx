// app/global/components/footer/ThemeToggle.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-jetbrains, monospace)",
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        {isDark ? "Dark" : "Light"}
      </span>

      {/* Toggle pill */}
      <motion.button
        onClick={toggleTheme}
        aria-label={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
        style={{
          position: "relative",
          width: "48px",
          height: "26px",
          borderRadius: "999px",
          border: isDark
            ? "1px solid rgba(99,102,241,0.4)"
            : "1px solid rgba(255,255,255,0.15)",
          background: isDark
            ? "rgba(99,102,241,0.18)"
            : "rgba(255,255,255,0.08)",
          cursor: "pointer",
          overflow: "hidden",
          flexShrink: 0,
          transition: "background 0.35s ease, border-color 0.35s ease",
        }}
      >
        {/* Track glow */}
        <AnimatePresence>
          {isDark && (
            <motion.span
              key="glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "999px",
                background: "radial-gradient(ellipse at 70% 50%, rgba(99,102,241,0.25) 0%, transparent 70%)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Thumb */}
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            position: "absolute",
            top: "3px",
            left: isDark ? "calc(100% - 22px - 3px)" : "3px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            background: isDark
              ? "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)"
              : "rgba(255,255,255,0.7)",
            boxShadow: isDark
              ? "0 0 8px rgba(99,102,241,0.6)"
              : "0 1px 3px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.svg
                key="moon"
                initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                width="10" height="10" viewBox="0 0 24 24"
                fill="white" stroke="none"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </motion.svg>
            ) : (
              <motion.svg
                key="sun"
                initial={{ opacity: 0, rotate: 30, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -30, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                width="10" height="10" viewBox="0 0 24 24"
                fill="rgba(29,78,216,0.85)" stroke="none"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" stroke="rgba(29,78,216,0.85)" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="21" x2="12" y2="23" stroke="rgba(29,78,216,0.85)" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="rgba(29,78,216,0.85)" strokeWidth="2" strokeLinecap="round" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="rgba(29,78,216,0.85)" strokeWidth="2" strokeLinecap="round" />
                <line x1="1" y1="12" x2="3" y2="12" stroke="rgba(29,78,216,0.85)" strokeWidth="2" strokeLinecap="round" />
                <line x1="21" y1="12" x2="23" y2="12" stroke="rgba(29,78,216,0.85)" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="rgba(29,78,216,0.85)" strokeWidth="2" strokeLinecap="round" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="rgba(29,78,216,0.85)" strokeWidth="2" strokeLinecap="round" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.span>
      </motion.button>
    </div>
  );
}