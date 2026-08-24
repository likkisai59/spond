import { IndianRupee } from "lucide-react";
import { formatCurrency } from "@/utils/helpers";
import { cn } from "@/utils/cn";

export interface PriceBadgeProps {
  amount: number;
  suffix?: string;
  className?: string;
}

export function PriceBadge({ amount, suffix, className }: PriceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-brand-gradient-soft px-3 py-1 text-xs font-extrabold text-accent",
        className
      )}
    >
      <IndianRupee className="h-3 w-3" />
      {formatCurrency(amount).replace("₹", "")}
      {suffix ? (
        <span className="font-semibold text-muted-foreground">{suffix}</span>
      ) : null}
    </span>
  );
}
