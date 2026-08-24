import type { Metadata } from "next";
import { SportsDashboardLayout } from "@/sports/layout/sports-dashboard-layout";

export const metadata: Metadata = {
  title: "Sports",
};

export default function SportsRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SportsDashboardLayout>{children}</SportsDashboardLayout>;
}
