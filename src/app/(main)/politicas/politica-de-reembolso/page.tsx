// app/(main)/politica-de-reembolso/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { ReembolsoContent } from "@/features/legal/components/ReembolsoContent";

export const metadata: Metadata = {
  alternates: { canonical: "/politicas/politica-de-reembolso" },
  title: "Política de Reembolso",
  description:
    "Consulta la política de devoluciones y reembolsos de CraftQube México. Conoce los casos en que aplica, requisitos y procedimiento.",
};

export default function PoliticaReembolsoPage() {
  return (
    <>
      <AnalyticsPage page="policy_refund" />
      <ReembolsoContent />
    </>
  );
}