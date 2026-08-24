import type { Metadata } from "next";
import { ArtistDetailsPage } from "@/band/pages/artist-details-page";

export const metadata: Metadata = {
  title: "Artist Details",
};

export default function Page() {
  return <ArtistDetailsPage />;
}
