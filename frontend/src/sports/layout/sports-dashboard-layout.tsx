"use client";

import { DashboardLayout } from "@/layouts";
import { SportsLogoutButton } from "./logout-button";

export interface SportsDashboardLayoutProps {
  children: React.ReactNode;
}

export function SportsDashboardLayout({ children }: SportsDashboardLayoutProps) {
  return (
    <DashboardLayout product="sports" sidebarFooter={<SportsLogoutButton />}>
      {children}
    </DashboardLayout>
  );
}
