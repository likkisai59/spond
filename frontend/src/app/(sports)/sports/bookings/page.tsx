import type { Metadata } from "next";
import { BookingsPage } from "@/sports/pages/bookings-page";

export const metadata: Metadata = {
  title: "Bookings",
};

export default function Page() {
  return <BookingsPage />;
}
