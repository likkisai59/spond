import type { Metadata } from "next";
import { ProviderOnboardingPage } from "@/band/pages/provider-onboarding-page";

export const metadata: Metadata = {
  title: "Provider Onboarding — EventHub",
};

export default function Page() {
  return <ProviderOnboardingPage />;
}
