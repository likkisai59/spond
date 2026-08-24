import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/shared/card";
import { Button } from "@/components/ui/button";
import type { ProductConfig } from "@/types";
import { cn } from "@/utils/cn";

export interface ProductCardProps {
  product: ProductConfig;
  features: readonly string[];
  ctaLabel: string;
  className?: string;
}

function ProductIllustration({ product }: { product: ProductConfig }) {
  return (
    <div
      className="relative flex h-44 items-center justify-center overflow-hidden bg-brand-gradient-soft sm:h-52"
      aria-hidden="true"
    >
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/40 blur-2xl" />
      <div className="absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-white/30 blur-2xl" />

      <span className="absolute left-6 top-6 flex h-12 w-12 rotate-[-8deg] items-center justify-center rounded-xl bg-card shadow-card transition-transform duration-300 group-hover:rotate-0">
        <product.icon className="h-6 w-6 text-accent" />
      </span>
      <span className="absolute bottom-8 right-8 flex h-10 w-10 rotate-[10deg] items-center justify-center rounded-lg bg-card shadow-card transition-transform duration-300 group-hover:rotate-0">
        <Check className="h-5 w-5 text-primary" />
      </span>

      <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-card shadow-elevated transition-transform duration-300 group-hover:scale-110 sm:h-28 sm:w-28">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient sm:h-[4.5rem] sm:w-[4.5rem]">
          <product.icon className="h-8 w-8 text-white sm:h-9 sm:w-9" />
        </span>
      </span>
    </div>
  );
}

export function ProductCard({
  product,
  features,
  ctaLabel,
  className,
}: ProductCardProps) {
  return (
    <Card
      interactive
      className={cn(
        "group flex h-full flex-col overflow-hidden p-0 animate-fade-in-up",
        className
      )}
    >
      <ProductIllustration product={product} />

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">
          {product.tagline}
        </p>
        <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
          {product.name}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <ul className="mt-6 grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm font-medium">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gradient-soft">
                <Check className="h-3 w-3 text-accent" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <Button asChild variant="accent" size="lg" className="mt-8 w-full">
          <Link href={product.href}>{ctaLabel}</Link>
        </Button>
      </div>
    </Card>
  );
}
