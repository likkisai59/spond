"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Wallet } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard, StatCard } from "@/components/cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { bookingCancelled, bookingsFetched } from "@/store/sports/bookings-slice";
import {
  selectAllBookings,
  selectPastBookings,
  selectUpcomingBookings,
} from "@/store/sports/selectors";
import { BookingCard } from "../components/booking-card";
import { formatCurrency } from "@/utils/helpers";
import { ROUTES } from "@/constants";
import { bookingsService } from "@/services/sports";
import type { VenueBooking } from "@/types";

const ConfirmationModal = dynamic(
  () =>
    import("@/components/modals/confirmation-modal").then(
      (m) => m.ConfirmationModal
    ),
  { ssr: false, loading: () => null }
);

export function BookingsPage() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectAllBookings);
  const upcoming = useAppSelector(selectUpcomingBookings);
  const past = useAppSelector(selectPastBookings);

  const [cancelTarget, setCancelTarget] = useState<VenueBooking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingsService.list();
        if (res.data?.items) {
          const mappedBookings = res.data.items.map((b: any) => ({
            ...b,
            eventDate: b.bookingDate || b.eventDate,
            status: b.bookingStatus || b.status,
            price: b.amount || b.price,
          }));
          dispatch(bookingsFetched(mappedBookings));
        }
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      }
    };
    fetchBookings();
  }, [dispatch]);

  const { totalSpend, completedCount } = useMemo(
    () => ({
      totalSpend: bookings
        .filter((booking) => (booking.status || "").toUpperCase() !== "CANCELLED")
        .reduce((total, booking) => total + (booking.price || 0), 0),
      completedCount: past.filter(
        (b) =>
          (b.status || "").toUpperCase() === "COMPLETED" ||
          (b.eventDate || "") < new Date().toISOString().slice(0, 10)
      ).length,
    }),
    [bookings, past]
  );

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    dispatch(bookingCancelled(cancelTarget.id));
    dispatch(
      notificationAdded({
        title: "Booking cancelled",
        message: `${cancelTarget.venueName} on ${cancelTarget.eventDate} was cancelled (demo mode).`,
        variant: "warning",
      })
    );
    setCancelTarget(null);
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Bookings" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Bookings"
        description="Venue slot bookings across all your groups."
        actions={
          <Button asChild variant="accent">
            <Link href={ROUTES.SPORTS_VENUES}>Browse venues</Link>
          </Button>
        }
        className="animate-fade-in-up"
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          icon={CalendarDays}
          className="animate-fade-in-up"
        />
        <StatCard
          label="Completed"
          value={completedCount}
          icon={CheckCircle2}
          className="animate-fade-in-up [animation-delay:100ms]"
        />
        <StatCard
          label="Total spend"
          value={formatCurrency(totalSpend)}
          icon={Wallet}
          className="animate-fade-in-up [animation-delay:200ms]"
        />
        <StatCard
          label="All bookings"
          value={bookings.length}
          icon={CalendarDays}
          className="animate-fade-in-up [animation-delay:300ms]"
        />
      </div>

      <Tabs defaultValue="upcoming" className="mt-8">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcoming.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={setCancelTarget}
                />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No upcoming bookings"
              description="Browse venues and book a slot for your next session."
              action={
                <Button asChild variant="accent">
                  <Link href={ROUTES.SPORTS_VENUES}>Browse venues</Link>
                </Button>
              }
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {past.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {past.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No booking history"
              description="Completed and cancelled bookings will appear here."
            />
          )}
        </TabsContent>
      </Tabs>

      <ConfirmationModal
        open={cancelTarget !== null}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this booking?"
        description={
          cancelTarget
            ? `${cancelTarget.venueName} · ${cancelTarget.eventDate} · ${cancelTarget.slotLabel} for ${cancelTarget.groupName}.`
            : undefined
        }
        confirmLabel="Cancel booking"
        variant="destructive"
        onConfirm={handleCancelConfirm}
      />
    </PageContainer>
  );
}
