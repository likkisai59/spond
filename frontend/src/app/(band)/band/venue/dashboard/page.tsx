"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { getUserDisplayName } from "@/utils/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  CalendarDays,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Inbox,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { useVenueDashboard } from "@/hooks/use-venue-dashboard";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  loading: boolean;
}) {
  return (
    <Card className={`border ${accent} rounded-2xl shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-black text-foreground">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VenueDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useVenueDashboard();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading your venue dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <ErrorState
          title="Dashboard Load Failure"
          message={error || "An unexpected error occurred while loading your dashboard."}
          onRetry={refetch}
        />
      </div>
    );
  }

  const formatCurrency = (amount: number = 0) =>
    `₹${amount.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Venue Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {getUserDisplayName(user, "Venue Owner")}. Here is your live overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="text-xs h-9 gap-1.5 font-bold">
            <Link href="/band/venue/profile?tab=edit">
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={refetch} className="text-xs h-9 gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={data.total_bookings} icon={CalendarDays} accent="border-primary/20 bg-primary/5" loading={loading} />
        <StatCard title="Pending Requests" value={data.pending_requests_count} icon={MessageSquare} accent="border-orange-400/20 bg-orange-400/5" loading={loading} />
        <StatCard title="Confirmed / Upcoming" value={data.upcoming_events_count} icon={CheckCircle2} accent="border-emerald-500/20 bg-emerald-500/5" loading={loading} />
        <StatCard title="Total Revenue" value={loading ? "—" : formatCurrency(data.total_earnings || 0)} icon={IndianRupee} accent="border-violet-500/20 bg-violet-500/5" loading={loading} />
      </div>

      {/* Pending Booking Requests */}
      <Card className="rounded-2xl border border-border bg-card/60 backdrop-blur shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Inbox className="h-4 w-4 text-primary" />
            Upcoming Events
          </CardTitle>
          <Link href="/band/venue/bookings">
            <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : data.upcoming_events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No upcoming events right now.
            </div>
          ) : (
            data.upcoming_events.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/30 border border-border">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">
                    Booking #{event.id?.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.date} · {event.client_name}
                  </p>
                </div>
                <Link href="/band/venue/bookings">
                  <Button size="sm" className="text-xs h-7 px-3">View</Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Status Summary Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "REQUESTS", count: data.pending_requests_count, color: "text-orange-400" },
          { label: "UPCOMING", count: data.upcoming_events_count, color: "text-emerald-400" },
          { label: "TOTAL", count: data.total_bookings, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-accent/20 p-3">
            <div className={`text-xl font-black ${s.color}`}>{loading ? "—" : s.count}</div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
