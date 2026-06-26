// app/(main)/faq/page.tsx
import type { Metadata } from "next";
import { FAQHero } from "@/features/marketing/components/faq/FAQHero";
import { FAQAccordion } from "@/features/marketing/components/faq/FAQAccordion";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes — CraftQube",
  description:
    "Resolvemos tus dudas sobre productos, envíos, pagos y servicios de CraftQube México. Perfiles de aluminio y accesorios industriales.",
};

export default function FAQPage() {
  return (
    <>
      <FAQHero />
      <FAQAccordion />
    </>
  );
}