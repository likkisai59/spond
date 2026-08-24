import type { Metadata } from "next";
import { SportsDashboardPage } from "@/sports/pages/sports-dashboard-page";

export const metadata: Metadata = {
  title: "Sports Dashboard",
};

export default function Page() {
  return <SportsDashboardPage />;
}
