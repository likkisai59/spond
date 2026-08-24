import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";

export interface EmptyCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyCard({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center border-dashed p-8 text-center sm:p-12",
        className
      )}
    >
      {Icon ? (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient-soft">
          <Icon className="h-7 w-7 text-accent" />
        </span>
      ) : null}
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
