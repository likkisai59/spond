import { Suspense } from "react";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute allowedRoles={["client"]}>
        <DashboardLayout product="band">{children}</DashboardLayout>
      </ProtectedRoute>
    </Suspense>
  );
}
