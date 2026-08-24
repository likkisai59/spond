import type { Metadata } from "next";
import { MarketplaceDashboardPage } from "@/band/pages/marketplace-dashboard-page";

export const metadata: Metadata = {
  title: "BandConnect Dashboard",
};

export default function Page() {
  return <MarketplaceDashboardPage />;
}
