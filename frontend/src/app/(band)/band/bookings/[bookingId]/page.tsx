import type { Metadata } from "next";
import { BookingDetailsPage } from "@/band/pages/booking-details-page";

export const metadata: Metadata = {
  title: "Booking Details",
};

export default function Page() {
  return <BookingDetailsPage />;
}
