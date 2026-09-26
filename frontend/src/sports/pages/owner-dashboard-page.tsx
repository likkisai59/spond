"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCard } from "../components";
import { Building2, CalendarCheck, Clock, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/constants";
import { venuesService, bookingsService } from "@/services/sports";

export function OwnerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [venuesCount, setVenuesCount] = useState(0);
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
  });

  useEffect(() => {
    if (user?.role === "member" || user?.role === "user") {
      router.replace(ROUTES.SPORTS_DASHBOARD);
      return;
    }

    venuesService.listOwnerVenues().then((res) => {
      setVenuesCount(res.data?.items?.length || 0);
    });

    bookingsService.getOwnerBookings().then((res) => {
      const items = res.data?.items || [];
      const pending = items.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (b: any) => (b.bookingStatus || b.booking_status) === "PENDING"
      ).length;
      const confirmed = items.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (b: any) => (b.bookingStatus || b.booking_status) === "CONFIRMED"
      ).length;
      setBookingStats({
        total: items.length,
        pending,
        confirmed,
      });
    });
  }, [user, router]);

  if (user?.role === "member" || user?.role === "user") {
    return null;
  }

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Owner Dashboard" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Venue Owner Dashboard"
        description="Overview of your operations and venues."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="My Venues"
          value={venuesCount}
          icon={Building2}
          className="animate-fade-in-up"
        />
        <Link
          href={ROUTES.SPORTS_OWNER_BOOKINGS}
          className="block transition-transform hover:scale-[1.02]"
        >
          <StatsCard
            label="Total Bookings"
            value={bookingStats.total}
            icon={CalendarCheck}
            className="h-full animate-fade-in-up [animation-delay:60ms]"
          />
        </Link>
        <Link
          href={ROUTES.SPORTS_OWNER_BOOKINGS}
          className="block transition-transform hover:scale-[1.02]"
        >
          <StatsCard
            label="Pending Bookings"
            value={bookingStats.pending}
            icon={Clock}
            className="h-full animate-fade-in-up [animation-delay:120ms]"
          />
        </Link>
        <Link
          href={ROUTES.SPORTS_OWNER_BOOKINGS}
          className="block transition-transform hover:scale-[1.02]"
        >
          <StatsCard
            label="Filled Bookings"
            value={bookingStats.confirmed}
            icon={CheckCircle2}
            className="h-full animate-fade-in-up [animation-delay:180ms]"
          />
        </Link>
      </div>
    </PageContainer>
  );
}
