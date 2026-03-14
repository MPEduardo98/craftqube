"use client";
// app/(admin)/components/AdminSidebar.tsx
// ─────────────────────────────────────────────────────────────
// Sidebar de navegación del panel de administración.
// Client Component para poder resaltar la ruta activa.
// ─────────────────────────────────────────────────────────────
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label:    string;
  href:     string;
  icon:     React.ReactNode;
  children?: { label: string; href: string }[];
}

function IconHome()    { return <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>; }
function IconBox()     { return <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"/></svg>; }
function IconShop()    { return <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C4.149 11.15 4 11.618 4 12c0 1.104.896 2 2 2h12a1 1 0 100-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 4H6.28l-.31-1.243A1 1 0 005 2H3z"/><path fillRule="evenodd" d="M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd"/></svg>; }
function IconTag()     { return <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>; }
function IconUsers()   { return <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>; }
function IconChart()   { return <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>; }
function IconSettings(){ return <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>; }

const NAV: NavItem[] = [
  { label: "Inicio",    href: "/admin",           icon: <IconHome /> },
  { label: "Pedidos",   href: "/admin/pedidos",    icon: <IconShop /> },
  {
    label: "Productos",
    href:  "/admin/productos",
    icon:  <IconBox />,
    children: [
      { label: "Todos los productos", href: "/admin/productos" },
      { label: "Crear producto",      href: "/admin/productos/crear" },
      { label: "Categorías",          href: "/admin/categorias" },
    ],
  },
  { label: "Clientes",  href: "/admin/clientes",   icon: <IconUsers /> },
  { label: "Cupones",   href: "/admin/cupones",     icon: <IconTag /> },
  { label: "Reportes",  href: "/admin/reportes",    icon: <IconChart /> },
  { label: "Ajustes",   href: "/admin/ajustes",     icon: <IconSettings /> },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);

  return (
    <aside className="w-56 h-full flex flex-col shrink-0 bg-[#0f172a] text-slate-300 overflow-y-auto">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-white/10 shrink-0">
        <span className="text-white font-bold text-base tracking-tight" style={{ fontFamily: "var(--font-barlow, sans-serif)" }}>
          CraftQube
        </span>
        <span className="ml-2 text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-medium">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <span className={active ? "text-indigo-400" : "text-slate-500"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>

              {/* Sub-items */}
              {item.children && active && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block py-1.5 text-[13px] transition-colors ${
                        pathname === child.href
                          ? "text-white font-medium"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <p className="text-[11px] text-slate-600">v1.0.0</p>
      </div>
    </aside>
  );
}