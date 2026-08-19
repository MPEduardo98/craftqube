// features/products/components/detail/ShareButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence }     from "framer-motion";
import { useAlert }                    from "@/shared/context/AlertContext";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://craftqube.mx";

const Icons = {
  share: (
    <svg viewBox="0 0 448 512" fill="currentColor" width="17" height="17">
      <path d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3V320c0 17.7 14.3 32 32 32s32-14.3 32-32V109.3l73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 53 43 96 96 96H352c53 0 96-43 96-96V352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V352z"/>
    </svg>
  ),
  link: (
    <svg viewBox="0 0 640 512" fill="currentColor" width="15" height="15">
      <path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 448 512" fill="currentColor" width="15" height="15">
      <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 448 512" fill="currentColor" width="15" height="15">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 110.9L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 320 512" fill="currentColor" width="15" height="15">
      <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 512 512" fill="currentColor" width="15" height="15">
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
    </svg>
  ),
  email: (
    <svg viewBox="0 0 512 512" fill="currentColor" width="15" height="15">
      <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/>
    </svg>
  ),
};

interface Props {
  titulo: string;
  slug:   string;
}

export function ShareButton({ titulo, slug }: Props) {
  const { success, error } = useAlert();

  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const url  = `${SITE_URL}/producto/${slug}`;
  const text = `${titulo} — CraftQube`;

  // Cierra el menú al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
      setOpen(false);
    } catch {
      error("No se pudo copiar el enlace");
    }
  };

  // Usa el diálogo nativo del sistema si existe (móvil); si no, abre el menú.
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: titulo, text, url });
        return;
      } catch (e) {
        // Cancelar el diálogo nativo no es un error que deba reportarse.
        if ((e as DOMException)?.name === "AbortError") return;
      }
    }
    setOpen((o) => !o);
  };

  const redes = [
    {
      label: "WhatsApp",
      icon:  Icons.whatsapp,
      href:  `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    },
    {
      label: "Facebook",
      icon:  Icons.facebook,
      href:  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      label: "X",
      icon:  Icons.x,
      href:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      label: "Correo",
      icon:  Icons.email,
      href:  `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n${url}`)}`,
    },
  ];

  return (
    <div ref={boxRef} className="relative shrink-0">
      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="flex items-center justify-center rounded-xl"
        style={{
          width:      "52px",
          height:     "52px",
          border:     "1.5px solid var(--color-cq-border)",
          background: "var(--color-cq-surface)",
          color:      "var(--color-cq-muted)",
          cursor:     "pointer",
        }}
        aria-label="Compartir producto"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Compartir producto"
      >
        {Icons.share}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 z-50 rounded-xl overflow-hidden"
            style={{
              bottom:     "calc(100% + 8px)",
              minWidth:   "196px",
              background: "var(--color-cq-surface)",
              border:     "1px solid var(--color-cq-border)",
              boxShadow:  "0 12px 32px rgba(0,0,0,0.18)",
            }}
          >
            <div
              className="px-3 py-2"
              style={{
                fontFamily:    "var(--font-mono)",
                fontSize:      "0.6rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         "var(--color-cq-muted-2)",
                borderBottom:  "1px solid var(--color-cq-border)",
              }}
            >
              Compartir
            </div>

            {redes.map((red) => (
              <a
                key={red.label}
                href={red.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-black/5"
                style={{ color: "var(--color-cq-text)", textDecoration: "none" }}
              >
                <span style={{ color: "var(--color-cq-muted)", display: "flex" }}>{red.icon}</span>
                {red.label}
              </a>
            ))}

            <button
              onClick={handleCopiar}
              role="menuitem"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-black/5"
              style={{
                color:      "var(--color-cq-text)",
                background: "none",
                border:     "none",
                borderTop:  "1px solid var(--color-cq-border)",
                cursor:     "pointer",
                textAlign:  "left",
              }}
            >
              <span style={{ color: copied ? "#22C55E" : "var(--color-cq-muted)", display: "flex" }}>
                {copied ? Icons.check : Icons.link}
              </span>
              {copied ? "Enlace copiado" : "Copiar enlace"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
