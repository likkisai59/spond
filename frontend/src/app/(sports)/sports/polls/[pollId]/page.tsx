import type { Metadata } from "next";
import { PollDetailsPage } from "@/sports/pages/poll-details-page";

export const metadata: Metadata = {
  title: "Poll Details",
};

export default function Page() {
  return <PollDetailsPage />;
}
