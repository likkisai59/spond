"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { VenueCard } from "../components/venue-card";
import { venuesService } from "@/services/sports";
import { ROUTES } from "@/constants";
import { Plus } from "lucide-react";

export function OwnerVenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    venuesService.listOwnerVenues().then((res) => {
      setVenues(res.data?.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "My Venues" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="My Venues"
        description="Manage your listed venues and their availability."
        actions={
          <Button asChild variant="accent">
            <Link href={ROUTES.SPORTS_OWNER_VENUES_CREATE}>
              <Plus className="mr-2 h-4 w-4" />
              Add Venue
            </Link>
          </Button>
        }
      />

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading venues...</p>
        ) : venues.length === 0 ? (
          <EmptyCard
            title="No venues yet"
            description="You haven't listed any venues yet. Add one to start receiving bookings."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                href={`${ROUTES.SPORTS_OWNER_VENUE_DETAILS}/${venue.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
