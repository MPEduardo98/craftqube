// app/(main)/checkout/pago/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { PasoPago } from "@/features/checkout/components/pasos/PasoPago";

export const metadata: Metadata = {
  title: "Pago — Checkout · Craftqube",
};

export default function PagoPage() {
  return (
    <>
      <AnalyticsPage page="checkout_payment" />
      <PasoPago />
    </>
  );
}
