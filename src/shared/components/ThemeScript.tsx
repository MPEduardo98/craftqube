// app/global/components/ThemeScript.tsx
// Script INLINE en <head> — se ejecuta de forma síncrona ANTES de que React
// hidrate, evitando el FOUC (flash of unstyled content / wrong theme).
// NUNCA convertir esto en "use client" — debe ser un Server Component.
// Usa next/script con beforeInteractive: un <script> JSX directo hace que
// React 19 avise "Encountered a script tag while rendering React component".

import Script from "next/script";

export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('cq-theme');
        var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        var theme = (stored === 'dark' || stored === 'light') ? stored : sys;
        document.documentElement.setAttribute('data-theme', theme);
      } catch(e) {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    })();
  `;

  return (
    <Script
      id="cq-theme"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
