// app/(main)/checkout/contacto/page.tsx
import type { Metadata } from "next";
import { PasoContacto } from "@/features/checkout/components/pasos/PasoContacto";

export const metadata: Metadata = {
  title: "Contacto — Checkout · Craftqube",
};

export default function ContactoPage() {
  return <PasoContacto />;
}
