import type { Metadata } from "next";
import { OwnerCreateVenuePage } from "@/sports/pages/owner-create-venue-page";

export const metadata: Metadata = {
  title: "Add Venue",
};

export default function Page() {
  return <OwnerCreateVenuePage />;
}
