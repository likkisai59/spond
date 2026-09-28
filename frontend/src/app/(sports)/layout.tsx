import type { Metadata } from "next";
import { Suspense } from "react";
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
  <Suspense fallback={null}>
    <ProtectedRoute allowedRoles={["user", "admin", "member", "sports_venue_owner"]}>
      <SportsDashboardLayout>{children}</SportsDashboardLayout>
    </ProtectedRoute>
  </Suspense>
 );
}
