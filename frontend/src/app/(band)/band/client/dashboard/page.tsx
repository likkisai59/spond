"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { bandService } from "@/services/band";
import {
  CalendarRange,
  Heart,
  Music,
  Building2,
  ArrowRight,
  User,
  Sparkles,
  CheckCircle2,
  CalendarCheck2,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/ui/dashboard-card";
import Link from "next/link";

/**
 * Client Home — role landing page after login.
 *
 * Changes:
 *  - Added "My Bookings" summary card (Total, Upcoming, Completed) using live API
 *  - Added "Find Venues" quick action card linking to /venues
 *  - Improved contrast and spacing
 *  - Booking management remains at /client/bookings
 */
export default function ClientDashboardPage() {
  const { user } = useAuth();

  // Lightweight booking summary — fetches only counts using the existing API
  const [bookingSummary, setBookingSummary] = React.useState<{
    total: number;
    upcoming: number;
    completed: number;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function fetchSummary() {
      try {
        // Fetch in parallel: total count, accepted/confirmed (upcoming), completed
        const [all, accepted, completed] = await Promise.all([
          bandService.getMyBookings("customer"),
          bandService.getMyBookings("customer"),
          bandService.getMyBookings("customer"),
        ]);
        if (!cancelled) {
          setBookingSummary({
            total: all.length,
            upcoming: accepted.filter(b => b.status === "ACCEPTED").length,
            completed: completed.filter(b => b.status === "COMPLETED").length,
          });
        }
      } catch {
        // Non-critical — summary is decorative; fail silently
        if (!cancelled) setBookingSummary({ total: 0, upcoming: 0, completed: 0 });
      }
    }
    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Home</h1>
          <p className="text-xs text-muted-foreground">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! Discover artists, manage your
            bookings, and find amazing venues.
          </p>
        </div>
      </div>

      {/* My Bookings Summary Card */}
      <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary" />
            My Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                title: "Total",
                value: bookingSummary !== null ? bookingSummary.total : "—",
                className: "bg-accent/30 border-border",
                label: "Total",
              },
              {
                title: "Upcoming",
                value: bookingSummary !== null ? bookingSummary.upcoming : "—",
                icon: CalendarCheck2,
                className: "bg-emerald-500/10 border-emerald-500/20",
                label: "Upcoming",
                iconClassName: "h-4 w-4 text-emerald-400",
              },
              {
                title: "Completed",
                value: bookingSummary !== null ? bookingSummary.completed : "—",
                icon: CheckCircle2,
                className: "bg-primary/10 border-primary/20",
                label: "Completed",
                iconClassName: "h-4 w-4 text-primary",
              },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.title}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${metric.className}`}
                >
                  {Icon && <Icon className={`${metric.iconClassName} mb-0.5`} />}
                  <span className="text-2xl font-black text-foreground">{metric.value}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {metric.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Link href="/band/client/bookings">
              <Button variant="outline" size="sm" className="text-xs w-full font-bold h-9">
                View All Bookings
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "My Bookings",
              description: "Manage your event requests",
              href: "/band/client/bookings",
              value: bookingSummary !== null ? bookingSummary.total : "—",
              icon: CalendarRange,
              iconClassName: "text-primary",
              iconBgClassName: "bg-primary/10 group-hover:bg-primary/20",
            },
            {
              title: "Find Artist",
              description: "Discover performers for your event",
              href: "/band/marketplace/artists",
              icon: Music,
              iconClassName: "text-secondary",
              iconBgClassName: "bg-secondary/10 group-hover:bg-secondary/20",
            },
            {
              title: "Find Venues",
              description: "Browse event spaces near you",
              href: "/band/marketplace/venues",
              icon: Building2,
              iconClassName: "text-secondary",
              iconBgClassName: "bg-secondary/10 group-hover:bg-secondary/20",
            },
            {
              title: "Favourites",
              description: "Your saved artists and venues",
              href: "/band/client/favorites",
              icon: Heart,
              iconClassName: "text-primary",
              iconBgClassName: "bg-primary/10 group-hover:bg-primary/20",
            },
          ].map((action) => (
            <DashboardCard
              key={action.title}
              title={action.title}
              description={action.description}
              href={action.href}
              icon={action.icon}
              iconClassName={action.iconClassName}
              iconBgClassName={action.iconBgClassName}
              actionIcon={
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-current transition-colors" />
              }
              className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl"
            />
          ))}
        </div>
      </div>

      {/* Account Overview + Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">Name</span>
              <span className="text-xs font-bold text-foreground">{user?.firstName || "—"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">Email</span>
              <span className="text-xs font-bold text-foreground truncate max-w-45">
                {user?.email || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground">Account Type</span>
              <span className="text-xs font-bold text-foreground capitalize">
                {user?.role || "Client"}
              </span>
            </div>
            <div className="pt-2">
              <Link href="/band/client/profile">
                <Button variant="outline" size="sm" className="text-xs w-full font-bold flex items-center justify-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10">
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Profile Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {[
              {
                step: "1",
                label: "Browse artists in the marketplace",
                href: "/band/marketplace/artists",
              },
              {
                step: "2",
                label: "Find a venue for your event",
                href: "/band/marketplace/venues",
              },
              {
                step: "3",
                label: "Create a booking request",
                href: "/band/client/bookings",
              },
              {
                step: "4",
                label: "Complete your profile",
                href: "/band/client/settings",
              },
            ].map((item) => {
              return (
                <Link
                  key={item.step}
                  href={item.href}
                  className="flex items-center gap-3 hover:text-foreground transition-colors group"
                >
                  <span className="h-6 w-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    {item.step}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                    {item.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
