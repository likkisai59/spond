"use client";

import { Building2, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import type { Venue } from "@/types";
import { formatCount, formatCurrency } from "@/utils/helpers";
import { cn } from "@/utils/cn";
import { RatingStars } from "./rating-stars";

export interface VenueCardProps {
  venue: Venue;
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  const dispatch = useAppDispatch();

  const handleEnquiry = () => {
    dispatch(
      notificationAdded({
        title: "Venue enquiry sent",
        message: `An availability enquiry was sent to ${venue.name} (demo mode).`,
        variant: "success",
      })
    );
  };

  return (
    <Card
      interactive
      className={cn("flex h-full flex-col p-5 sm:p-6 animate-fade-in-up", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft">
            <Building2 className="h-5 w-5 text-accent" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold tracking-tight">
              {venue.name}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {venue.location}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {venue.venueType}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/40 px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Capacity
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-extrabold">
            <Users className="h-3.5 w-3.5 text-accent" />
            {formatCount(venue.capacity)}
          </p>
        </div>
        <div className="rounded-xl bg-muted/40 px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pricing
          </p>
          <p className="mt-0.5 text-sm font-extrabold">
            {formatCurrency(venue.pricePerHour)}
            <span className="text-[11px] font-semibold text-muted-foreground">
              {" "}
              / hour
            </span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {venue.amenities.slice(0, 4).map((amenity) => (
          <Badge key={amenity} variant="outline" className="text-[10px]">
            {amenity}
          </Badge>
        ))}
      </div>

      <div className="mt-4">
        <RatingStars value={venue.rating} count={venue.reviewCount} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold",
            venue.available
              ? "bg-emerald-100 text-emerald-700"
              : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          )}
        >
          {venue.available ? "Available" : "Booked out"}
        </span>
        <Button
          variant="accent"
          size="sm"
          onClick={handleEnquiry}
          disabled={!venue.available}
        >
          {venue.available ? "Check dates" : "Unavailable"}
        </Button>
      </div>
    </Card>
  );
}
