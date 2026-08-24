import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card } from "@/components/shared/card";
import { cn } from "@/utils/cn";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-extrabold tracking-tight lg:text-3xl">
            {value}
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft">
          <Icon className="h-5 w-5 text-accent" />
        </span>
      </div>
      {trend ? (
        <p className="mt-3 flex items-center gap-1 text-xs font-semibold">
          {trend.direction === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
          <span
            className={
              trend.direction === "up"
                ? "text-emerald-600"
                : "text-destructive"
            }
          >
            {trend.value}
          </span>
          <span className="font-medium text-muted-foreground">vs last period</span>
        </p>
      ) : null}
    </Card>
  );
}
