import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";

export interface InfoCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
}

export function InfoCard({
  title,
  description,
  icon: Icon,
  children,
  className,
}: InfoCardProps) {
  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="flex items-start gap-4">
        {Icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft">
            <Icon className="h-5 w-5 text-accent" />
          </span>
        ) : null}
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-bold">{title}</h3>
          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  );
}
