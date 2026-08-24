"use client";

import { CalendarDays, CheckCircle2, CircleDot, XCircle } from "lucide-react";
import type { BookingStatus, BookingTimelineEntry } from "@/types";
import { formatDateTime } from "@/utils/date";
import { cn } from "@/utils/cn";

const STATUS_ICONS: Record<
  BookingStatus,
  typeof CheckCircle2
> = {
  Requested: CircleDot,
  Confirmed: CheckCircle2,
  Completed: CheckCircle2,
  Cancelled: XCircle,
};

export interface BookingTimelineProps {
  entries: BookingTimelineEntry[];
  className?: string;
}

export function BookingTimeline({ entries, className }: BookingTimelineProps) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {entries.map((entry, index) => {
        const Icon = STATUS_ICONS[entry.status];
        const isLast = index === entries.length - 1;
        const isCancelled = entry.status === "Cancelled";

        return (
          <li key={`${entry.status}-${entry.timestamp}`} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast ? (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-32px)] w-0.5 bg-border"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                isCancelled
                  ? "bg-destructive/15"
                  : index === entries.length - 1 && entry.status !== "Cancelled"
                    ? "bg-brand-gradient"
                    : "bg-brand-gradient-soft"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isCancelled
                    ? "text-destructive"
                    : index === entries.length - 1
                      ? "text-white"
                      : "text-accent"
                )}
              />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-extrabold tracking-tight">
                {entry.status}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {formatDateTime(entry.timestamp)}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {entry.note}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
