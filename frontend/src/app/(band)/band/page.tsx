import type { Metadata } from "next";
import { BandDashboardPage } from "@/band/pages/band-dashboard-page";

export const metadata: Metadata = {
  title: "BandConnect Dashboard",
};

export default function Page() {
  return <BandDashboardPage />;
}
