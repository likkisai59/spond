"use client";

import { memo } from "react";
import type { PaymentTrendPoint } from "@/data";
import { formatCurrency } from "@/utils/helpers";
import { cn } from "@/utils/cn";

export interface PaymentTrendChartProps {
  data: PaymentTrendPoint[];
  className?: string;
}

export const PaymentTrendChart = memo(function PaymentTrendChart({
  data,
  className,
}: PaymentTrendChartProps) {
  const max = Math.max(...data.map((point) => point.collected + point.pending), 1);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex h-40 items-end gap-2 sm:gap-4">
        {data.map((point) => {
          const collectedPct = (point.collected / max) * 100;
          const pendingPct = (point.pending / max) * 100;
          return (
            <div
              key={point.label}
              className="flex h-full flex-1 flex-col justify-end"
              title={`${point.label}: ${formatCurrency(point.collected)} collected · ${formatCurrency(point.pending)} pending`}
            >
              <div className="flex h-full w-full items-end justify-center gap-1">
                <div
                  className="w-full max-w-[18px] rounded-t-md bg-brand-gradient transition-all duration-500"
                  style={{ height: `${collectedPct}%` }}
                />
                <div
                  className="w-full max-w-[18px] rounded-t-md bg-muted-foreground/25 transition-all duration-500"
                  style={{ height: `${pendingPct}%` }}
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
          Collected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/25" />
          Pending
        </span>
      </div>
    </div>
  );
});
