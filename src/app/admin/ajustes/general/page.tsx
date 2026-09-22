// app/admin/ajustes/general/page.tsx
import { getStoreConfig }   from "@/shared/lib/config/store-config";
import { getUsdToMxnRate }  from "@/shared/lib/currency/store-currency";
import { GeneralSettings }  from "@/features/admin/settings/components/GeneralSettings";

export const metadata = { title: "General" };

export default async function GeneralSettingsPage() {
  const [config, usdMxn] = await Promise.all([getStoreConfig(), getUsdToMxnRate()]);

  return (
    <GeneralSettings
      nombre={config.nombre}
      descripcion={config.descripcion}
      logoUrl={config.logoUrl}
      email={config.email}
      telefono={config.telefono}
      colorPrimario={config.colorPrimario}
      colorAcento={config.colorAcento}
      monedaCaptura={config.monedaCaptura}
      monedaTienda={config.monedaTienda}
      usdMxn={usdMxn}
    />
  );
}
