"use client";

import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/tables";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "../components/status-badge";
import { ROUTES } from "@/constants";
import { formatTime } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import type { SportsEvent } from "@/types";

export interface EventsTableProps {
  events: SportsEvent[];
}

export function EventsTable({ events }: EventsTableProps) {
  const columns: DataTableColumn<SportsEvent>[] = [
    {
      key: "name",
      header: "Event",
      render: (event) => (
        <Link
          href={`${ROUTES.SPORTS_EVENTS}/${event.id}`}
          className="text-sm font-bold transition-colors hover:text-accent"
        >
          {event.name}
        </Link>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (event) => <Badge variant="secondary">{event.type}</Badge>,
    },
    {
      key: "date",
      header: "Date",
      render: (event) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(event.date)}
        </span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (event) => (
        <span className="text-sm text-muted-foreground">
          {formatTime(event.startTime)} – {formatTime(event.endTime)}
        </span>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (event) => (
        <span className="text-sm text-muted-foreground">{event.location}</span>
      ),
    },
    {
      key: "attendance",
      header: "Attendance",
      render: (event) => (
        <span className="text-xs font-semibold text-muted-foreground">
          {event.attendance.going} going · {event.attendance.maybe} maybe
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (event) => <StatusBadge status={event.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={events}
      rowKey={(event) => event.id}
      emptyTitle="No events yet"
      emptyDescription="Create an event and it will show up in this schedule."
    />
  );
}
