"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, ChevronDown, ChevronUp, HelpCircle, Lock, RotateCcw, Save, X } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eventsService } from "@/services/sports/events.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { markAttendanceThunk, fetchEventsThunk } from "@/store/sports/events-slice";
import { fetchGroupsThunk } from "@/store/sports/groups-slice";
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
  "Present",
  "Absent",
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
  const [savedDbResponses, setSavedDbResponses] = useState<
    Record<string, AttendanceResponse>
  >({});
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [responseFilter, setResponseFilter] = useState<AttendanceResponse | null>(
    null
  );
  const [historyFilter, setHistoryFilter] = useState<"7d" | "30d" | "90d">("7d");
  const [expandedHistoryEventId, setExpandedHistoryEventId] = useState<string | null>(null);
  const [historyEventRecords, setHistoryEventRecords] = useState<Record<string, any[]>>({});
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null);
  const [eventsWithSavedAttendance, setEventsWithSavedAttendance] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchEventsThunk());
    if (groups.length === 0) {
      dispatch(fetchGroupsThunk());
    }
  }, [dispatch, groups.length]);

  useEffect(() => {
    const initialSet = new Set<string>();
    events.forEach((e) => {
      if (e.attendance && (e.attendance.going > 0 || e.attendance.maybe > 0)) {
        initialSet.add(e.id);
      }
    });
    if (initialSet.size > 0) {
      setEventsWithSavedAttendance((prev) => new Set([...prev, ...initialSet]));
    }
  }, [events]);

  useEffect(() => {
    setOverrides({});
    if (!selectedEventId) return;
    const fetchSaved = async () => {
      try {
        const res = await eventsService.getAttendance(selectedEventId);
        const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
        if (items.length > 0) {
          const map: Record<string, AttendanceResponse> = {};
          items.forEach((item: any) => {
            const uid = item.userId || item.user_id;
            const status = item.attendanceStatus || item.attendance_status;
            if (uid && status) {
              map[uid] = status as AttendanceResponse;
            }
          });
          setSavedDbResponses(map);
          setEventsWithSavedAttendance((prev) => new Set(prev).add(selectedEventId));
          setHistoryEventRecords((prev) => ({ ...prev, [selectedEventId]: items }));
        } else {
          setSavedDbResponses({});
        }
      } catch (err) {
        console.warn("Could not load saved attendance from DB:", err);
      }
    };
    fetchSaved();
  }, [selectedEventId]);

  const selectedEvent = sortedEvents.find((e) => e.id === selectedEventId) ?? null;
  const selectedGroup = selectedEvent
    ? groups.find((g) => g.id === selectedEvent.groupId)
    : undefined;

  const isAttendanceFinalized = useMemo(() => {
    if (!selectedEvent) return false;
    return (
      Object.keys(savedDbResponses).length > 0 ||
      eventsWithSavedAttendance.has(selectedEvent.id)
    );
  }, [selectedEvent, savedDbResponses, eventsWithSavedAttendance]);

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
        response: "Absent" as AttendanceResponse,
      }));
    return base.map((record) => {
      const rawResp = overrides[record.memberId] ?? savedDbResponses[record.memberId] ?? record.response;
      const resp = (rawResp === "Going" || rawResp === "Present") ? "Present" : "Absent";
      return {
        ...record,
        response: resp as AttendanceResponse,
      };
    });
  }, [selectedEvent, selectedGroup, overrides, savedDbResponses]);

  const filteredRecords = responseFilter
    ? records.filter((record) => {
        const resp = (record.response === "Going" || record.response === "Present") ? "Present" : "Absent";
        return resp === responseFilter;
      })
    : records;

  const summary = useMemo(() => {
    const counts: Record<string, number> = {
      Present: 0,
      Absent: 0,
    };
    records.forEach((record) => {
      const resp = (record.response === "Going" || record.response === "Present") ? "Present" : "Absent";
      counts[resp] = (counts[resp] || 0) + 1;
    });
    return counts;
  }, [records]);

  const total = records.length;
  const handleSetResponse = (memberId: string, response: AttendanceResponse) => {
    setOverrides((current) => ({ ...current, [memberId]: response }));
  };

  const handleSave = async () => {
    if (!selectedEvent) return;
    
    const recordsToSave = Object.entries(overrides).map(([memberId, response]) => ({
      eventId: selectedEvent.id,
      userId: memberId,
      attendanceStatus: response,
    }));

    if (recordsToSave.length > 0) {
      try {
        await dispatch(markAttendanceThunk(recordsToSave)).unwrap();
        setSavedDbResponses((prev) => ({ ...prev, ...overrides }));
        setEventsWithSavedAttendance((prev) => new Set(prev).add(selectedEvent.id));

        const updatedHistoryItems = recordsToSave.map((r) => ({
          event_id: r.eventId,
          user_id: r.userId,
          attendance_status: r.attendanceStatus,
        }));
        setHistoryEventRecords((prev) => ({
          ...prev,
          [selectedEvent.id]: updatedHistoryItems,
        }));

        setShowSuccessScreen(true);
        setTimeout(() => setShowSuccessScreen(false), 2500);
        dispatch(
          notificationAdded({
            title: "Attendance saved",
            message: `Attendance for "${selectedEvent.name}" was successfully recorded.`,
            variant: "success",
          })
        );
        setOverrides({});
      } catch (error: any) {
        dispatch(
          notificationAdded({
            title: "Error saving attendance",
            message: error.message || "Failed to save attendance.",
            variant: "error",
          })
        );
      }
    }
  };

  const pastEvents = useMemo(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return sortedEvents.filter((event) => {
      const isExplicitlyRecorded = eventsWithSavedAttendance.has(event.id);
      const isPastOrRecorded =
        (event.date || "") <= today ||
        event.status === "Completed" ||
        isExplicitlyRecorded ||
        (event.attendance && (event.attendance.going > 0 || event.attendance.maybe > 0));

      if (!isPastOrRecorded) return false;
      if (!event.date) return true;

      const eventDate = new Date(event.date);
      if (historyFilter === "7d") {
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - 7);
        return eventDate >= cutoff || isExplicitlyRecorded;
      }
      if (historyFilter === "30d") {
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - 30);
        return eventDate >= cutoff || isExplicitlyRecorded;
      }
      if (historyFilter === "90d") {
        const cutoff = new Date();
        cutoff.setDate(now.getDate() - 90);
        return eventDate >= cutoff || isExplicitlyRecorded;
      }
      return false;
    });
  }, [sortedEvents, historyFilter, eventsWithSavedAttendance]);

  const handleToggleExpandHistory = async (eventId: string) => {
    if (expandedHistoryEventId === eventId) {
      setExpandedHistoryEventId(null);
      return;
    }
    setExpandedHistoryEventId(eventId);
    if (!historyEventRecords[eventId]) {
      setLoadingHistoryId(eventId);
      try {
        const res = await eventsService.getAttendance(eventId);
        const items = res.data?.items || (Array.isArray(res.data) ? res.data : []);
        setHistoryEventRecords((prev) => ({ ...prev, [eventId]: items }));
      } catch (err) {
        console.warn("Failed to load past event attendees", err);
      } finally {
        setLoadingHistoryId(null);
      }
    }
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

      {showSuccessScreen ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 animate-fade-in-up">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Attendance saved successfully!</p>
            <p className="text-xs opacity-80">All records have been updated in the system.</p>
          </div>
        </div>
      ) : null}

      <Tabs defaultValue="mark" className="mt-6 space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-2 h-10">
          <TabsTrigger value="mark" className="text-xs sm:text-sm font-semibold">Mark Attendance</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm font-semibold">Attendance History</TabsTrigger>
        </TabsList>

        <TabsContent value="mark">
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
                            disabled={isAttendanceFinalized || Object.keys(overrides).length === 0}
                          >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Reset
                          </Button>
                          <Button
                            variant={isAttendanceFinalized ? "secondary" : "accent"}
                            size="sm"
                            className="rounded-full"
                            onClick={handleSave}
                            disabled={isAttendanceFinalized || Object.keys(overrides).length === 0}
                          >
                            {isAttendanceFinalized ? (
                              <>
                                <Lock className="mr-1.5 h-3.5 w-3.5" /> Finalized
                              </>
                            ) : (
                              <>
                                <Save className="mr-1.5 h-3.5 w-3.5" /> Save
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {isAttendanceFinalized && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border/80 bg-muted/50 px-3.5 py-2.5 text-xs font-semibold text-muted-foreground animate-fade-in-up">
                          <Lock className="h-4 w-4 shrink-0 text-amber-500" />
                          <span>Attendance has been recorded and finalized for this session. Editing is locked.</span>
                        </div>
                      )}

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {(["Present", "Absent"] as AttendanceResponse[]).map(
                          (response) => (
                            <div key={response}>
                              <div className="flex items-center justify-between text-sm">
                                <AttendanceBadge response={response} />
                                <span className="font-bold text-muted-foreground">
                                  {summary[response] || 0}
                                </span>
                              </div>
                              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                                <span
                                  className={cn(
                                    "block h-full rounded-full",
                                    response === "Present" && "bg-emerald-500",
                                    response === "Absent" && "bg-rose-500"
                                  )}
                                  style={{
                                    width: `${total > 0
                                        ? ((summary[response] || 0) / total) * 100
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
                            {response === "Present" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            {response} ({summary[response] || 0})
                          </button>
                        ))}
                      </div>
                      <AttendanceTable
                        records={filteredRecords}
                        onSetResponse={handleSetResponse}
                        readOnly={isAttendanceFinalized}
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
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">Past Sessions & Attendance Records</h2>
              <p className="text-xs text-muted-foreground">
                Review turnout and member participation for past practice sessions and matches.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card p-1 text-xs">
              <button
                type="button"
                onClick={() => setHistoryFilter("7d")}
                className={cn(
                  "rounded-full px-3 py-1 font-semibold transition-colors",
                  historyFilter === "7d"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                1 Week
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter("30d")}
                className={cn(
                  "rounded-full px-3 py-1 font-semibold transition-colors",
                  historyFilter === "30d"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter("90d")}
                className={cn(
                  "rounded-full px-3 py-1 font-semibold transition-colors",
                  historyFilter === "90d"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                90 Days
              </button>
            </div>
          </div>

          {pastEvents.length === 0 ? (
            <EmptyCard
              title="No past attendance records found"
              description={`No completed sessions found for ${
                historyFilter === "7d"
                  ? "the past 1 week"
                  : historyFilter === "30d"
                  ? "the past 30 days"
                  : "the past 90 days"
              }.`}
            />
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => {
                const group = groups.find((g) => g.id === event.groupId);
                const isExpanded = expandedHistoryEventId === event.id;
                const attendees = historyEventRecords[event.id] || [];
                const isLoadingAttendees = loadingHistoryId === event.id;
                const totalMembers = group?.memberCount || group?.members?.length || 0;

                const presentCount =
                  attendees.length > 0
                    ? attendees.filter((a) => (a.attendanceStatus || a.attendance_status) === "Present" || (a.attendanceStatus || a.attendance_status) === "Going").length
                    : event.attendance?.going || 0;
                const absentCount =
                  attendees.length > 0
                    ? attendees.filter((a) => (a.attendanceStatus || a.attendance_status) === "Absent" || (a.attendanceStatus || a.attendance_status) === "No response" || (a.attendanceStatus || a.attendance_status) === "Maybe").length
                    : (totalMembers ? Math.max(0, totalMembers - presentCount) : (event.attendance?.notResponded || 0));
                const effectiveTotal = totalMembers || (presentCount + absentCount) || 1;
                const turnoutPct = Math.round((presentCount / effectiveTotal) * 100);

                return (
                  <Card key={event.id} className="overflow-hidden p-5 transition-all">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{event.type}</Badge>
                          <Badge variant="outline">{event.status || "Completed"}</Badge>
                        </div>
                        <h3 className="mt-1.5 text-base font-bold tracking-tight">{event.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {group?.name ?? "—"} · {formatDate(event.date)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-foreground">
                            {presentCount > 0 ? `${turnoutPct}% Attendance` : "Attendance Saved"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {presentCount} / {totalMembers || (presentCount + absentCount) || "—"} attended
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleExpandHistory(event.id)}
                          className="rounded-full"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="mr-1 h-3.5 w-3.5" /> Hide attendees
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-1 h-3.5 w-3.5" /> View attendees
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" /> {presentCount} Present
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2.5 py-1 font-semibold text-rose-600 dark:text-rose-400">
                        <X className="h-3 w-3" /> {absentCount} Absent
                      </span>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 border-t border-border/70 pt-4 animate-fade-in-up">
                        {isLoadingAttendees ? (
                          <p className="py-4 text-center text-xs text-muted-foreground">
                            Loading attendance records...
                          </p>
                        ) : attendees.length === 0 ? (
                          <p className="py-3 text-xs text-muted-foreground">
                            No individual player turnout records stored for this session.
                          </p>
                        ) : (
                          <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
                            <div className="grid grid-cols-12 bg-muted/60 px-4 py-2.5 text-xs font-bold text-muted-foreground border-b border-border/60">
                              <div className="col-span-6 sm:col-span-7">Member Name</div>
                              <div className="col-span-3 sm:col-span-3">Role</div>
                              <div className="col-span-3 sm:col-span-2 text-right">Attendance</div>
                            </div>
                            <div className="divide-y divide-border/50">
                              {attendees.map((record, idx) => {
                                const userId = record.userId || record.user_id || "";
                                const member = group?.members?.find((m) => m.id === userId);
                                const memberName = member?.name || (userId ? `Player (${userId.slice(-4)})` : `Player ${idx + 1}`);
                                const rawStatus = record.attendanceStatus || record.attendance_status || "Absent";
                                const status: AttendanceResponse = (rawStatus === "Going" || rawStatus === "Present") ? "Present" : "Absent";

                                return (
                                  <div
                                    key={record.id || userId || idx}
                                    className="grid grid-cols-12 items-center px-4 py-2.5 text-xs hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="col-span-6 sm:col-span-7 font-bold flex items-center gap-2 min-w-0">
                                      <span className="truncate">{memberName}</span>
                                    </div>
                                    <div className="col-span-3 sm:col-span-3 text-muted-foreground truncate">
                                      {member?.role || "Member"}
                                    </div>
                                    <div className="col-span-3 sm:col-span-2 text-right">
                                      <AttendanceBadge response={status} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
