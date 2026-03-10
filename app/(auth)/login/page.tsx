// app/(auth)/login/page.tsx
import type { Metadata } from "next";
import { LoginForm } from "./components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión — Craftqube",
  description: "Accede a tu cuenta Craftqube para gestionar pedidos y más.",
};

export default function LoginPage() {
  return <LoginForm />;
}