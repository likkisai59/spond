import type { Metadata } from "next";
import { VenuesPage } from "@/band/pages/venues-page";

export const metadata: Metadata = {
  title: "Venues",
};

export default function Page() {
  return <VenuesPage />;
}
