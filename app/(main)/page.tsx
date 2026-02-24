import { HeroSection } from "./components/HeroSection";
import { CategoriesSection } from "./components/CategoriesSection";
import { FeaturedProductsSection } from "./components/FeaturedProductsSection";
import { WhyCraftqubeSection } from "./components/WhyCraftqubeSection";
import { NewsletterSection } from "./components/NewsletterSection";

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