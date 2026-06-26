"use client";
// app/admin/components/AdminSidebar.tsx
import Link            from "next/link";
import Image           from "next/image";
import { usePathname } from "next/navigation";
import { useState }    from "react";

interface NavItem {
  label:     string;
  href:      string;
  icon:      React.ReactNode;
  children?: { label: string; href: string }[];
}

function Icon({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>{d2 && <path d={d2}/>}
    </svg>
  );
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin",
    icon: <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" d2="M9 22V12h6v10" /> },
  { label: "Pedidos",   href: "/admin/pedidos",
    icon: <Icon d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" d2="M3 6h18M16 10a4 4 0 0 1-8 0" /> },
  { label: "Productos", href: "/admin/productos",
    icon: <Icon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />,
    children: [
      { label: "Todos los productos", href: "/admin/productos" },
      { label: "Crear producto",      href: "/admin/productos/crear" },
      { label: "Categorías",          href: "/admin/categorias" },
    ],
  },
  { label: "Clientes",  href: "/admin/clientes",
    icon: <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" d2="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /> },
  { label: "Cupones",   href: "/admin/cupones",
    icon: <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /> },
  { label: "Reportes",  href: "/admin/reportes",
    icon: <Icon d="M18 20V10M12 20V4M6 20v-6" /> },
  { label: "Ajustes",   href: "/admin/ajustes",
    icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /> },
];

export function AdminSidebar() {
  const pathname    = usePathname();
  const defaultOpen = NAV.find(n => n.children?.some(c => pathname.startsWith(c.href)))?.href ?? null;
  const [open, setOpen] = useState<string | null>(defaultOpen);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <style>{`
        .sbnav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px; border-radius: 0 8px 8px 0;
          font-size: 13px; font-weight: 500;
          font-family: var(--font-body, sans-serif);
          color: rgba(255,255,255,0.55);
          background: transparent;
          border-left: 2px solid transparent;
          transition: color .15s, background .15s;
          width: 100%; text-align: left; cursor: pointer;
          text-decoration: none;
        }
        .sbnav-item:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.07); }
        .sbnav-item.active { color: #fff; background: rgba(255,255,255,0.12); border-left-color: rgba(255,255,255,0.7); }
        .sbnav-sub {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 8px; border-radius: 6px;
          font-size: 12px;
          font-family: var(--font-body, sans-serif);
          color: rgba(255,255,255,0.45);
          background: transparent;
          transition: color .15s, background .15s;
          text-decoration: none; width: 100%;
        }
        .sbnav-sub:hover { color: rgba(255,255,255,0.75); }
        .sbnav-sub.active { color: #fff; font-weight: 600; background: rgba(255,255,255,0.1); }
      `}</style>

      <aside
        className="w-[215px] h-full flex flex-col shrink-0 overflow-y-auto relative"
        style={{ background: "var(--color-cq-blue-900, #1238a0)", borderRight: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        {/* Logo */}
        <div className="relative z-10 h-14 flex items-center gap-2.5 px-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Image src="/Logo.png" alt="CraftQube" width={120} height={28} priority
            style={{ height: "auto", filter: "brightness(10)" }} />
          <span className="ml-auto text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
            style={{ fontFamily: "var(--font-mono, monospace)", background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 py-3 px-2 space-y-0.5">
          {NAV.map((item) => {
            const active   = isActive(item.href);
            const hasKids  = !!item.children?.length;
            const expanded = open === item.href;

            return (
              <div key={item.href}>
                {hasKids ? (
                  <button
                    onClick={() => setOpen(expanded ? null : item.href)}
                    className={`sbnav-item${active ? " active" : ""}`}
                  >
                    <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ opacity: 0.5, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                ) : (
                  <Link href={item.href} className={`sbnav-item${active ? " active" : ""}`}>
                    <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                )}

                {hasKids && expanded && (
                  <div className="mt-0.5 ml-[37px] space-y-0.5"
                    style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "10px" }}>
                    {item.children!.map((child) => {
                      const ca = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link key={child.href} href={child.href} className={`sbnav-sub${ca ? " active" : ""}`}>
                          {ca && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.7)" }} />}
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative z-10 px-4 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] tracking-widest uppercase"
            style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(255,255,255,0.2)" }}>
            v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}