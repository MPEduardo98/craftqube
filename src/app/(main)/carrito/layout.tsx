import { redirect } from "next/navigation";
import { getVentaPublica } from "@mpeduardo98/commerce-core/venta";

export default async function CarritoLayout({ children }: { children: React.ReactNode }) {
  if (!(await getVentaPublica()).ventaEnLinea) redirect("/");
  return children;
}
