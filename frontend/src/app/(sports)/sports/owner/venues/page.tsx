import type { Metadata } from "next";
import { OwnerVenuesPage } from "@/sports/pages/owner-venues-page";

export const metadata: Metadata = {
  title: "My Venues",
};

export default function Page() {
  return <OwnerVenuesPage />;
}
