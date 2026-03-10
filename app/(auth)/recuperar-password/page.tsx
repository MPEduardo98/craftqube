// app/(auth)/recuperar-password/page.tsx
import type { Metadata } from "next";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña — Craftqube",
  description: "Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.",
};

export default function RecuperarPasswordPage() {
  return <ForgotPasswordForm />;
}