// app/(main)/checkout/envio/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { PasoEnvio } from "@/features/checkout/components/pasos/PasoEnvio";

export const metadata: Metadata = {
  title: "Envío — Checkout · Craftqube",
};

export default function EnvioPage() {
  return (
    <>
      <AnalyticsPage page="checkout_shipping" />
      <PasoEnvio />
    </>
  );
}
