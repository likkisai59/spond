"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Search, SearchX } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchEventsThunk } from "@/store/sports/events-slice";
import { fetchGroupsThunk } from "@/store/sports/groups-slice";
import {
  selectAllGroups,
  selectPastEvents,
  selectUpcomingEvents,
} from "@/store/sports/selectors";
import { EventCard } from "../components/event-card";
import { EVENT_TYPES, type EventType } from "@/types";
import { ROUTES } from "@/constants";

export function EventsPage() {
  const dispatch = useAppDispatch();
  const upcoming = useAppSelector(selectUpcomingEvents);
  const past = useAppSelector(selectPastEvents);
  const _groups = useAppSelector(selectAllGroups);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<EventType | "all">("all");
  const debouncedSearch = useDebounce(search, 250);
  const eventsStatus = useAppSelector((state) => state.sports.events.status);
  const groupsStatus = useAppSelector((state) => state.sports.groups.status);

  useEffect(() => {
    if (eventsStatus === "idle" || eventsStatus === "failed") {
      dispatch(fetchEventsThunk());
    }
    if (groupsStatus === "idle" || groupsStatus === "failed") {
      dispatch(fetchGroupsThunk());
    }
  }, [dispatch, eventsStatus, groupsStatus]);

  const filterEvents = useMemo(
    () =>
      (events: typeof upcoming) => {
        const query = debouncedSearch.trim().toLowerCase();
        return events.filter((event) => {
          const matchesQuery =
            query.length === 0 ||
            event.name.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query);
          const matchesType = type === "all" || event.type === type;
          return matchesQuery && matchesType;
        });
      },
    [debouncedSearch, type]
  );

  const filteredUpcoming = filterEvents(upcoming);
  const filteredPast = filterEvents(past);

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Events" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Events"
        description="Training sessions, matches, meetings and everything on the calendar."
        actions={
          <Button asChild variant="accent">
            <Link href={ROUTES.SPORTS_EVENTS_CREATE}>
              <CalendarPlus />
              Create event
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="upcoming" className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search events…"
                className="pl-9 sm:w-64"
                aria-label="Search events"
              />
            </div>
            <Select
              value={type}
              onValueChange={(value) => setType(value as EventType | "all")}
            >
              <SelectTrigger className="sm:w-48" aria-label="Filter by type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {EVENT_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="upcoming" className="mt-6">
          {filteredUpcoming.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredUpcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyCard
              icon={SearchX}
              title="No matching events"
              description="Adjust the search or filter, or create a new event."
              action={
                <Button asChild variant="accent">
                  <Link href={ROUTES.SPORTS_EVENTS_CREATE}>Create event</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {filteredPast.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredPast.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No past events"
              description="Completed and cancelled events will be archived here."
            />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
