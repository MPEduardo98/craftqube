import { AnalyticsPage } from "@mpeduardo98/commerce-core/analytics/Analytics";
import type { Metadata } from "next";
import { HeroSection } from "@/features/marketing/components/home/HeroSection";
import { CatalogoInicio } from "@/features/marketing/components/home/CatalogoInicio";
import { WhyCraftqubeSection } from "@/features/marketing/components/home/WhyCraftqubeSection";
import { NewsletterSection } from "@/features/marketing/components/home/NewsletterSection";

export const revalidate = 300;

// Sin canónica, Google veía la portada con y sin parámetros (?ref=…,
// www) como duplicados y elegía él solo cuál indexar.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <AnalyticsPage page="home" />
      <HeroSection />
      <CatalogoInicio />
      <WhyCraftqubeSection />
      <NewsletterSection />
    </>
  );
}
