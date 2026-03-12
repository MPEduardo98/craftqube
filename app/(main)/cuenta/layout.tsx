// app/(main)/cuenta/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Cuenta — Craftqube",
  description: "Gestiona tu perfil, pedidos, favoritos y direcciones de envío",
};

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}