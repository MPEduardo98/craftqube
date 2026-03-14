// app/(admin)/layout.tsx
// ─────────────────────────────────────────────────────────────
// Shell del panel de administración.
// Sidebar izquierdo + área de contenido.
// NO incluye Header/Footer del sitio público.
// ─────────────────────────────────────────────────────────────
import Link from "next/link";
import { AdminSidebar } from "./components/AdminSidebar";

export const metadata = {
  title: {
    default:  "Admin — CraftQube",
    template: "%s — Admin CraftQube",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    /*
     * fixed + inset-0 + z-[9999]
     * ────────────────────────────────────────────────────────
     * Cubre el Header/Footer del root layout sin necesidad de
     * modificar app/layout.tsx ni app/(main)/layout.tsx.
     * El admin se renderiza como una "app dentro de la app".
     */
    <div
      className="fixed inset-0 z-[9999] flex bg-slate-50"
      style={{ fontFamily: "var(--font-dm-sans, system-ui, sans-serif)" }}
    >
      <AdminSidebar />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">CraftQube</span>
            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm font-medium text-slate-700">Panel Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver tienda
            </Link>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Scroll area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}