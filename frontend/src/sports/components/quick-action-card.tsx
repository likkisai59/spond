import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";

export interface QuickActionCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
}

export function QuickActionCard({
  label,
  description,
  icon: Icon,
  href,
  className,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="group block animate-fade-in-up">
      <Card
        interactive
        className={cn("flex items-center gap-4 p-4 sm:p-5", className)}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5 w-5 text-white" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold">{label}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {description}
          </span>
        </span>
      </Card>
    </Link>
  );
}
