// app/(main)/checkout/envio/page.tsx
import type { Metadata } from "next";
import { PasoEnvio } from "@/features/checkout/components/pasos/PasoEnvio";

export const metadata: Metadata = {
  title: "Envío — Checkout · Craftqube",
};

export default function EnvioPage() {
  return <PasoEnvio />;
}
