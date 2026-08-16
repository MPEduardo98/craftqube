// app/(auth)/login/page.tsx
import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { redirectIfAuthenticated } from "@/features/auth/lib/getSessionUser";

export const metadata: Metadata = {
  title: "Iniciar sesión — Craftqube",
  description: "Accede a tu cuenta Craftqube para gestionar pedidos y más.",
};

export default async function LoginPage() {
  await redirectIfAuthenticated();
  return <LoginForm />;
}