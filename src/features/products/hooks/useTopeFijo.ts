// features/products/hooks/useTopeFijo.ts
// ─────────────────────────────────────────────────────────────
// `top` para una columna `position: sticky`. Si la columna cabe en
// pantalla se fija bajo el header; si es más alta, el tope se vuelve
// negativo para que se fije mostrando su parte de abajo (donde está
// el botón de compra) en vez de cortarla.
// ─────────────────────────────────────────────────────────────
"use client";

import { useEffect, useRef, useState } from "react";

export function useTopeFijo<T extends HTMLElement>(tope: number, margenInferior = 24) {
  const ref = useRef<T>(null);
  const [top, setTop] = useState(tope);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () =>
      setTop(Math.min(tope, window.innerHeight - el.offsetHeight - margenInferior));
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    window.addEventListener("resize", medir);
    return () => {
      observador.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [tope, margenInferior]);

  return [ref, top] as const;
}
