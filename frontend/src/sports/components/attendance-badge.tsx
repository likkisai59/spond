import { cn } from "@/utils/cn";
import type { AttendanceResponse } from "@/types";

const DOT_COLORS: Record<AttendanceResponse, string> = {
  Going: "bg-emerald-500",
  Maybe: "bg-amber-500",
  "No response": "bg-zinc-400",
};

const LABEL_COLORS: Record<AttendanceResponse, string> = {
  Going: "text-emerald-600",
  Maybe: "text-amber-600",
  "No response": "text-muted-foreground",
};

export interface AttendanceBadgeProps {
  response: AttendanceResponse;
  className?: string;
}

export function AttendanceBadge({ response, className }: AttendanceBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold",
        LABEL_COLORS[response],
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", DOT_COLORS[response])} />
      {response}
    </span>
  );
}
