// app/nosotros/page.tsx
import type { Metadata } from "next";
import { NosotrosHero }        from "./components/NosotrosHero";
import { NosotrosIntro }       from "./components/NosotrosIntro";
import { NosotrosMisionVision } from "./components/NosotrosMisionVision";
import { NosotrosValores }     from "./components/NosotrosValores";
import { NosotrosCTA }         from "./components/NosotrosCTA";

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