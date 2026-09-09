import { PageContainer } from "@/components/layout";
import { PRODUCT_CONFIGS } from "@/constants";
import { ProductCard } from "./product-card";
import { SectionHeading } from "./section-heading";

const productFeatures = {
  sports: [
    "Teams & rosters",
    "Events & scheduling",
    "Polls & messaging",
    "Payments & invoicing",
  ],
  band: [
    "Secure provider bookings",
    "Milestone payments (25/75)",
    "Customer & provider dashboards",
    "Real-time schedule management",
  ],
} as const;

export function ProductShowcase() {
  return (
    <section id="products" className="scroll-mt-24 border-t border-border/70 bg-card/60">
      <PageContainer className="py-16 lg:py-24">
        <SectionHeading
          eyebrow="Two products"
          title="One platform, two worlds"
          description="Pick the workspace that matches your passion — both are powered by the same secure, unified account."
          className="animate-fade-in-up"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
          <ProductCard
            product={PRODUCT_CONFIGS.sports}
            features={productFeatures.sports}
            ctaLabel="Enter Sports"
            className="[animation-delay:100ms]"
          />
          <ProductCard
            product={PRODUCT_CONFIGS.band}
            features={productFeatures.band}
            ctaLabel="Enter Marketplace"
            className="[animation-delay:200ms]"
          />        </div>
      </PageContainer>
    </section>
  );
}
