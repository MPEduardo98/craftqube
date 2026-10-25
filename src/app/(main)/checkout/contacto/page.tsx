// app/(main)/checkout/contacto/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { PasoContacto } from "@/features/checkout/components/pasos/PasoContacto";

export const metadata: Metadata = {
  title: "Contacto — Checkout · Craftqube",
};

export default function ContactoPage() {
  return (
    <>
      <AnalyticsPage page="checkout_contact" checkout />
      <PasoContacto />
    </>
  );
}
