// app/(auth)/login/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { redirectIfAuthenticated } from "@/features/auth/lib/getSessionUser";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta Craftqube para gestionar pedidos y más.",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  // LoginForm usa useSearchParams() → requiere Suspense boundary,
  // de lo contrario el build de producción falla al prerenderizar.
  return (
    <Suspense fallback={null}>
      <AnalyticsPage page="login" />
      <LoginForm />
    </Suspense>
  );
}