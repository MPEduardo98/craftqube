"use client";
// features/admin/settings/components/SettingsSidebar.tsx
import Link            from "next/link";
import { usePathname } from "next/navigation";

interface Tab {
  label:    string;
  href:     string;
  desc:     string;
  disabled?: boolean;
}

const TABS: Tab[] = [
  { label: "General",       href: "/admin/ajustes/general", desc: "Moneda y datos de la tienda" },
  { label: "Envíos",        href: "/admin/ajustes/envios",  desc: "Zonas, guías y flete" },
  { label: "Pagos",         href: "/admin/ajustes/pagos",   desc: "Próximamente", disabled: true },
  { label: "Notificaciones", href: "/admin/ajustes/notificaciones", desc: "Próximamente", disabled: true },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[230px] shrink-0">
      <nav className="flex flex-col gap-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/");

          if (tab.disabled) {
            return (
              <div
                key={tab.href}
                className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg cursor-not-allowed opacity-50 select-none"
                style={{ border: "1px solid transparent" }}
                title="Próximamente"
              >
                <span className="text-sm font-medium text-slate-500">{tab.label}</span>
                <span className="text-xs text-slate-400">{tab.desc}</span>
              </div>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg transition-colors"
              style={{
                border:     active ? "1px solid var(--color-cq-blue-900, #1238a0)" : "1px solid transparent",
                background: active ? "rgba(18,56,160,0.06)" : "transparent",
              }}
            >
              <span className={`text-sm font-semibold ${active ? "text-[#1238a0]" : "text-slate-700"}`}>
                {tab.label}
              </span>
              <span className="text-xs text-slate-400">{tab.desc}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
