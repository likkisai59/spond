import type { Metadata } from "next";
import { OwnerVenueDetailsPage } from "@/sports/pages/owner-venue-details-page";

export const metadata: Metadata = {
  title: "Manage Venue",
};

export default function Page({ params }: { params: { id: string } }) {
  return <OwnerVenueDetailsPage venueId={params.id} />;
}
