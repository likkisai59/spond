import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Card } from "@/components/shared/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./status-badge";
import { ROUTES } from "@/constants";
import { formatTime } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import type { SportsEvent } from "@/types";
import { cn } from "@/utils/cn";

export interface EventCardProps {
  event: SportsEvent;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const total =
    event.attendance.going + event.attendance.maybe + event.attendance.notResponded;
  const goingPct = total > 0 ? (event.attendance.going / total) * 100 : 0;
  const maybePct = total > 0 ? (event.attendance.maybe / total) * 100 : 0;

  return (
    <Card
      interactive
      className={cn("group flex h-full flex-col p-5 sm:p-6 animate-fade-in-up", className)}
    >
      <Link href={`${ROUTES.SPORTS_EVENTS}/${event.id}`} className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Badge variant="secondary" className="mb-2">
              {event.type}
            </Badge>
            <h3 className="truncate text-lg font-extrabold tracking-tight transition-colors group-hover:text-accent">
              {event.name}
            </h3>
          </div>
          <StatusBadge status={event.status} />
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
            {formatDate(event.date)}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-accent" />
            {formatTime(event.startTime)} – {formatTime(event.endTime)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            <span className="truncate">{event.location}</span>
          </p>
        </div>
      </Link>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-accent" />
            {event.attendance.going} going · {event.attendance.maybe} maybe
          </span>
          <span>{total} invited</span>
        </div>
        <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <span
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${goingPct}%` }}
          />
          <span
            className="h-full bg-amber-400 transition-all"
            style={{ width: `${maybePct}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
