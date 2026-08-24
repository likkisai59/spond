"use client";

import { memo } from "react";
import type { AttendanceTrendPoint } from "@/data";
import { cn } from "@/utils/cn";

export interface AttendanceChartProps {
  data: AttendanceTrendPoint[];
  className?: string;
}

export const AttendanceChart = memo(function AttendanceChart({
  data,
  className,
}: AttendanceChartProps) {
  const max = Math.max(...data.map((point) => point.going + point.maybe), 1);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex h-40 items-end gap-2 sm:gap-3">
        {data.map((point) => {
          const goingPct = (point.going / max) * 100;
          const maybePct = (point.maybe / max) * 100;
          return (
            <div
              key={point.label}
              className="flex h-full flex-1 flex-col justify-end"
              title={`${point.label}: ${point.going} going · ${point.maybe} maybe`}
            >
              <div className="flex h-full w-full flex-col justify-end">
                {maybePct > 0 ? (
                  <div
                    className="w-full rounded-t-md bg-amber-400/80 transition-all duration-500"
                    style={{ height: `${maybePct}%` }}
                  />
                ) : null}
                <div
                  className={cn(
                    "w-full bg-brand-gradient transition-all duration-500",
                    maybePct > 0 ? "" : "rounded-t-md"
                  )}
                  style={{ height: `${goingPct}%` }}
                />
              </div>
              <p className="mt-2 truncate text-center text-[10px] font-bold text-muted-foreground sm:text-[11px]">
                {point.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-gradient" />
          Going
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400/80" />
          Maybe
        </span>
      </div>
    </div>
  );
});
