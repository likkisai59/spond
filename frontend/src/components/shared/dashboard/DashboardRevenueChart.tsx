"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format-currency";

export interface RevenueChartPoint {
  month: string;
  revenue: number;
  bookings?: number;
}

export interface DashboardRevenueChartProps {
  title?: string;
  data: RevenueChartPoint[];
  showSummaryMetrics?: boolean;
}

export function DashboardRevenueChart({
  title = "Monthly Revenue Performance",
  data = [],
  showSummaryMetrics = false
}: DashboardRevenueChartProps) {
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);

  const hasData = data && data.length > 0;
  const chartData = hasData ? data.slice(-6) : [];
  const maxRevenue = hasData ? Math.max(...chartData.map(d => d.revenue), 1) : 1;

  return (
    <Card className="bg-card/45 backdrop-blur-md border border-border shadow-xl h-full">
      <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
          {title}
        </CardTitle>
        <span className="text-[10px] text-muted-foreground bg-accent border border-border px-2 py-0.5 rounded-full">
          Last 6 Months
        </span>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {!hasData ? (
          <div className="h-56 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-2xl">📊</span>
            <p className="text-sm font-semibold text-muted-foreground">No revenue data yet</p>
          </div>
        ) : (
          <div className="h-56 flex items-end gap-3 sm:gap-6 pt-6 px-2 relative border-b border-border">
            {/* Grid lines helper */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="w-full border-t border-border" />
              <div className="w-full border-t border-border" />
              <div className="w-full border-t border-border" />
              <div className="w-full border-t border-border" />
            </div>

            {chartData.map((item, idx) => {
              const percentage = Math.max((item.revenue / maxRevenue) * 100, 5);
              const isActive = activeIdx === idx;

              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(null)}
                >
                  {/* Tooltip on hover */}
                  {isActive && (
                    <div className="absolute -top-12 bg-accent text-foreground border border-border text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg z-10 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-border min-w-[100px] text-center">
                      <p className="truncate">{formatCurrency(item.revenue)}</p>
                      {item.bookings !== undefined && (
                        <p className="text-[8px] text-muted-foreground">{item.bookings} slots booked</p>
                      )}
                    </div>
                  )}

                  {/* Animated Bar */}
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-accent/40 border border-border h-44 flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-primary/70 to-primary transition-all duration-500 ease-out group-hover:from-primary group-hover:to-primary-light"
                      style={{ height: `${percentage}%` }}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[10px] font-bold transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Optional Summary Metrics (Peak Month & Average) */}
        {showSummaryMetrics && hasData && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-accent/20 border border-border rounded-xl space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Peak Month
              </span>
              <span className="text-sm font-extrabold text-foreground block">
                {chartData.find(d => d.revenue === maxRevenue)?.month || "N/A"}
              </span>
            </div>
            <div className="p-3 bg-accent/20 border border-border rounded-xl space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Avg Revenue
              </span>
              <span className="text-sm font-extrabold text-foreground block">
                {formatCurrency(chartData.reduce((acc, d) => acc + d.revenue, 0) / chartData.length)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
