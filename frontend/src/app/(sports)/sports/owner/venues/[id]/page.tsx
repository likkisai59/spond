import type { Metadata } from "next";
import { OwnerVenueDetailsPage } from "@/sports/pages/owner-venue-details-page";

export const metadata: Metadata = {
  title: "Manage Venue",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OwnerVenueDetailsPage venueId={id} />;
}
