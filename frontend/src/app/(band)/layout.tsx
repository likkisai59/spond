import type { Metadata } from "next";
import { DashboardLayout } from "@/layouts";
import { BandLogoutButton } from "@/band/layout/band-logout-button";

export const metadata: Metadata = {
  title: "BandConnect",
};

export default function BandRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout product="band" sidebarFooter={<BandLogoutButton />}>
      {children}
    </DashboardLayout>
  );
}
