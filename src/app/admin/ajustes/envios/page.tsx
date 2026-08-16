// app/admin/ajustes/envios/page.tsx
import { pool }                from "@/shared/lib/db/pool";
import type { RowDataPacket }  from "mysql2";
import { EnviosSettings, type ZonaForm, type CapsForm } from "@/features/admin/settings/components/EnviosSettings";

export const metadata = { title: "Envíos" };

async function fetchEnvioConfig(): Promise<{ caps: CapsForm; zonas: ZonaForm[] }> {
  const [cfgRows] = await pool.execute<RowDataPacket[]>(
    "SELECT clave, valor FROM configuracion WHERE clave IN ('envio_peso_max_kg','envio_volumen_max_m3','envio_dim_max_cm')"
  );
  const cfg = new Map(cfgRows.map((r) => [r.clave as string, r.valor as string]));

  const [zonas]   = await pool.execute<RowDataPacket[]>("SELECT id, nombre, activa FROM zonas_envio ORDER BY id ASC");
  const [estados] = await pool.execute<RowDataPacket[]>("SELECT zona_id, estado FROM zona_estados ORDER BY estado ASC");
  const [tarifas] = await pool.execute<RowDataPacket[]>(
    "SELECT zona_id, tipo_calculo, precio_base, precio_por_kg FROM tarifas_envio WHERE tipo_calculo IN ('por_guia','flete')"
  );

  return {
    caps: {
      peso_max_kg:    cfg.get("envio_peso_max_kg")    ?? "5",
      volumen_max_m3: cfg.get("envio_volumen_max_m3") ?? "0.0109",
      dim_max_cm:     cfg.get("envio_dim_max_cm")     ?? "27",
    },
    zonas: (zonas as RowDataPacket[]).map((z): ZonaForm => {
      const guia  = tarifas.find((t) => t.zona_id === z.id && t.tipo_calculo === "por_guia");
      const flete = tarifas.find((t) => t.zona_id === z.id && t.tipo_calculo === "flete");
      return {
        id:           z.id,
        nombre:       z.nombre,
        activa:       Boolean(z.activa),
        estados:      estados.filter((e) => e.zona_id === z.id).map((e) => e.estado as string),
        precio_guia:  guia  ? String(guia.precio_base)  : "",
        flete_base:   flete ? String(flete.precio_base) : "",
        flete_por_kg: flete ? String(flete.precio_por_kg ?? "") : "",
      };
    }),
  };
}

export default async function EnviosSettingsPage() {
  const { caps, zonas } = await fetchEnvioConfig();
  return <EnviosSettings initialCaps={caps} initialZonas={zonas} />;
}
