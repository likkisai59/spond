import type { Metadata } from "next";
import { CreateEventPage } from "@/sports/pages/create-event-page";

export const metadata: Metadata = {
  title: "Create Event",
};

export default function Page() {
  return <CreateEventPage />;
}
