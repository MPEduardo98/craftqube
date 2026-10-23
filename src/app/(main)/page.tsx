import { HeroSection } from "@/features/marketing/components/home/HeroSection";
import { CatalogoInicio } from "@/features/marketing/components/home/CatalogoInicio";
import { WhyCraftqubeSection } from "@/features/marketing/components/home/WhyCraftqubeSection";
import { NewsletterSection } from "@/features/marketing/components/home/NewsletterSection";

export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CatalogoInicio />
      <WhyCraftqubeSection />
      <NewsletterSection />
    </>
  );
}
