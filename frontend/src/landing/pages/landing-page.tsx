import { CtaSection } from "../components/cta-section";
import { FeaturesSection } from "../components/features-section";
import { HeroSection } from "../components/hero-section";
import { HowItWorks } from "../components/how-it-works";
import { ProductShowcase } from "../components/product-showcase";
import { TestimonialsSection } from "../components/testimonials-section";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProductShowcase />
      <FeaturesSection />
      <HowItWorks />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
