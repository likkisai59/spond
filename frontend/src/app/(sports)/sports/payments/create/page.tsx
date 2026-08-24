import type { Metadata } from "next";
import { CreatePaymentPage } from "@/sports/pages/create-payment-page";

export const metadata: Metadata = {
  title: "Request Payment",
};

export default function Page() {
  return <CreatePaymentPage />;
}
