import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <ProtectedRoute allowedRoles={["artist", "band"]}><DashboardLayout product="band">{children}</DashboardLayout></ProtectedRoute>
    
  );
}
