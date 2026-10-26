import { redirect } from "next/navigation";
import { getVentaPublica } from "@mpeduardo98/commerce-core/venta";
import type { Metadata } from "next";

// El carrito cambia por visitante: no tiene nada que indexar.
export const metadata: Metadata = {
  title:  "Carrito",
  robots: { index: false, follow: true },
};

export default async function CarritoLayout({ children }: { children: React.ReactNode }) {
  if (!(await getVentaPublica()).ventaEnLinea) redirect("/");
  return children;
}
