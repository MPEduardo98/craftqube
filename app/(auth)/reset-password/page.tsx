// app/(auth)/reset-password/page.tsx
import type { Metadata } from "next";
import { ResetPasswordForm } from "./components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Nueva contraseña — Craftqube",
  description: "Establece una nueva contraseña para tu cuenta.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}