// app/(auth)/reset-password/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { redirectIfAuthenticated } from "@/features/auth/lib/getSessionUser";

export const metadata: Metadata = {
  title: "Nueva contraseña — Craftqube",
  description: "Establece una nueva contraseña para tu cuenta.",
};

export default async function ResetPasswordPage() {
  await redirectIfAuthenticated();
  // ResetPasswordForm usa useSearchParams() → requiere Suspense boundary.
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}