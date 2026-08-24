import type { AvailabilityStatus } from "@/types";
import { cn } from "@/utils/cn";

const AVAILABILITY_CLASSES: Record<AvailabilityStatus, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  Limited: "bg-amber-100 text-amber-700",
  Booked: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  className?: string;
}

export function AvailabilityBadge({ status, className }: AvailabilityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
        AVAILABILITY_CLASSES[status],
        className
      )}
    >
      {status}
    </span>
  );
}
