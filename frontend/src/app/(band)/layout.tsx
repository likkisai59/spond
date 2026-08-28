"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/layouts";
import { BandLogoutButton } from "@/band/layout/band-logout-button";
import { EventHubNavbar } from "@/band/components/eventhub-navbar";

const PUBLIC_MARKETPLACE_ROUTES = [
  "/band",
  "/band/search",
  "/band/artists",
  "/band/bands",
  "/band/venues",
];

export default function BandRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If visiting public EventHub marketplace discovery pages, render full-width with EventHub top navbar and NO sidebar
  const isPublicMarketplace =
    PUBLIC_MARKETPLACE_ROUTES.includes(pathname) ||
    pathname.startsWith("/band/artists/") ||
    pathname.startsWith("/band/bands/") ||
    pathname.startsWith("/band/venues/");

  if (isPublicMarketplace) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {pathname !== "/band" && <EventHubNavbar />}
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    );
  }

  // Internal management / operational pages keep the dashboard layout & sidebar
  return (
    <DashboardLayout product="band" sidebarFooter={<BandLogoutButton />}>
      {children}
    </DashboardLayout>
  );
}
