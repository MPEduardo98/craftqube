// app/global/components/header/CartButton.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function CartButton() {
  const [count] = useState(0);

  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.35)" }}
      whileTap={{ backgroundColor: "rgba(255,255,255,0.25)" }}
      transition={{ duration: 0.15 }}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg"
      style={{
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "white",
        cursor: "pointer",
      }}
      aria-label={`Carrito (${count} artículos)`}
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

      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-xs font-bold"
          style={{
            background: "#3B82F6",
            color: "white",
            fontSize: "0.6rem",
          }}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}