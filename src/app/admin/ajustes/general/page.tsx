// app/admin/ajustes/general/page.tsx
import { getStoreConfig }   from "@/shared/lib/config/store-config";
import { getUsdToMxnRate }  from "@/shared/lib/currency/store-currency";
import { GeneralSettings }  from "@/features/admin/settings/components/GeneralSettings";

export const metadata = { title: "General" };

export default async function GeneralSettingsPage() {
  const [config, usdMxn] = await Promise.all([getStoreConfig(), getUsdToMxnRate()]);

  return (
    <GeneralSettings
      monedaCaptura={config.monedaCaptura}
      monedaTienda={config.monedaTienda}
      usdMxn={usdMxn}
    />
  );
}
