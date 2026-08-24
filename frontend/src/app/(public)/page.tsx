import type { Metadata } from "next";
import { LandingPage } from "@/landing";

export const metadata: Metadata = {
  title: "Home",
};

export default function Page() {
  return <LandingPage />;
}
