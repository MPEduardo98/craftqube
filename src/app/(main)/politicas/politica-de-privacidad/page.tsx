// app/(main)/politica-de-privacidad/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { PrivacidadContent } from "@/features/legal/components/PrivacidadContent";

export const metadata: Metadata = {
  title: "Política de Privacidad — CraftQube",
  description:
    "Conoce cómo CraftQube México recopila, usa y protege tus datos personales conforme a la LFPDPPP.",
};

export default function PoliticaPrivacidadPage() {
  return (
    <>
      <AnalyticsPage page="policy_privacy" />
      <PrivacidadContent />
    </>
  );
}