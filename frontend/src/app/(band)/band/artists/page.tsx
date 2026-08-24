import type { Metadata } from "next";
import { ArtistsPage } from "@/band/pages/artists-page";

export const metadata: Metadata = {
  title: "Artists",
};

export default function Page() {
  return <ArtistsPage />;
}
