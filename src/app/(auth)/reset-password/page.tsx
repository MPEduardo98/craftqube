// app/(auth)/reset-password/page.tsx
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { redirectIfAuthenticated } from "@/features/auth/lib/getSessionUser";

export const metadata: Metadata = {
  title: "Nueva contraseña — Craftqube",
  description: "Establece una nueva contraseña para tu cuenta.",
};

export default async function ResetPasswordPage() {
  await redirectIfAuthenticated();
  return <ResetPasswordForm />;
}