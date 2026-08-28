import { EventHubNavbar } from "@/band/components/eventhub-navbar";
import { EventHubHeroSection } from "@/band/components/eventhub-hero-section";

export function BandLandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <EventHubNavbar />
      <main className="flex-1">
        <EventHubHeroSection />
      </main>
    </div>
  );
}
