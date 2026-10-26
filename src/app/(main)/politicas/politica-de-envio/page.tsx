// app/(main)/politica-de-envio/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { EnvioContent } from "@/features/legal/components/EnvioContent";

export const metadata: Metadata = {
  alternates: { canonical: "/politicas/politica-de-envio" },
  title: "Política de Envíos",
  description:
    "Conoce los términos de envío de CraftQube México: cobertura, tiempos de entrega, costos y condiciones para perfiles de aluminio y accesorios industriales.",
};

export default function PoliticaEnvioPage() {
  return (
    <>
      <AnalyticsPage page="policy_shipping" />
      <EnvioContent />
    </>
  );
}