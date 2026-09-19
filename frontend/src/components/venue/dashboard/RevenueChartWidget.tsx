"use client";

import * as React from "react";
import { DashboardRevenueChart, RevenueChartPoint } from "@/components/shared/dashboard/DashboardRevenueChart";

export interface RevenueChartWidgetProps {
  data: RevenueChartPoint[];
}

export function RevenueChartWidget({ data }: RevenueChartWidgetProps) {
  return (
    <DashboardRevenueChart
      title="Monthly Revenue Performance"
      data={data}
      showSummaryMetrics={true}
    />
  );
}
