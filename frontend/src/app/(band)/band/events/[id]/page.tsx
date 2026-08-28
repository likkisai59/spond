import type { Metadata } from "next";
import { EventDashboardPage } from "@/band/pages/event-dashboard-page";

export const metadata: Metadata = {
  title: "Event Dashboard — EventHub",
};

export default function Page() {
  return <EventDashboardPage />;
}
