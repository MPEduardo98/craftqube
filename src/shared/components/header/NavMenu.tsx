// app/global/components/header/NavMenu.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface NavMenuProps {
  productsOpen: boolean;
  onToggleProducts: () => void;
}

const simpleLinks = [
  { label: "Nosotros", href: "/nosotros" },
  { label: "Contacto", href: "/contacto" },
];

export function NavMenu({ productsOpen, onToggleProducts }: NavMenuProps) {
  return (
    <div className="flex items-center">

      {/* Productos — toggle del panel expandible */}
      <button
        onClick={onToggleProducts}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{
          color: productsOpen ? "white" : "rgba(255,255,255,0.85)",
          background: productsOpen ? "rgba(255,255,255,0.12)" : "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Productos
        <motion.svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          animate={{ rotate: productsOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>

      {/* Links simples */}
      {simpleLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "white";
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.85)";
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}