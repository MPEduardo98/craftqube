// app/(main)/nosotros/page.tsx
import type { Metadata } from "next";
import { NosotrosHero }         from "@/features/marketing/components/nosotros/NosotrosHero";
import { NosotrosIntro }        from "@/features/marketing/components/nosotros/NosotrosIntro";
import { NosotrosMisionVision } from "@/features/marketing/components/nosotros/NosotrosMisionVision";
import { NosotrosValores }      from "@/features/marketing/components/nosotros/NosotrosValores";
import { NosotrosCTA }          from "@/features/marketing/components/nosotros/NosotrosCTA";

export const metadata: Metadata = {
  title: "Nosotros — CraftQube",
  description:
    "Conoce a CraftQube: la primera tienda en línea en México para perfiles de aluminio y componentes modulares. Misión, visión y valores.",
};

export default function NosotrosPage() {
  return (
    <>
      <NosotrosHero />
      <NosotrosIntro />
      <NosotrosMisionVision />
      <NosotrosValores />
      <NosotrosCTA />
    </>
  );
}