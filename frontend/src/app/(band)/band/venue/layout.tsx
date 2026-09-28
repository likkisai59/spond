import { Suspense } from "react";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

export default function VenueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute allowedRoles={["venue_owner"]}>
        <DashboardLayout product="band">{children}</DashboardLayout>
      </ProtectedRoute>
    </Suspense>
  );
}
