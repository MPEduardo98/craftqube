// app/(main)/cuenta/layout.tsx
import { Metadata } from "next";
import { AccountLayout } from "./components/AccountLayout";

export const metadata: Metadata = {
  title: "Mi Cuenta — Craftqube",
  description: "Gestiona tu perfil, pedidos, favoritos y direcciones de envío",
};

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return <AccountLayout>{children}</AccountLayout>;
}