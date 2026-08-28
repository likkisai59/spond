import type { Metadata } from "next";
import { BandLandingPage } from "@/band/pages/band-landing-page";

export const metadata: Metadata = {
  title: "EventHub · Celebrate Every Moment",
  description: "Find the perfect venue, artists & bands for your next event.",
};

export default function Page() {
  return <BandLandingPage />;
}
