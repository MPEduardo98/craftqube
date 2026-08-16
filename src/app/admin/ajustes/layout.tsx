// app/admin/ajustes/layout.tsx
import { SettingsSidebar } from "@/features/admin/settings/components/SettingsSidebar";

export const metadata = { title: "Ajustes" };

export default function AjustesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-6 max-w-[1100px] mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Ajustes</h1>
      <p className="text-sm text-slate-400 mb-6">Configuración general de la tienda</p>

      <div className="flex gap-8 items-start">
        <SettingsSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
