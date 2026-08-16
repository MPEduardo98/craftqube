// app/(auth)/registro/page.tsx
import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { redirectIfAuthenticated } from "@/features/auth/lib/getSessionUser";

export const metadata: Metadata = {
  title: "Crear cuenta — Craftqube",
  description: "Regístrate en Craftqube para gestionar pedidos, guardar direcciones y más.",
};

export default async function RegisterPage() {
  await redirectIfAuthenticated();
  return <RegisterForm />;
}