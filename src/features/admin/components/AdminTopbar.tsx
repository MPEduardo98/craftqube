"use client";
// app/admin/components/AdminTopbar.tsx
import { useState, type FormEvent } from "react";
import { useRouter, usePathname }   from "next/navigation";
import Link                         from "next/link";

const SCOPES = [
  { label: "Productos", path: "/admin/productos" },
  { label: "Clientes",  path: "/admin/clientes"  },
  { label: "Pedidos",   path: "/admin/pedidos"   },
] as const;

type Scope = (typeof SCOPES)[number]["path"];

function detectScope(p: string): Scope {
  if (p.startsWith("/admin/clientes")) return "/admin/clientes";
  if (p.startsWith("/admin/pedidos"))  return "/admin/pedidos";
  return "/admin/productos";
}

export function AdminTopbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [q, setQ]         = useState("");
  const [scope, setScope] = useState<Scope>(detectScope(pathname));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    router.push(t ? `${scope}?q=${encodeURIComponent(t)}` : scope);
  };

  return (
    <>
      <style>{`
        .admin-topbar-link {
          color: var(--color-cq-muted, #64748b);
          border: 1px solid var(--color-cq-border, #e2e8f0);
          background: transparent;
          transition: color .15s, border-color .15s, background .15s;
        }
        .admin-topbar-link:hover {
          color: var(--color-cq-accent, #2563eb);
          border-color: rgba(37,99,235,0.3);
          background: var(--color-cq-accent-glow, rgba(37,99,235,0.06));
        }
      `}</style>

      <header
        className="h-14 flex items-center gap-4 px-5 shrink-0"
        style={{
          background:   "var(--color-cq-surface, #fff)",
          borderBottom: "1px solid var(--color-cq-border, #e2e8f0)",
        }}
      >
        {/* ── Búsqueda ── */}
        <form onSubmit={onSubmit} className="flex items-center flex-1 max-w-lg">
          <div
            className="flex items-center gap-1 shrink-0 h-9 px-2.5"
            style={{
              background:   "var(--color-cq-surface-2, #f1f5f9)",
              border:       "1px solid var(--color-cq-border, #e2e8f0)",
              borderRight:  "none",
              borderRadius: "6px 0 0 6px",
            }}
          >
            <select
              value={scope}
              onChange={e => setScope(e.target.value as Scope)}
              className="text-[12px] font-semibold bg-transparent outline-none cursor-pointer"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color:      "var(--color-cq-muted, #64748b)",
                appearance: "none",
                letterSpacing: "0.03em",
              }}
            >
              {SCOPES.map(s => (
                <option key={s.path} value={s.path}>{s.label}</option>
              ))}
            </select>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ color: "var(--color-cq-muted-2, #94a3b8)", pointerEvents: "none" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          <div
            className="relative flex-1 h-9"
            style={{
              border:       "1px solid var(--color-cq-border, #e2e8f0)",
              borderRadius: "0 6px 6px 0",
              background:   "var(--color-cq-surface-2, #f1f5f9)",
            }}
          >
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar en el panel…"
              className="w-full h-full pl-3 pr-9 bg-transparent outline-none text-[13px]"
              style={{
                fontFamily: "var(--font-body, sans-serif)",
                color:      "var(--color-cq-text, #0f172a)",
              }}
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-full px-2.5 flex items-center"
              style={{ color: "var(--color-cq-muted-2, #94a3b8)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
        </form>

        {/* ── Derecha ── */}
        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/"
            target="_blank"
            className="admin-topbar-link hidden sm:flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg"
            style={{ fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.03em" }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Ver tienda
          </Link>

          <div className="w-px h-5" style={{ background: "var(--color-cq-border, #e2e8f0)" }} />

          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-black select-none shrink-0"
            style={{
              background: "var(--color-cq-blue-600, #1D4ED8)",
              fontFamily: "var(--font-display, sans-serif)",
            }}
          >
            A
          </div>
        </div>
      </header>
    </>
  );
}