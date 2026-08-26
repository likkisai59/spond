import type { Metadata } from "next";
import { OwnerBookingsPage } from "@/sports/pages/owner-bookings-page";

export const metadata: Metadata = {
  title: "Owner Bookings",
};

export default function Page() {
  return <OwnerBookingsPage />;
}
