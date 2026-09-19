"use client";

import * as React from "react";
import { ChartDataPoint } from "@/types/artist";
import { DashboardRevenueChart } from "@/components/shared/dashboard/DashboardRevenueChart";

export interface RevenueChartWidgetProps {
  data: ChartDataPoint[];
}

export function RevenueChartWidget({ data }: RevenueChartWidgetProps) {
  return (
    <DashboardRevenueChart
      title="Monthly revenue"
      data={data}
      showSummaryMetrics={false}
    />
  );
}
