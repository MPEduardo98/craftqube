// app/(main)/politica-de-privacidad/page.tsx
import type { Metadata } from "next";
import { PrivacidadContent } from "./components/PrivacidadContent";

export const metadata: Metadata = {
  title: "Política de Privacidad — CraftQube",
  description:
    "Conoce cómo CraftQube México recopila, usa y protege tus datos personales conforme a la LFPDPPP.",
};

export default function PoliticaPrivacidadPage() {
  return <PrivacidadContent />;
}