"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CreditCard,
  MessageSquare,
  Award,
  CalendarDays,
  Vote,
  Users,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import {
  StatsCard,
  EventCard,
  PaymentCard,
  PollCard,
  QuickActionCard,
  RsvpCard,
} from "./index";
import { PaymentModal } from "./payment-modal";
import { formatCurrency } from "@/utils/helpers";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/constants";
import { useAuth } from "@/hooks";
import { canAccessFeature } from "../utils/permissions";
import type { SportsEvent, PaymentRequest, SportsPoll, SportsGroup } from "@/types";

export interface MemberDashboardViewProps {
  userName?: string;
  groups: SportsGroup[];
  upcomingEvents: SportsEvent[];
  pendingPayments: PaymentRequest[];
  activePolls: SportsPoll[];
  unreadMessagesCount: number;
}

export function MemberDashboardView({
  userName,
  groups,
  upcomingEvents,
  pendingPayments,
  activePolls,
  unreadMessagesCount,
}: MemberDashboardViewProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const { user: currentUser } = useAuth();

  const getUserRoleInGroup = (group: SportsGroup): string => {
    if (!currentUser) return "member";
    const currentUserId = currentUser.id || (currentUser as any)._id;
    const currentUserEmail = currentUser.email?.toLowerCase().trim();

    if (group.createdBy && group.createdBy === currentUserId) return "owner";
    if (group.created_by && group.created_by === currentUserId) return "owner";

    const member = (group.members ?? []).find((m: any) => {
      if (m.userId && m.userId === currentUserId) return true;
      if (m.user_id && m.user_id === currentUserId) return true;
      if (m.id && m.id === currentUserId) return true;
      if (m.email && currentUserEmail && m.email.toLowerCase().trim() === currentUserEmail) return true;
      return false;
    });

    if (member?.role) {
      return member.role.toLowerCase().trim();
    }

    if (currentUser.role === "admin" && (group.createdBy === currentUserId || group.created_by === currentUserId)) {
      return "owner";
    }

    return "member";
  };

  const memberGroups = groups.filter((g) => {
    if (currentUser?.role === "player" && (g.createdBy === currentUser.id || g.created_by === currentUser.id)) {
      return false;
    }
    return true;
  });
  const activeGroups = memberGroups.length > 0 ? memberGroups : groups;

  const canAccessEvents = activeGroups.length === 0 || activeGroups.some((g) => canAccessFeature(g, getUserRoleInGroup(g), "events"));
  const canAccessPolls = activeGroups.length === 0 || activeGroups.some((g) => canAccessFeature(g, getUserRoleInGroup(g), "polls"));
  const canAccessPayments = activeGroups.length === 0 || activeGroups.some((g) => canAccessFeature(g, getUserRoleInGroup(g), "payments"));
  const canAccessChat = activeGroups.length === 0 || activeGroups.some((g) => canAccessFeature(g, getUserRoleInGroup(g), "chat"));

  const filteredUpcomingEvents = upcomingEvents.filter((event) => {
    const g = groups.find((grp) => grp.id === event.groupId);
    return !g || canAccessFeature(g, getUserRoleInGroup(g), "events");
  });

  const filteredActivePolls = activePolls.filter((poll) => {
    const g = groups.find((grp) => grp.id === poll.groupId);
    return !g || canAccessFeature(g, getUserRoleInGroup(g), "polls");
  });

  const filteredPendingPayments = pendingPayments.filter((payment) => {
    const g = groups.find((grp) => grp.id === payment.groupId);
    return !g || canAccessFeature(g, getUserRoleInGroup(g), "payments");
  });

  const groupNames = Object.fromEntries(groups.map((g) => [g.id, g.name]));
  const nextEvent = filteredUpcomingEvents[0];
  const dueAmount = filteredPendingPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Member Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="My upcoming events"
          value={canAccessEvents ? filteredUpcomingEvents.length : "Locked"}
          icon={canAccessEvents ? CalendarCheck : Lock}
          className={cn("animate-fade-in-up", !canAccessEvents && "opacity-80")}
        />
        <StatsCard
          label="My clubs & groups"
          value={groups.length}
          icon={Users}
          className="animate-fade-in-up [animation-delay:60ms]"
        />
        <StatsCard
          label="Pending dues"
          value={!canAccessPayments ? "Locked" : filteredPendingPayments.length > 0 ? formatCurrency(dueAmount) : "₹0"}
          icon={canAccessPayments ? CreditCard : Lock}
          className={cn("animate-fade-in-up [animation-delay:120ms]", !canAccessPayments && "opacity-80")}
        />
        <StatsCard
          label="Unread messages"
          value={canAccessChat ? unreadMessagesCount : "Locked"}
          icon={canAccessChat ? MessageSquare : Lock}
          className={cn("animate-fade-in-up [animation-delay:180ms]", !canAccessChat && "opacity-80")}
        />
      </div>

      {/* 2. Next Fixture RSVP Banner */}
      {canAccessEvents && nextEvent ? (
        <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-transparent p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-0.5 text-xs font-bold text-accent">
                Next Upcoming Fixture
              </span>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                {nextEvent.name}
              </h2>
              <p className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  {nextEvent.date} · {nextEvent.startTime}
                </span>
                {nextEvent.location ? (
                  <span>· {nextEvent.location}</span>
                ) : null}
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <RsvpCard
                eventId={nextEvent.id}
                eventName={nextEvent.name}
                className="border-primary/20 bg-card/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Upcoming Schedule & Active Polls */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Events Column */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">
              My Schedule
            </h2>
            {canAccessEvents && (
              <Button asChild variant="link" size="sm">
                <Link href={ROUTES.SPORTS_EVENTS}>View all</Link>
              </Button>
            )}
          </div>
          {!canAccessEvents ? (
            <EmptyCard
              icon={Lock}
              title="Only club admin can see this"
              description="Events and matches have been turned off for your role by the club administrator."
            />
          ) : filteredUpcomingEvents.length > 0 ? (
            <div className="grid gap-4">
              {filteredUpcomingEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No upcoming matches"
              description="You have no matches or training sessions scheduled right now."
            />
          )}
        </section>

        {/* Polls Column */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">
              Team Polls
            </h2>
            {canAccessPolls && (
              <Button asChild variant="link" size="sm">
                <Link href={ROUTES.SPORTS_POLLS}>View all</Link>
              </Button>
            )}
          </div>
          {!canAccessPolls ? (
            <EmptyCard
              icon={Lock}
              title="Only club admin can see this"
              description="Polls and team voting have been turned off for your role by the club administrator."
            />
          ) : filteredActivePolls.length > 0 ? (
            <div className="grid gap-4">
              {filteredActivePolls.slice(0, 2).map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  groupName={groupNames[poll.groupId]}
                />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No active polls"
              description="There are no active votes right now across your teams."
            />
          )}
        </section>
      </div>

      {/* 4. Pending Payments & Quick Actions */}
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">
              My Fees & Payments
            </h2>
            {canAccessPayments && (
              <Button asChild variant="link" size="sm">
                <Link href={ROUTES.SPORTS_PAYMENTS}>History</Link>
              </Button>
            )}
          </div>
          {!canAccessPayments ? (
            <EmptyCard
              icon={Lock}
              title="Only club admin can see this"
              description="Payments and dues have been turned off for your role by the club administrator."
            />
          ) : filteredPendingPayments.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                You have {filteredPendingPayments.length} pending request(s) totaling{" "}
                <span className="font-bold text-foreground">
                  {formatCurrency(dueAmount)}
                </span>
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredPendingPayments.slice(0, 4).map((payment) => (
                  <div key={payment.id} className="relative flex flex-col">
                    <PaymentCard
                      payment={payment}
                      groupName={groupNames[payment.groupId]}
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() => setSelectedPayment(payment)}
                      >
                        Pay Now ({formatCurrency(payment.amount)})
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyCard
              title="All settled"
              description="You have no outstanding membership fees or payments."
            />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-extrabold tracking-tight">Quick Actions</h2>
          <div className="grid gap-3">
            {canAccessChat && (
              <QuickActionCard
                label="Team Chat"
                description="Talk tactics and stay in touch"
                icon={MessageSquare}
                href={ROUTES.SPORTS_MESSAGES}
              />
            )}
            {canAccessEvents && (
              <QuickActionCard
                label="Training Calendar"
                description="Check venues, times and match dates"
                icon={CalendarCheck}
                href={ROUTES.SPORTS_EVENTS}
              />
            )}
            {canAccessPolls && (
              <QuickActionCard
                label="Team Polls"
                description="Vote on group decisions"
                icon={Vote}
                href={ROUTES.SPORTS_POLLS}
              />
            )}
            <QuickActionCard
              label="My Teams"
              description="View groups and teammates roster"
              icon={Users}
              href={ROUTES.SPORTS_GROUPS}
            />
          </div>
        </section>
      </div>

      {/* Payment Modal */}
      {selectedPayment ? (
        <PaymentModal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          payment={selectedPayment}
          groupName={groupNames[selectedPayment.groupId]}
        />
      ) : null}
    </div>
  );
}
