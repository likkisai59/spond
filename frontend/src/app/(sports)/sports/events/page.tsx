import type { Metadata } from "next";
import { EventsPage } from "@/sports/pages/events-page";

export const metadata: Metadata = {
  title: "Events",
};

export default function Page() {
  return <EventsPage />;
}
