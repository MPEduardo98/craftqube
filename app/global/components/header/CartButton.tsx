// app/global/components/header/CartButton.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/global/context/CartContext";

export function CartButton() {
  const { totalItems, openDrawer } = useCart();

  return (
    <motion.button
      onClick={openDrawer}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.35)" }}
      whileTap={{ scale: 0.93 }}
      transition={{ duration: 0.15 }}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg"
      style={{
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "white",
        cursor: "pointer",
      }}
      aria-label={`Carrito (${totalItems} artículos)`}
    >
      <svg
        width="17" height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full font-bold"
            style={{
              background: "#3B82F6",
              color: "white",
              fontSize: "0.6rem",
              fontFamily: "var(--font-mono)",
              padding: "0 4px",
              border: "2px solid rgba(17,24,39,1)",
            }}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}