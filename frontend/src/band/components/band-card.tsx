"use client";

import { BadgeCheck, CalendarClock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import type { AvailabilityStatus, BandProfile } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import { cn } from "@/utils/cn";
import { RatingStars } from "./rating-stars";

const AVAILABILITY_CLASSES: Record<AvailabilityStatus, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  Limited: "bg-amber-100 text-amber-700",
  Booked: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export interface BandCardProps {
  band: BandProfile;
  className?: string;
}

export function BandCard({ band, className }: BandCardProps) {
  const dispatch = useAppDispatch();

  const handleEnquiry = () => {
    dispatch(
      notificationAdded({
        title: "Enquiry sent",
        message: `A booking enquiry was sent to ${band.name} (demo mode).`,
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
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-lg font-extrabold tracking-tight">
            {band.name}
            {band.verified ? (
              <BadgeCheck className="h-4 w-4 shrink-0 text-accent" aria-label="Verified" />
            ) : null}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {band.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {band.members} members
            </span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
            AVAILABILITY_CLASSES[band.availability]
          )}
        >
          {band.availability}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {band.genres.map((genre) => (
          <Badge key={genre} variant="gradient" className="text-[10px]">
            {genre}
          </Badge>
        ))}
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {band.bio}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <RatingStars value={band.rating} count={band.reviewCount} />
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5 text-accent" />
          Free {formatDate(band.nextAvailable)}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">From</p>
          <p className="text-lg font-extrabold tracking-tight text-primary">
            {formatCurrency(band.priceFrom)}
            <span className="text-xs font-semibold text-muted-foreground">
              {" "}
              / event
            </span>
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={handleEnquiry}
          disabled={band.availability === "Booked"}
        >
          {band.availability === "Booked" ? "Booked out" : "Book band"}
        </Button>
      </div>
    </Card>
  );
}
