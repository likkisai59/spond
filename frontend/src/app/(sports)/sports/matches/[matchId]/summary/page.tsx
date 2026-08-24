import type { Metadata } from "next";
import { MatchSummaryPage } from "@/sports/pages/match-summary-page";

export const metadata: Metadata = {
  title: "Match Summary",
};

export default function Page() {
  return <MatchSummaryPage />;
}
