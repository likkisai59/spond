import Link from "next/link";
import { Building2, MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { ROUTES } from "@/constants";
import { formatCurrency } from "@/utils/helpers";
import { VENUE_SLOTS } from "../mocks/venues.mock";
import type { SportsVenue } from "@/types";
import { cn } from "@/utils/cn";

export interface VenueCardProps {
  venue: SportsVenue;
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  const priceFrom = Math.min(...VENUE_SLOTS.map((slot) => slot.price));

  return (
    <Card
      interactive
      className={cn("flex h-full flex-col p-5 sm:p-6 animate-fade-in-up", className)}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft">
          <Building2 className="h-7 w-7 text-accent" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-extrabold tracking-tight">
            {venue.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{venue.surface}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {venue.city}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {venue.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-muted/50 px-3.5 py-2.5 text-xs font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-4 w-4 text-accent" />
          {venue.rating.toFixed(1)} ({venue.reviewCount})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4 text-accent" />
          Fits {venue.capacity}
        </span>
        <span className="ml-auto text-accent">
          {formatCurrency(priceFrom)}+ / slot
        </span>
      </div>

      <Button asChild variant="outline" className="mt-4 w-full rounded-full">
        <Link href={`${ROUTES.SPORTS_VENUES}/${venue.id}`}>View & book</Link>
      </Button>
    </Card>
  );
}
