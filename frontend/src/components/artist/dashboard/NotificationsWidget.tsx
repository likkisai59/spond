"use client";

import * as React from "react";
import { NotificationSummary } from "@/types/artist";
import { DashboardNotificationsWidget } from "@/components/shared/dashboard/DashboardNotificationsWidget";

export interface NotificationsWidgetProps {
  notifications: NotificationSummary[];
}

export function NotificationsWidget({ notifications }: NotificationsWidgetProps) {
  return (
    <DashboardNotificationsWidget
      title="Inbox Alert logs"
      notifications={notifications}
      showIcon={false}
    />
  );
}
