// app/(main)/checkout/confirmacion/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { PasoConfirmacion } from "@/features/checkout/components/pasos/PasoConfirmacion";

export const metadata: Metadata = {
  title: "Pedido confirmado — Craftqube",
};

export default function ConfirmacionPage() {
  return (
    <>
      <AnalyticsPage page="checkout_confirmation" />
      <PasoConfirmacion />
    </>
  );
}
