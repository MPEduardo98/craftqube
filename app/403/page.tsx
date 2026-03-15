// app/not-found.tsx
// ─────────────────────────────────────────────────────────────
// Página 404 global del App Router.
// Se activa con notFound() desde cualquier Server Component
// o cuando Next.js no encuentra ninguna ruta que coincida.
// ─────────────────────────────────────────────────────────────
import type { Metadata } from "next";
import Link              from "next/link";

export const metadata: Metadata = {
  title:  "Página no encontrada — Craftqube",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <p
        className="text-[9rem] font-black leading-none text-slate-100 select-none tracking-tighter"
        aria-hidden
      >
        404
      </p>

      <div className="-mt-4 text-center">
        <h1 className="text-xl font-semibold text-slate-800">
          Página no encontrada
        </h1>
        <p className="mt-2 text-sm text-slate-500 max-w-xs">
          La dirección que buscas no existe o fue movida.
          Verifica la URL o regresa al inicio.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </main>
  );
}