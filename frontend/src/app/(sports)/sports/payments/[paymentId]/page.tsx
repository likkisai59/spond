import type { Metadata } from "next";
import { PaymentDetailsPage } from "@/sports/pages/payment-details-page";

export const metadata: Metadata = {
  title: "Payment Details",
};

export default function Page() {
  return <PaymentDetailsPage />;
}
