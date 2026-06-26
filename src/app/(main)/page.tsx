import { HeroSection } from "@/features/marketing/components/home/HeroSection";
import { CategoriesSection } from "@/features/marketing/components/home/CategoriesSection";
import { FeaturedProductsSection } from "@/features/marketing/components/home/FeaturedProductsSection";
import { WhyCraftqubeSection } from "@/features/marketing/components/home/WhyCraftqubeSection";
import { NewsletterSection } from "@/features/marketing/components/home/NewsletterSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <WhyCraftqubeSection />
      <NewsletterSection />
    </>
  );
}