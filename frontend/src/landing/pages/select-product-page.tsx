import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CONFIGS, ROUTES } from "@/constants";
import { ProductCard } from "../components/product-card";

const sportsFeatures = [
  "Manage teams",
  "Events",
  "Polls",
  "Messaging",
  "Payments",
] as const;

const bandFeatures = [
  "Artists",
  "Bands",
  "Venues",
  "Bookings",
  "Reviews",
] as const;

export function SelectProductPage() {
  return (
    <PageContainer as="main" className="max-w-6xl py-12 lg:py-16">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Select product" },
        ]}
        className="mb-6"
      />

      <div className="animate-fade-in-up text-center">
        <Badge
          variant="gradient"
          className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
        >
          Choose your experience
        </Badge>
      </div>

      <PageHeader
        title="Choose Your Experience"
        description="Pick the workspace you want to enter. Your single account unlocks both products."
        className="mt-4 animate-fade-in-up [animation-delay:100ms]"
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
        <ProductCard
          product={PRODUCT_CONFIGS.sports}
          features={sportsFeatures}
          ctaLabel="Enter Sports"
          className="[animation-delay:200ms]"
        />
        <ProductCard
          product={PRODUCT_CONFIGS.band}
          features={bandFeatures}
          ctaLabel="Enter BandConnect"
          className="[animation-delay:300ms]"
        />
      </div>

      <p className="mt-10 animate-fade-in-up text-center text-sm text-muted-foreground [animation-delay:400ms]">
        You can switch between products at any time from your account menu.
      </p>
    </PageContainer>
  );
}
