import type { Metadata } from "next";
import { OwnerDashboardPage } from "@/sports/pages/owner-dashboard-page";

export const metadata: Metadata = {
  title: "Owner Dashboard",
};

export default function Page() {
  return <OwnerDashboardPage />;
}
