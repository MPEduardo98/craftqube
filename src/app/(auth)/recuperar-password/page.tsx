// app/(auth)/recuperar-password/page.tsx
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { redirectIfAuthenticated } from "@/features/auth/lib/getSessionUser";

export const metadata: Metadata = {
  title: "Recuperar contraseña — Craftqube",
  description: "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.",
};

export default async function RecuperarPasswordPage() {
  await redirectIfAuthenticated();
  return <ForgotPasswordForm />;
}