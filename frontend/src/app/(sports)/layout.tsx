import type { Metadata } from "next";
import { SportsDashboardLayout } from "@/sports/layout/sports-dashboard-layout";

export const metadata: Metadata = {
  title: "Sports",
};

import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

export default function SportsRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["user", "admin"]}>
      <SportsDashboardLayout>{children}</SportsDashboardLayout>
    </ProtectedRoute>
  );
}
