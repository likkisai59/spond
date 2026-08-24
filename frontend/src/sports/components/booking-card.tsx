"use client";

import { CalendarDays, Clock, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { StatusBadge } from "./status-badge";
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/helpers";
import type { VenueBooking } from "@/types";
import { cn } from "@/utils/cn";

export interface BookingCardProps {
  booking: VenueBooking;
  onCancel?: (booking: VenueBooking) => void;
  className?: string;
}

export function BookingCard({ booking, onCancel, className }: BookingCardProps) {
  const cancellable =
    booking.status === "Confirmed" || booking.status === "Pending";

  return (
    <Card
      interactive
      className={cn("flex h-full flex-col p-5 sm:p-6 animate-fade-in-up", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-extrabold tracking-tight">
            {booking.venueName}
          </h3>
          <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-accent" />
            {booking.groupName}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
          {formatDate(booking.eventDate)}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-accent" />
          {booking.slotLabel}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <p className="text-lg font-extrabold tracking-tight">
          {formatCurrency(booking.price)}
        </p>
        {cancellable && onCancel ? (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onCancel(booking)}
            aria-label={`Cancel booking at ${booking.venueName}`}
          >
            <XCircle />
            Cancel
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
