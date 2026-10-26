// app/(auth)/registro/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { redirectIfAuthenticated } from "@/features/auth/lib/getSessionUser";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate en Craftqube para gestionar pedidos, guardar direcciones y más.",
};

export default async function RegisterPage() {
  await redirectIfAuthenticated();
  return (
    <>
      <AnalyticsPage page="register" />
      <RegisterForm />
    </>
  );
}