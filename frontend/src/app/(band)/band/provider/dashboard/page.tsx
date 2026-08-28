import type { Metadata } from "next";
import { ProviderDashboardPage } from "@/band/pages/provider-dashboard-page";

export const metadata: Metadata = {
  title: "Provider Dashboard — EventHub",
};

export default function Page() {
  return <ProviderDashboardPage />;
}
