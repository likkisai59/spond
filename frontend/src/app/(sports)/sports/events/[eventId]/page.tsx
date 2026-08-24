import type { Metadata } from "next";
import { EventDetailsPage } from "@/sports/pages/event-details-page";

export const metadata: Metadata = {
  title: "Event Details",
};

export default function Page() {
  return <EventDetailsPage />;
}
