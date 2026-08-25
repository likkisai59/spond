"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, HelpCircle, RotateCcw, Save, X } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import {
  selectAllEvents,
  selectAllGroups,
} from "@/store/sports/selectors";
import { AttendanceBadge } from "../components/attendance-badge";
import { StatusBadge } from "../components/status-badge";
import { AttendanceTable, type AttendanceRecord } from "../tables/attendance-table";
import { MOCK_ATTENDANCE_RECORDS } from "../mocks/attendance.mock";
import { formatDate } from "@/utils/date";
import { ROUTES } from "@/constants";
import type { AttendanceResponse } from "@/types";
import { cn } from "@/utils/cn";

const RESPONSE_FILTERS: AttendanceResponse[] = [
  "Going",
  "Maybe",
  "No response",
];

export function AttendancePage() {
  const dispatch = useAppDispatch();
  const events = useAppSelector(selectAllEvents);
  const groups = useAppSelector(selectAllGroups);

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) => {
        const rank = (status: string) =>
          status === "Upcoming" ? 0 : status === "Ongoing" ? 1 : 2;
        return rank(a.status) - rank(b.status) || a.date.localeCompare(b.date);
      }),
    [events]
  );

  const [selectedEventId, setSelectedEventId] = useState<string | null>(
    sortedEvents[0]?.id ?? null
  );
  const [overrides, setOverrides] = useState<
    Record<string, AttendanceResponse>
  >({});
  const [responseFilter, setResponseFilter] = useState<AttendanceResponse | null>(
    null
  );

  useEffect(() => {
    setOverrides({});
  }, [selectedEventId]);

  const selectedEvent = sortedEvents.find((e) => e.id === selectedEventId) ?? null;
  const selectedGroup = selectedEvent
    ? groups.find((g) => g.id === selectedEvent.groupId)
    : undefined;

  const records: AttendanceRecord[] = useMemo(() => {
    if (!selectedEvent) return [];
    const mocked = MOCK_ATTENDANCE_RECORDS.find(
      (record) => record.eventId === selectedEvent.id
    );
    const base = mocked
      ? mocked.responses.map(({ memberId, memberName, response }) => ({
        memberId,
        memberName,
        response,
      }))
      : (selectedGroup?.members ?? []).map((member) => ({
        memberId: member.id,
        memberName: member.name,
        response: "No response" as AttendanceResponse,
      }));
    return base.map((record) => ({
      ...record,
      response: overrides[record.memberId] ?? record.response,
    }));
  }, [selectedEvent, selectedGroup, overrides]);

  const filteredRecords = responseFilter
    ? records.filter((record) => record.response === responseFilter)
    : records;

  const summary = useMemo(() => {
    const counts: Record<AttendanceResponse, number> = {
      Going: 0,
      Maybe: 0,
      "No response": 0,
    };
    records.forEach((record) => {
      counts[record.response] += 1;
    });
    return counts;
  }, [records]);

  const total = records.length;
  const handleSetResponse = (memberId: string, response: AttendanceResponse) => {
    setOverrides((current) => ({ ...current, [memberId]: response }));
  };

  const handleSave = () => {
    dispatch(
      notificationAdded({
        title: "Attendance saved",
        message: `Attendance for "${selectedEvent?.name ?? "the event"}" was recorded (demo mode).`,
        variant: "success",
      })
    );
    setOverrides({});
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Attendance" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Attendance"
        description="Track who is coming to each session and record final turnout."
        className="animate-fade-in-up"
      />

      {sortedEvents.length === 0 ? (
        <div className="mt-8">
          <EmptyCard
            title="No events to track"
            description="Create an event first — attendance will appear here."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="h-fit p-4 animate-fade-in-up">
            <h2 className="px-2 text-base font-bold">Events</h2>
            <div
              className="mt-3 space-y-2"
              role="group"
              aria-label="Select an event"
            >
              {sortedEvents.map((event) => {
                const selected = event.id === selectedEventId;
                const group = groups.find((g) => g.id === event.groupId);
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
                    aria-pressed={selected}
                    className={cn(
                      "w-full rounded-xl border p-3 text-left transition-all",
                      selected
                        ? "border-accent/50 bg-brand-gradient-soft shadow-sm"
                        : "border-border/70 hover:border-accent/40 hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-sm font-bold">
                        {event.name}
                      </p>
                      <StatusBadge status={event.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {group?.name ?? "—"} · {formatDate(event.date)}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            {selectedEvent ? (
              <>
                <Card className="p-5 sm:p-6 animate-fade-in-up">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{selectedEvent.type}</Badge>
                        <StatusBadge status={selectedEvent.status} />
                      </div>
                      <h2 className="mt-1.5 text-lg font-extrabold tracking-tight">
                        {selectedEvent.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {selectedGroup?.name ?? "—"} ·{" "}
                        {formatDate(selectedEvent.date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setOverrides({})}
                        disabled={Object.keys(overrides).length === 0}
                      >
                        <RotateCcw />
                        Reset
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        className="rounded-full"
                        onClick={handleSave}
                        disabled={Object.keys(overrides).length === 0}
                      >
                        <Save />
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {(Object.keys(summary) as AttendanceResponse[]).map(
                      (response) => (
                        <div key={response}>
                          <div className="flex items-center justify-between text-sm">
                            <AttendanceBadge response={response} />
                            <span className="font-bold text-muted-foreground">
                              {summary[response]}
                            </span>
                          </div>
                          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <span
                              className={cn(
                                "block h-full rounded-full",
                                response === "Going" && "bg-emerald-500",
                                response === "Maybe" && "bg-amber-500",
                                response === "No response" && "bg-zinc-400"
                              )}
                              style={{
                                width: `${total > 0
                                    ? (summary[response] / total) * 100
                                    : 0
                                  }%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Card>

                <div className="animate-fade-in-up">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setResponseFilter(null)}
                      aria-pressed={responseFilter === null}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                        responseFilter === null
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-input text-muted-foreground hover:border-accent/40 hover:text-foreground"
                      )}
                    >
                      All ({total})
                    </button>
                    {RESPONSE_FILTERS.map((response) => (
                      <button
                        key={response}
                        type="button"
                        onClick={() =>
                          setResponseFilter(
                            responseFilter === response ? null : response
                          )
                        }
                        aria-pressed={responseFilter === response}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                          responseFilter === response
                            ? "border-transparent bg-primary text-primary-foreground"
                            : "border-input text-muted-foreground hover:border-accent/40 hover:text-foreground"
                        )}
                      >
                        {response === "Going" ? (
                          <Check className="h-3 w-3" />
                        ) : response === "Maybe" ? (
                          <HelpCircle className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {response} ({summary[response]})
                      </button>
                    ))}
                  </div>
                  <AttendanceTable
                    records={filteredRecords}
                    onSetResponse={handleSetResponse}
                  />
                </div>
              </>
            ) : (
              <EmptyCard
                title="Select an event"
                description="Pick an event from the list to record attendance."
              />
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
