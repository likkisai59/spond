import type { Metadata } from "next";
import { MedicalDashboardPage } from "@/sports/pages/medical-dashboard-page";

export const metadata: Metadata = {
  title: "Squad Medical Clearance (PCMA)",
  description: "Pre-Competition Medical Assessment and squad clearance dashboard.",
};

export default function Page() {
  return <MedicalDashboardPage />;
}
