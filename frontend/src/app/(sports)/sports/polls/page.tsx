import type { Metadata } from "next";
import { PollsPage } from "@/sports/pages/polls-page";

export const metadata: Metadata = {
  title: "Polls",
};

export default function Page() {
  return <PollsPage />;
}
