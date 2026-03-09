// app/(main)/politica-de-reembolso/page.tsx
import type { Metadata } from "next";
import { ReembolsoContent } from "./components/ReembolsoContent";

export const metadata: Metadata = {
  title: "Política de Reembolso — CraftQube",
  description:
    "Consulta la política de devoluciones y reembolsos de CraftQube México. Conoce los casos en que aplica, requisitos y procedimiento.",
};

export default function PoliticaReembolsoPage() {
  return <ReembolsoContent />;
}