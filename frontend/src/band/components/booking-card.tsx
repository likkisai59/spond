"use client";

import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import type { BandBooking } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import { formatTime } from "@/utils/helpers";
import { StatusBadge } from "@/sports/components/status-badge";

export interface BookingCardProps {
  booking: BandBooking;
  onViewDetails: (booking: BandBooking) => void;
  className?: string;
}

export function BookingCard({
  booking,
  onViewDetails,
  className,
}: BookingCardProps) {
  return (
    <Card
      interactive
      className={className}
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            <Badge variant="secondary">{booking.eventType}</Badge>
          </div>
          <h3 className="truncate text-lg font-extrabold tracking-tight">
            {booking.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">
              {booking.bandName}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {booking.venueName}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {formatDate(booking.eventDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {booking.guestCount} guests
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 lg:flex-col lg:items-end lg:justify-center lg:gap-2">
          <p className="text-xl font-extrabold tracking-tight text-primary">
            {formatCurrency(booking.amount)}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => onViewDetails(booking)}
          >
            View details
          </Button>
        </div>
      </div>
    </Card>
  );
}
