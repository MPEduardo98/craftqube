// app/(main)/faq/page.tsx
import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { FAQHero } from "@/features/marketing/components/faq/FAQHero";
import { FAQAccordion } from "@/features/marketing/components/faq/FAQAccordion";

export const metadata: Metadata = {
  alternates: { canonical: "/about/faq" },
  title: "Preguntas Frecuentes",
  description:
    "Resolvemos tus dudas sobre productos, envíos, pagos y servicios de CraftQube México. Perfiles de aluminio y accesorios industriales.",
};

export default function FAQPage() {
  return (
    <>
      <AnalyticsPage page="faq" />
      <FAQHero />
      <FAQAccordion />
    </>
  );
}