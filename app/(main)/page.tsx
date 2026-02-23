import { HeroSection } from "./components/HeroSection";
import { CategoriesSection } from "./components/CategoriesSection";
import { FeaturedProductsSection } from "./components/FeaturedProductsSection";
import { WhyCraftqubeSection } from "./components/WhyCraftqubeSection";
import { AutomationSection } from "./components/AutomationSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { NewsletterSection } from "./components/NewsletterSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <WhyCraftqubeSection />
      <AutomationSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}