"use client";

import * as React from "react";
import { ChartDataPoint } from "@/types/artist";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format-currency";
import { TrendingUp } from "lucide-react";

interface RevenueChartWidgetProps {
  data: ChartDataPoint[];
}

export function RevenueChartWidget({ data }: RevenueChartWidgetProps) {
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);

  // Guard: empty data array — avoid Math.max(...[]) = -Infinity
  const hasData = data && data.length > 0;
  // Use only the last 6 months for the chart if we have more
  const chartData = hasData ? data.slice(-6) : [];
  const maxRevenue = hasData ? Math.max(...chartData.map(d => d.revenue), 1) : 1;

  return (
    <Card className="bg-card/45 backdrop-blur-md border border-border shadow-xl h-full rounded-3xl">
      <CardHeader className="pb-4 flex flex-row items-start justify-between">
        <div className="space-y-1.5">
          <CardTitle className="text-sm font-bold text-foreground">
            Monthly revenue
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-foreground">
              {formatCurrency(chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Earnings this month</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="p-2 bg-primary rounded-full text-primary-foreground shadow-sm">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-[11px] text-muted-foreground pt-4">
            Last 6 months
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {!hasData ? (
          <div className="h-48 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-2xl">📊</span>
            <p className="text-sm font-semibold text-muted-foreground">No revenue data yet</p>
          </div>
        ) : (
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 relative pt-4">
            {chartData.map((item, idx) => {
              const percentage = Math.max((item.revenue / maxRevenue) * 100, 5); // at least 5% so it's visible
              const isActive = activeIdx === idx;

              return (
                <div 
                  key={item.month} 
                  className="flex-1 flex flex-col items-center justify-end h-full gap-3 group cursor-pointer relative"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(null)}
                >
                  {/* Tooltip on hover */}
                  {isActive && (
                    <div className="absolute -top-10 bg-accent text-foreground border border-border text-[10px] font-bold py-1.5 px-2.5 rounded-lg shadow-xl z-10 whitespace-nowrap">
                      <p>{formatCurrency(item.revenue)}</p>
                    </div>
                  )}

                  {/* Solid thick bar */}
                  <div 
                    className="w-full max-w-[48px] relative rounded-t-xl bg-primary transition-all duration-500 ease-out hover:opacity-80" 
                    style={{ height: `${percentage}%` }} 
                  />

                  {/* Label */}
                  <span className="text-[12px] font-medium text-muted-foreground">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
