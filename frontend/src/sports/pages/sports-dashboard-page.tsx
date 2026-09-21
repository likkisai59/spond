"use client";

import Link from "next/link";
import {
  CalendarPlus,
  CreditCard,
  MessageSquare,
  UserPlus,
  Users,
  Vote,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks";
import { apiClient } from "@/services/api-client";
import { useAppSelector } from "@/store/hooks";
import {
  selectActivePolls,
  selectPendingPayments,
  selectRecentActivity,
  selectUpcomingEvents,
  selectAllGroups,
} from "@/store/sports/selectors";
import { MOCK_ATTENDANCE_TREND, MOCK_PAYMENT_TREND } from "@/data";
import {
  ActivityFeed,
  AttendanceChart,
  EventCard,
  PaymentCard,
  PaymentTrendChart,
  PollCard,
  QuickActionCard,
  StatsCard,
} from "../components";
import { ROUTES } from "@/constants";
import { formatCurrency } from "@/utils/helpers";

export function SportsDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const [realStats, setRealStats] = useState({
    groups: 0,
    events: 0,
    members: 0,
    paymentsDue: 0,
    unreadMessages: 0,
  });

  useEffect(() => {

    const fetchStats = async () => {
      try {
        const response = await apiClient.get("/api/v1/sports/dashboard");
        const data = response?.data?.overview || response?.data || {};
        setRealStats({
          groups: data.groups || 0,
          events: data.events || 0,
          members: data.members || 0,
          paymentsDue: data.paymentsDue || 0,
          unreadMessages: data.unreadMessages || 0,
        });
      } catch (_error) {
        // Silently fallback to defaults on sports dashboard
      }
    };
    fetchStats();
  }, [user, router]);

  const groups = useAppSelector(selectAllGroups);
  const upcomingEvents = useAppSelector(selectUpcomingEvents);
  const recentActivity = useAppSelector(selectRecentActivity);
  const activePolls = useAppSelector(selectActivePolls);
  const pendingPayments = useAppSelector(selectPendingPayments);

  const groupNames = Object.fromEntries(groups.map((g) => [g.id, g.name]));
  const nextEvents = upcomingEvents.slice(0, 3);
  const dashboardPolls = activePolls.slice(0, 2);
  const dueAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  if (user?.role === "venue_owner") {
    return null;
  }

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Dashboard" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title={`Welcome back, ${mounted && user?.fullName ? user.fullName.split(" ")[0] : "Coach"}`}
        description="Here's what's happening across your groups today."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={ROUTES.SPORTS_EVENTS_CREATE}>
                <CalendarPlus />
                New event
              </Link>
            </Button>
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_GROUPS_CREATE}>
                <UserPlus />
                New group
              </Link>
            </Button>
          </>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard label="Groups" value={realStats.groups} icon={Users} className="animate-fade-in-up" />
        <StatsCard
          label="Upcoming events"
          value={realStats.events}
          icon={CalendarPlus}
          className="animate-fade-in-up [animation-delay:60ms]"
        />
        <StatsCard label="Members" value={realStats.members} icon={UserPlus} className="animate-fade-in-up [animation-delay:120ms]" />
        <StatsCard
          label="Payments due"
          value={realStats.paymentsDue}
          icon={CreditCard}
          className="animate-fade-in-up [animation-delay:180ms]"
        />
        <StatsCard
          label="Unread messages"
          value={realStats.unreadMessages}
          icon={MessageSquare}
          className="animate-fade-in-up [animation-delay:240ms]"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in-up p-6">
          <h2 className="text-lg font-extrabold tracking-tight">
            Attendance trend
          </h2>
          <p className="text-sm text-muted-foreground">
            Turnout across your groups, last 8 weeks.
          </p>
          <AttendanceChart data={MOCK_ATTENDANCE_TREND} className="mt-5" />
        </Card>
        <Card className="animate-fade-in-up p-6 [animation-delay:80ms]">
          <h2 className="text-lg font-extrabold tracking-tight">
            Payment collection trend
          </h2>
          <p className="text-sm text-muted-foreground">
            Collected vs pending amounts, last 6 months.
          </p>
          <PaymentTrendChart data={MOCK_PAYMENT_TREND} className="mt-5" />
        </Card>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">
              Upcoming events
            </h2>
            <Button asChild variant="link" size="sm">
              <Link href={ROUTES.SPORTS_EVENTS}>View all</Link>
            </Button>
          </div>
          {nextEvents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {nextEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No upcoming events"
              description="Schedule your next session and members will be notified instantly."
            />
          )}

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-extrabold tracking-tight">Recent polls</h2>
            <Button asChild variant="link" size="sm">
              <Link href={ROUTES.SPORTS_POLLS}>View all</Link>
            </Button>
          </div>
          {dashboardPolls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {dashboardPolls.map((poll) => (
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
              description="Create a poll to gather votes from your members."
            />
          )}
        </section>

        <ActivityFeed activities={recentActivity} max={6} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">
              Pending payments
            </h2>
            <Button asChild variant="link" size="sm">
              <Link href={ROUTES.SPORTS_PAYMENTS}>View all</Link>
            </Button>
          </div>
          {pendingPayments.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {pendingPayments.length} open requests ·{" "}
                <span className="font-bold text-foreground">
                  {formatCurrency(dueAmount)}
                </span>{" "}
                outstanding
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {pendingPayments.slice(0, 4).map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    groupName={groupNames[payment.groupId]}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyCard
              title="All settled"
              description="No pending payment requests. Great job keeping finances tidy."
            />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-extrabold tracking-tight">Quick actions</h2>
          <div className="grid gap-3">
            <QuickActionCard
              label="Create event"
              description="Schedule a session or match"
              icon={CalendarPlus}
              href={ROUTES.SPORTS_EVENTS_CREATE}
            />
            <QuickActionCard
              label="Create poll"
              description="Gather member votes"
              icon={Vote}
              href={ROUTES.SPORTS_POLLS_CREATE}
            />
            <QuickActionCard
              label="Request payment"
              description="Collect fees from members"
              icon={CreditCard}
              href={ROUTES.SPORTS_PAYMENTS_CREATE}
            />
            <QuickActionCard
              label="Create group"
              description="Start a new team"
              icon={UserPlus}
              href={ROUTES.SPORTS_GROUPS_CREATE}
            />
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
