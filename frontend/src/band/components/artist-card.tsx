"use client";

import { BadgeCheck, MapPin, Mic2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import type { AvailabilityStatus, BandArtist } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import { cn } from "@/utils/cn";
import { RatingStars } from "./rating-stars";

const AVAILABILITY_CLASSES: Record<AvailabilityStatus, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  Limited: "bg-amber-100 text-amber-700",
  Booked: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export interface ArtistCardProps {
  artist: BandArtist;
  className?: string;
}

export function ArtistCard({ artist, className }: ArtistCardProps) {
  const dispatch = useAppDispatch();

  const handleInvite = () => {
    dispatch(
      notificationAdded({
        title: "Enquiry sent",
        message: `An invite was sent to ${artist.name} (demo mode).`,
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
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <Mic2 className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-base font-extrabold tracking-tight">
              {artist.name}
              {artist.verified ? (
                <BadgeCheck className="h-4 w-4 shrink-0 text-accent" aria-label="Verified" />
              ) : null}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {artist.location}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
            AVAILABILITY_CLASSES[artist.availability]
          )}
        >
          {artist.availability}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {artist.genres.map((genre) => (
          <Badge key={genre} variant="secondary" className="text-[10px]">
            {genre}
          </Badge>
        ))}
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {artist.bio}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <RatingStars value={artist.rating} count={artist.reviewCount} />
        <span className="text-xs font-semibold text-muted-foreground">
          {artist.completedGigs} gigs
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">From</p>
          <p className="text-lg font-extrabold tracking-tight text-primary">
            {formatCurrency(artist.priceFrom)}
            <span className="text-xs font-semibold text-muted-foreground">
              {" "}
              / event
            </span>
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={handleInvite}
          disabled={artist.availability === "Booked"}
        >
          {artist.availability === "Booked" ? "Booked out" : "Send enquiry"}
        </Button>
      </div>
    </Card>
  );
}
