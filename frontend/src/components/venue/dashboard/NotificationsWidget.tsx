"use client";

import * as React from "react";
import { DashboardNotificationsWidget, NotificationItem } from "@/components/shared/dashboard/DashboardNotificationsWidget";

export interface NotificationsWidgetProps {
  notifications: NotificationItem[];
}

export function NotificationsWidget({ notifications }: NotificationsWidgetProps) {
  return (
    <DashboardNotificationsWidget
      title="System & Booking Alerts"
      notifications={notifications}
      showIcon={true}
    />
  );
}
