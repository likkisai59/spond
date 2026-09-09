"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { bandService } from "@/services/band";
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
import type { Booking } from "@/types/band";

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
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await bandService.getMyBookings("provider");
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalBookings = bookings.length;
  const pending = bookings.filter((b) => b.status === "REQUESTED").length;
  const accepted = bookings.filter(
    (b) => b.status === "ACCEPTED" || b.status === "CONFIRMED"
  ).length;
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const recentRequests = bookings
    .filter((b) => b.status === "REQUESTED")
    .slice(0, 5);

  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Venue Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.firstName || "Venue Owner"}. Here is your live overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="text-xs h-9 gap-1.5 font-bold">
            <Link href="/band/venue/profile?tab=edit">
              <Edit3 className="h-3.5 w-3.5" />
              Edit Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} className="text-xs h-9 gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={totalBookings} icon={CalendarDays} accent="border-primary/20 bg-primary/5" loading={loading} />
        <StatCard title="Pending Requests" value={pending} icon={MessageSquare} accent="border-orange-400/20 bg-orange-400/5" loading={loading} />
        <StatCard title="Confirmed / Upcoming" value={accepted} icon={CheckCircle2} accent="border-emerald-500/20 bg-emerald-500/5" loading={loading} />
        <StatCard title="Total Revenue" value={loading ? "—" : formatCurrency(totalRevenue)} icon={IndianRupee} accent="border-violet-500/20 bg-violet-500/5" loading={loading} />
      </div>

      {/* Pending Booking Requests */}
      <Card className="rounded-2xl border border-border bg-card/60 backdrop-blur shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Inbox className="h-4 w-4 text-primary" />
            Pending Booking Requests
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
          ) : recentRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No pending booking requests right now.
            </div>
          ) : (
            recentRequests.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/30 border border-border">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">
                    Booking #{booking.id?.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {booking.event_date} · {formatCurrency(booking.total_amount || 0)}
                  </p>
                </div>
                <Link href="/band/venue/bookings">
                  <Button size="sm" className="text-xs h-7 px-3">Review</Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Status Summary Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "REQUESTED", count: pending, color: "text-orange-400" },
          { label: "ACCEPTED", count: accepted, color: "text-emerald-400" },
          { label: "COMPLETED", count: completed, color: "text-primary" },
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
