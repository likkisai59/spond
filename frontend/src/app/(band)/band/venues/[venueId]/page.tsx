import type { Metadata } from "next";
import { VenueDetailsPage } from "@/band/pages/venue-details-page";

export const metadata: Metadata = {
  title: "Venue Details",
};

export default function Page() {
  return <VenueDetailsPage />;
}
