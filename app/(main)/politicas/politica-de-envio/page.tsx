// app/(main)/politica-de-envio/page.tsx
import type { Metadata } from "next";
import { EnvioContent } from "./components/EnvioContent";

export const metadata: Metadata = {
  title: "Política de Envíos — CraftQube",
  description:
    "Conoce los términos de envío de CraftQube México: cobertura, tiempos de entrega, costos y condiciones para perfiles de aluminio y accesorios industriales.",
};

export default function PoliticaEnvioPage() {
  return <EnvioContent />;
}