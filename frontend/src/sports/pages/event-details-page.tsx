"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Clock,
  MapPin,
  MessageSquare,
  Paperclip,
  Send,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchEventsThunk } from "@/store/sports/events-slice";
import { fetchGroupsThunk } from "@/store/sports/groups-slice";
import {
  selectAllFiles,
  selectEventById,
  selectGroupById,
} from "@/store/sports/selectors";
import { AttendanceBadge, AttendanceChart, AttendanceTracker, FileCard, RsvpCard, StatusBadge } from "../components";
import { MOCK_ATTENDANCE_TREND } from "@/data";
import type { AttendanceResponse, SportsEvent } from "@/types";
import { formatDate, formatRelative } from "@/utils/date";
import { getInitials, formatTime } from "@/utils/helpers";
import { ROUTES } from "@/constants";

interface EventComment {
  id: string;
  author: string;
  content: string;
  postedAt: string;
}

const MOCK_COMMENTS: EventComment[] = [
  { id: "cmt-1", author: "Rohan Verma", content: "Warm-up starts 30 minutes before kick-off.", postedAt: "2026-08-19T15:00:00.000Z" },
  { id: "cmt-2", author: "Vihaan Rao", content: "Car pool from the club house at 4 PM, two seats free.", postedAt: "2026-08-19T17:20:00.000Z" },
];

export function EventDetailsPage() {
  const params = useParams<{ eventId: string }>();
  const dispatch = useAppDispatch();
  const event = useAppSelector((state) => selectEventById(state, params.eventId));
  const group = useAppSelector((state) =>
    selectGroupById(state, event?.groupId ?? "")
  );
  const files = useAppSelector(selectAllFiles);

  useEffect(() => {
    dispatch(fetchEventsThunk());
    dispatch(fetchGroupsThunk());
  }, [dispatch]);

  const [comments, setComments] = useState<EventComment[]>(MOCK_COMMENTS);
  const [commentDraft, setCommentDraft] = useState("");

  const eventFiles = useMemo(
    () => files.filter((file) => file.groupId === event?.groupId),
    [files, event?.groupId]
  );

  const attendees = useMemo(() => {
    const members = group?.members ?? [];
    if (members.length > 0) {
      return members.map((member) => ({
        member,
        response: ((event?.attendance?.going ?? 0) > 0 ? "Going" : "Going") as AttendanceResponse,
      }));
    }
    return [
      {
        member: {
          id: "dev-user-1",
          name: "Santhosh",
          role: "Owner" as const,
          status: "Active" as const,
          joinedAt: new Date().toISOString(),
        },
        response: ((event?.attendance?.going ?? 0) > 0 ? "Going" : "Going") as AttendanceResponse,
      },
    ];
  }, [group, event]);

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

  const total =
    event.attendance.going + event.attendance.maybe + event.attendance.notResponded;

  const handlePostComment = () => {
    const content = commentDraft.trim();
    if (content.length === 0) return;
    setComments((current) => [
      ...current,
      { id: `cmt-${Date.now()}`, author: "You", content, postedAt: new Date().toISOString() },
    ]);
    setCommentDraft("");
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

      <PageHeaderLikeTitle event={event} groupName={group?.name} />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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

          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">Responses</h2>
            <div className="mt-4 space-y-3">
              {(
                [
                  { label: "Going", value: event.attendance.going, bar: "bg-emerald-500" },
                  { label: "Maybe", value: event.attendance.maybe, bar: "bg-amber-400" },
                  {
                    label: "No response",
                    value: event.attendance.notResponded,
                    bar: "bg-zinc-300",
                  },
                ] as const
              ).map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm">
                    <AttendanceBadge response={row.label as AttendanceResponse} />
                    <span className="font-bold text-muted-foreground">
                      {row.value}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <span
                      className={`block h-full rounded-full ${row.bar}`}
                      style={{ width: `${total > 0 ? (row.value / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {event.status !== "Cancelled" ? (
            <Card className="animate-fade-in-up p-6 sm:p-7">
              <h2 className="text-lg font-extrabold tracking-tight">
                Attendance trend
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Turnout across recent sessions for {group?.name ?? "this group"}.
              </p>
              <AttendanceChart data={MOCK_ATTENDANCE_TREND} className="mt-5" />
            </Card>
          ) : null}

          {event.status !== "Cancelled" ? (
            <AttendanceTracker
              members={group?.members ?? []}
              eventName={event.name}
              className="animate-fade-in-up"
            />
          ) : null}

          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">Comments</h2>
            <div className="mt-4 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getInitials(comment.author)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 rounded-xl bg-muted/50 px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-bold">{comment.author}</p>
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelative(comment.postedAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <Input
                value={commentDraft}
                onChange={(changeEvent) => setCommentDraft(changeEvent.target.value)}
                placeholder="Write a comment…"
                aria-label="Write a comment"
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === "Enter") handlePostComment();
                }}
              />
              <Button variant="accent" onClick={handlePostComment} aria-label="Post comment">
                <Send />
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <RsvpCard
            eventId={event.id}
            eventName={event.name}
            onRsvpSuccess={() => dispatch(fetchEventsThunk())}
            className="animate-fade-in-up"
          />

          <Card className="animate-fade-in-up p-6">
            <h2 className="text-lg font-extrabold tracking-tight">Attendees</h2>
            {attendees.length > 0 ? (
              <ul className="mt-4 space-y-3.5">
                {attendees.map(({ member, response }) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{member.name}</p>
                      <AttendanceBadge response={response} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No members to display yet.
              </p>
            )}
          </Card>

          <Card className="animate-fade-in-up p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <Paperclip className="h-4 w-4 text-accent" />
              Files
            </h2>
            {eventFiles.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {eventFiles.slice(0, 4).map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No files attached to this group yet.
              </p>
            )}
          </Card>

          <Card className="animate-fade-in-up p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <MessageSquare className="h-4 w-4 text-accent" />
              Group chat
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Coordinate logistics in the {group?.name ?? "group"} conversation.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 w-full rounded-full"
            >
              <Link href={ROUTES.SPORTS_MESSAGES}>Open messages</Link>
            </Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function PageHeaderLikeTitle({
  event,
  groupName,
}: {
  event: SportsEvent;
  groupName?: string;
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
        {event.type === "Match" ? (
          <Button asChild variant="accent">
            <Link href={`${ROUTES.SPORTS}/matches/${event.id}/summary`}>
              Match summary
            </Link>
          </Button>
        ) : null}
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
