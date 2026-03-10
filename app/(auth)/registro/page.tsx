// app/(auth)/registro/page.tsx
import type { Metadata } from "next";
import { RegisterForm } from "./components/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta — Craftqube",
  description: "Regístrate en Craftqube para gestionar pedidos, guardar direcciones y más.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}