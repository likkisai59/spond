"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Mail,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard, StatCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { useAppSelector } from "@/store/hooks";
import {
  selectAllGroups,
  selectAllPayments,
  selectUpcomingEvents,
} from "@/store/sports/selectors";
import {
  ActivityCard,
  GroupCard,
  MemberRoleBadge,
  StatusBadge,
} from "../components";
import { MOCK_ACTIVITY } from "../mocks/activity.mock";
import { MOCK_TRANSACTIONS } from "../mocks/transactions.mock";
import { formatDate } from "@/utils/date";
import { formatCurrency, formatTime, getInitials } from "@/utils/helpers";
import { ROUTES } from "@/constants";
import type { PaymentRequest, PaymentStatus, SportsEvent } from "@/types";

const EventRsvpModal = dynamic(
  () => import("../components/event-rsvp-modal").then((m) => m.EventRsvpModal),
  { ssr: false, loading: () => null }
);

function memberPaymentStatus(
  payment: PaymentRequest,
  memberName: string
): PaymentStatus {
  const paid = MOCK_TRANSACTIONS.some(
    (txn) =>
      txn.paymentId === payment.id &&
      txn.memberName === memberName &&
      txn.status === "Success"
  );
  if (paid) return "Paid";
  if (payment.dueDate < new Date().toISOString().slice(0, 10)) {
    return "Overdue";
  }
  return "Pending";
}

export function MemberProfilePage() {
  const params = useParams<{ memberId: string }>();
  const memberId = params.memberId;

  const groups = useAppSelector(selectAllGroups);
  const upcomingEvents = useAppSelector(selectUpcomingEvents);
  const payments = useAppSelector(selectAllPayments);

  const [rsvpEvent, setRsvpEvent] = useState<SportsEvent | null>(null);

  const member = useMemo(
    () => groups.flatMap((group) => group.members).find((m) => m.id === memberId),
    [groups, memberId]
  );

  const memberGroups = useMemo(
    () =>
      member
        ? groups.filter((group) =>
            group.members.some((m) => m.id === member.id)
          )
        : [],
    [groups, member]
  );

  const groupIds = useMemo(
    () => memberGroups.map((group) => group.id),
    [memberGroups]
  );

  const memberEvents = useMemo(
    () =>
      member
        ? upcomingEvents.filter((event) => groupIds.includes(event.groupId))
        : [],
    [member, upcomingEvents, groupIds]
  );

  const memberPayments = useMemo(() => {
    if (!member) return [];
    return payments
      .filter((payment) => groupIds.includes(payment.groupId))
      .map((payment) => ({
        payment,
        group: memberGroups.find((g) => g.id === payment.groupId),
        memberStatus: memberPaymentStatus(payment, member.name),
      }));
  }, [member, payments, groupIds, memberGroups]);

  const memberActivity = useMemo(
    () =>
      member
        ? MOCK_ACTIVITY.filter((item) => item.actor === member.name)
        : [],
    [member]
  );

  if (!member) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "Sports", href: ROUTES.SPORTS },
            { label: "Groups", href: ROUTES.SPORTS_GROUPS },
            { label: "Member not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          title="Member not found"
          description="This member may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_GROUPS}>Back to groups</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const primaryGroup = memberGroups[0];
  const pendingPayments = memberPayments.filter(
    (entry) => entry.memberStatus !== "Paid"
  ).length;

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          ...(primaryGroup
            ? [
                {
                  label: primaryGroup.name,
                  href: `${ROUTES.SPORTS_GROUPS}/${primaryGroup.id}`,
                },
                {
                  label: "Members",
                  href: `${ROUTES.SPORTS_GROUPS}/${primaryGroup.id}/members`,
                },
              ]
            : [{ label: "Members" }]),
          { label: member.name },
        ]}
        className="mb-4"
      />

      <Card className="animate-fade-in-up p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 rounded-3xl">
            <AvatarFallback className="rounded-3xl text-xl">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
                {member.name}
              </h1>
              <MemberRoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <span className="truncate">{member.email}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-accent" />
                Joined {formatDate(member.joinedAt)}
              </span>
            </div>
          </div>
          {primaryGroup ? (
            <Button asChild variant="outline" className="shrink-0 rounded-full">
              <Link
                href={`${ROUTES.SPORTS_GROUPS}/${primaryGroup.id}/members`}
              >
                All members
              </Link>
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Groups joined"
          value={memberGroups.length}
          icon={Users}
          className="animate-fade-in-up"
        />
        <StatCard
          label="Upcoming events"
          value={memberEvents.length}
          icon={CalendarDays}
          className="animate-fade-in-up [animation-delay:100ms]"
        />
        <StatCard
          label="Payments pending"
          value={pendingPayments}
          icon={CreditCard}
          className="animate-fade-in-up [animation-delay:200ms]"
        />
        <StatCard
          label="Activity entries"
          value={memberActivity.length}
          icon={Clock}
          className="animate-fade-in-up [animation-delay:300ms]"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-extrabold tracking-tight">
              Upcoming events
            </h2>
            {memberEvents.length > 0 ? (
              <div className="space-y-3">
                {memberEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{event.type}</Badge>
                        <StatusBadge status={event.status} />
                      </div>
                      <Link
                        href={`${ROUTES.SPORTS_EVENTS}/${event.id}`}
                        className="mt-1.5 block truncate text-sm font-bold transition-colors hover:text-accent"
                      >
                        {event.name}
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-accent" />
                          {formatDate(event.date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-accent" />
                          {formatTime(event.startTime)}
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-full"
                      onClick={() => setRsvpEvent(event)}
                    >
                      Respond
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No upcoming events"
                description="Events from this member's groups will appear here."
              />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-extrabold tracking-tight">
              Groups joined
            </h2>
            {memberGroups.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {memberGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    nextEvent={memberEvents.find(
                      (event) => event.groupId === group.id
                    )}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No groups"
                description="This member is not part of any group yet."
              />
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-extrabold tracking-tight">
              Payment status
            </h2>
            {memberPayments.length > 0 ? (
              <div className="space-y-3">
                {memberPayments.map(({ payment, group, memberStatus }) => (
                  <Card key={payment.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`${ROUTES.SPORTS_PAYMENTS}/${payment.id}`}
                        className="truncate text-sm font-bold transition-colors hover:text-accent"
                      >
                        {payment.title}
                      </Link>
                      <StatusBadge status={memberStatus} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatCurrency(payment.amount)} · due{" "}
                      {formatDate(payment.dueDate)}
                      {group ? ` · ${group.name}` : ""}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No payment requests"
                description="Payments from this member's groups will appear here."
              />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-extrabold tracking-tight">
              Activity summary
            </h2>
            {memberActivity.length > 0 ? (
              <div className="space-y-3">
                {memberActivity.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No recent activity"
                description="Actions by this member will appear here."
              />
            )}
          </section>
        </div>
      </div>

      <EventRsvpModal
        open={rsvpEvent !== null}
        onOpenChange={(open) => !open && setRsvpEvent(null)}
        eventName={rsvpEvent?.name ?? ""}
        eventDate={rsvpEvent?.date}
        eventTime={rsvpEvent?.startTime}
      />
    </PageContainer>
  );
}
