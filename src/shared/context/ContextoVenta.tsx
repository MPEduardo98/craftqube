"use client";

import { createContext, useContext } from "react";
import type { VentaPublica } from "@mpeduardo98/commerce-core/venta/types";

type ConfiguracionVenta = VentaPublica & { telefono: string; email: string; sitioUrl: string };
const ContextoVenta = createContext<ConfiguracionVenta | null>(null);

export function ProveedorVenta({ venta, children }: { venta: ConfiguracionVenta; children: React.ReactNode }) {
  return <ContextoVenta.Provider value={venta}>{children}</ContextoVenta.Provider>;
}

export function useVenta() {
  const venta = useContext(ContextoVenta);
  if (!venta) throw new Error("Falta ProveedorVenta");
  return venta;
}
