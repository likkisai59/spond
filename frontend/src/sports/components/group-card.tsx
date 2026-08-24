import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { ROUTES } from "@/constants";
import { getInitials } from "@/utils/helpers";
import type { SportsEvent, SportsGroup } from "@/types";
import { cn } from "@/utils/cn";

export interface GroupCardProps {
  group: SportsGroup;
  nextEvent?: SportsEvent;
  className?: string;
}

export function GroupCard({ group, nextEvent, className }: GroupCardProps) {
  return (
    <Card
      interactive
      className={cn("group flex h-full flex-col p-5 sm:p-6 animate-fade-in-up", className)}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 rounded-2xl">
          <AvatarFallback className="rounded-2xl text-sm">
            {getInitials(group.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-extrabold tracking-tight">
            {group.name}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{group.category}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {group.location}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {group.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3.5 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Users className="h-4 w-4 text-accent" />
          {group.memberCount} members
        </span>
        {nextEvent ? (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-accent" />
            <span className="truncate">
              {nextEvent.name} · {nextEvent.date}
            </span>
          </span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            No upcoming events
          </span>
        )}
      </div>

      <Button asChild variant="outline" className="mt-4 w-full rounded-full">
        <Link href={`${ROUTES.SPORTS_GROUPS}/${group.id}`}>View group</Link>
      </Button>
    </Card>
  );
}
