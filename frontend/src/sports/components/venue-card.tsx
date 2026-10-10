import Link from "next/link";
import { Building2, MapPin, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { ROUTES } from "@/constants";
import type { SportsVenue } from "@/types";
import { cn } from "@/utils/cn";

export interface VenueCardProps {
  venue: SportsVenue;
  className?: string;
  href?: string;
  onEdit?: (venue: SportsVenue) => void;
}

export function VenueCard({ venue, className, href, onEdit }: VenueCardProps) {
  return (
    <Card
      interactive
      className={cn("flex h-full w-full max-w-[420px] flex-col p-5 animate-fade-in-up", className)}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft">
          <Building2 className="h-7 w-7 text-accent" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-lg font-extrabold tracking-tight">
              {venue.name}
            </h3>
            {onEdit && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-accent/15 hover:text-accent"
                title="Edit venue details"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(venue);
                }}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit Venue</span>
              </Button>
            )}
          </div>
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

      <Button asChild variant="outline" className="mt-4 w-full rounded-full">
        <Link href={href || `${ROUTES.SPORTS_VENUES}/${venue.id}`}>View details</Link>
      </Button>
    </Card>
  );
}
