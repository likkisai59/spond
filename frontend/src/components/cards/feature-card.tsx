import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  ctaLabel?: string;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  ctaLabel = "Enter",
  className,
}: FeatureCardProps) {
  const content = (
    <Card interactive className={cn("flex h-full flex-col p-6 sm:p-7", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient shadow-sm">
        <Icon className="h-6 w-6 text-white" />
      </span>
      <h3 className="mt-5 text-xl font-extrabold tracking-tight">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {href ? (
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-accent">
          {ctaLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      ) : null}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="group block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
