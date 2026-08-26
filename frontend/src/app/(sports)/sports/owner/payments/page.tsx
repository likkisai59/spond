import type { Metadata } from "next";
import { OwnerPaymentsPage } from "@/sports/pages/owner-payments-page";

export const metadata: Metadata = {
  title: "Owner Payments",
};

export default function Page() {
  return <OwnerPaymentsPage />;
}
