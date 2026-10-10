"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Clock,
  MapPin,
  Trash2,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { fetchEventsThunk, deleteEventThunk } from "@/store/sports/events-slice";
import { fetchGroupsThunk } from "@/store/sports/groups-slice";
import {
  selectEventById,
  selectGroupById,
} from "@/store/sports/selectors";
import { StatusBadge } from "../components";
import type { SportsEvent } from "@/types";
import { formatDate } from "@/utils/date";
import { formatTime } from "@/utils/helpers";
import { ROUTES } from "@/constants";

export function EventDetailsPage() {
  const params = useParams<{ eventId: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const event = useAppSelector((state) => selectEventById(state, params.eventId));
  const group = useAppSelector((state) =>
    selectGroupById(state, event?.groupId ?? "")
  );
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

  if (!event) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "Sports", href: ROUTES.SPORTS },
            { label: "Events", href: ROUTES.SPORTS_EVENTS },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          title="Event not found"
          description="This event may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_EVENTS}>Back to events</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const handleDeleteEvent = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await dispatch(deleteEventThunk(params.eventId)).unwrap();
      dispatch(
        notificationAdded({
          title: "Event deleted",
          message: "The event has been successfully deleted.",
          variant: "success",
        })
      );
      router.push(ROUTES.SPORTS_EVENTS);
    } catch (error: any) {
      dispatch(
        notificationAdded({
          title: "Error deleting event",
          message: error?.message || "Failed to delete event",
          variant: "error",
        })
      );
    }
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Events", href: ROUTES.SPORTS_EVENTS },
          { label: event.name },
        ]}
        className="mb-4"
      />

      <PageHeaderLikeTitle
        event={event}
        groupName={group?.name}
        onDelete={handleDeleteEvent}
      />

      <div className="mt-8 space-y-6">
        <Card className="animate-fade-in-up p-6 sm:p-7">
          <h2 className="text-lg font-extrabold tracking-tight">Event info</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoRow icon={CalendarDays} label="Date" value={formatDate(event.date)} />
            <InfoRow
              icon={Clock}
              label="Time"
              value={`${formatTime(event.startTime)} – ${formatTime(event.endTime)}`}
            />
            <InfoRow icon={MapPin} label="Location" value={event.location} />
            <InfoRow
              icon={Users}
              label="Attendance"
              value={`${event.attendance.going} going · ${event.attendance.maybe} maybe`}
            />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {event.description}
          </p>
          {event.notifyMembers ? (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-gradient-soft px-3 py-1.5 text-xs font-bold text-accent">
              <Bell className="h-3.5 w-3.5" />
              Members were notified when this event was created
            </p>
          ) : null}
        </Card>
      </div>
    </PageContainer>
  );
}

function PageHeaderLikeTitle({
  event,
  groupName,
  onDelete,
}: {
  event: SportsEvent;
  groupName?: string;
  onDelete?: () => void;
}) {
  return (
    <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{event.type}</Badge>
          <StatusBadge status={event.status} />
          {groupName ? (
            <Badge variant="gradient">{groupName}</Badge>
          ) : null}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
          {event.name}
        </h1>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button
          variant="destructive"
          onClick={onDelete}
          className="flex items-center gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          Delete event
        </Button>
        <Button asChild variant="ghost">
          <Link href={ROUTES.SPORTS_EVENTS}>
            <ArrowLeft />
            Back to events
          </Link>
        </Button>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
