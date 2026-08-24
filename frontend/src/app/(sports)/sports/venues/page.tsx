import type { Metadata } from "next";
import { VenuesPage } from "@/sports/pages/venues-page";

export const metadata: Metadata = {
  title: "Venues",
};

export default function Page() {
  return <VenuesPage />;
}
