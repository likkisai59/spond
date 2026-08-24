import type { Metadata } from "next";
import { StatisticsPage } from "@/sports/pages/statistics-page";

export const metadata: Metadata = {
  title: "Statistics",
};

export default function Page() {
  return <StatisticsPage />;
}
