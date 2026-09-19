import { cn } from "@/utils/cn";
import type { AttendanceResponse } from "@/types";

const DOT_COLORS: Record<string, string> = {
  Present: "bg-emerald-500",
  Absent: "bg-rose-500",
  Going: "bg-emerald-500",
  Maybe: "bg-zinc-400",
  "No response": "bg-rose-500",
};

const LABEL_COLORS: Record<string, string> = {
  Present: "text-emerald-600 dark:text-emerald-400",
  Absent: "text-rose-600 dark:text-rose-400",
  Going: "text-emerald-600 dark:text-emerald-400",
  Maybe: "text-zinc-600 dark:text-zinc-400",
  "No response": "text-rose-600 dark:text-rose-400",
};

export interface AttendanceBadgeProps {
  response: AttendanceResponse;
  className?: string;
}

export function AttendanceBadge({ response, className }: AttendanceBadgeProps) {
  const displayLabel = response === "Going" ? "Present" : response === "No response" ? "Absent" : response;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold",
        LABEL_COLORS[displayLabel] ?? "text-muted-foreground",
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", DOT_COLORS[displayLabel] ?? "bg-zinc-400")} />
      {displayLabel}
    </span>
  );
}
