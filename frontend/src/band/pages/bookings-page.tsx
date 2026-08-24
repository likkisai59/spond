"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Inbox,
  XCircle,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard, StatCard } from "@/components/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { bookingStatusUpdated } from "@/store/band/marketplace-slice";
import {
  selectBandBookings,
  selectBookingById,
} from "@/store/band/selectors";
import { ROUTES } from "@/constants";
import { BookingCard } from "../components/booking-card";
import { BookingTimeline } from "../components/booking-timeline";
import type { BandBooking } from "@/types";
import { formatCurrency, formatTime } from "@/utils/helpers";
import { formatDate } from "@/utils/date";

export function BookingsPage() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBandBookings);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeBooking = useAppSelector((state) =>
    selectBookingById(state, activeId ?? "")
  );

  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "Requested" || b.status === "Confirmed")
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate)),
    [bookings]
  );
  const completed = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "Completed")
        .sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
    [bookings]
  );
  const cancelled = useMemo(
    () => bookings.filter((b) => b.status === "Cancelled"),
    [bookings]
  );

  const confirmedEarnings = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "Confirmed" || b.status === "Completed")
        .reduce((sum, b) => sum + b.amount, 0),
    [bookings]
  );

  const updateBookingStatus = (
    bookingId: string,
    status: BandBooking["status"],
    note: string
  ) => {
    dispatch(bookingStatusUpdated({ id: bookingId, status, note }));
  };

  const handleConfirm = (booking: BandBooking) => {
    updateBookingStatus(
      booking.id,
      "Confirmed",
      "Booking confirmed from the BandConnect console."
    );
    dispatch(
      notificationAdded({
        title: "Booking confirmed",
        message: `"${booking.title}" is now confirmed (demo mode).`,
        variant: "success",
      })
    );
  };

  const handleCancel = (booking: BandBooking) => {
    updateBookingStatus(
      booking.id,
      "Cancelled",
      "Booking cancelled from the BandConnect console."
    );
    dispatch(
      notificationAdded({
        title: "Booking cancelled",
        message: `"${booking.title}" was cancelled (demo mode).`,
        variant: "info",
      })
    );
  };

  const renderList = (list: BandBooking[], emptyTitle: string, emptyDescription: string) =>
    list.length > 0 ? (
      <div className="space-y-4">
        {list.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onViewDetails={(item) => setActiveId(item.id)}
          />
        ))}
      </div>
    ) : (
      <EmptyCard icon={Inbox} title={emptyTitle} description={emptyDescription} />
    );

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Bookings" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Bookings"
        description="Track requests, confirmations and payouts across your events."
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          icon={CalendarDays}
          className="animate-fade-in-up"
        />
        <StatCard
          label="Confirmed value"
          value={formatCurrency(confirmedEarnings)}
          icon={IndianRupee}
          className="animate-fade-in-up [animation-delay:80ms]"
        />
        <StatCard
          label="Completed"
          value={completed.length}
          icon={CheckCircle2}
          className="animate-fade-in-up [animation-delay:160ms]"
        />
      </div>

      <Tabs defaultValue="upcoming" className="mt-8">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
          <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {renderList(
            upcoming,
            "No upcoming bookings",
            "New requests from artists, bands and venues will appear here."
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          {renderList(
            completed,
            "No completed bookings",
            "Finished events are archived here with their full timeline."
          )}
        </TabsContent>
        <TabsContent value="cancelled" className="mt-6">
          {renderList(
            cancelled,
            "No cancelled bookings",
            "Cancelled events will be listed here for reference."
          )}
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          {renderList(
            [...bookings].sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
            "No bookings yet",
            "Requests you send from the marketplace will show up here."
          )}
        </TabsContent>
      </Tabs>

      <Drawer
        open={activeId !== null}
        onOpenChange={(open) => {
          if (!open) setActiveId(null);
        }}
      >
        <DrawerContent side="right" className="flex flex-col gap-0">
          {activeBooking ? (
            <>
              <DrawerHeader className="border-b border-border/70 p-6">
                <div className="flex flex-wrap items-center gap-2 pr-8">
                  <Badge variant="gradient">{activeBooking.eventType}</Badge>
                  <Badge variant="secondary">{activeBooking.status}</Badge>
                </div>
                <DrawerTitle className="mt-1.5">{activeBooking.title}</DrawerTitle>
                <DrawerDescription>
                  {activeBooking.bandName} at {activeBooking.venueName}
                </DrawerDescription>
              </DrawerHeader>

              <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted/40 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </p>
                    <p className="mt-0.5 text-sm font-bold">
                      {formatDate(activeBooking.eventDate)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/40 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Time
                    </p>
                    <p className="mt-0.5 text-sm font-bold">
                      {formatTime(activeBooking.startTime)} –{" "}
                      {formatTime(activeBooking.endTime)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/40 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Guests
                    </p>
                    <p className="mt-0.5 text-sm font-bold">
                      {activeBooking.guestCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/40 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </p>
                    <p className="mt-0.5 text-sm font-bold">
                      {formatCurrency(activeBooking.amount)}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-extrabold tracking-tight">
                    Status timeline
                  </h3>
                  <BookingTimeline entries={activeBooking.timeline} />
                </div>
              </div>

              <DrawerFooter className="flex-row gap-2.5 border-t border-border/70 p-4 sm:justify-end">
                <Button asChild variant="ghost" className="rounded-full">
                  <Link href={`/band/bookings/${activeBooking.id}`}>
                    Open full page
                    <ArrowRight />
                  </Link>
                </Button>
                {activeBooking.status === "Requested" ? (
                  <Button
                    variant="accent"
                    className="rounded-full"
                    onClick={() => handleConfirm(activeBooking)}
                  >
                    <CheckCircle2 />
                    Confirm booking
                  </Button>
                ) : null}
                {activeBooking.status === "Requested" ||
                activeBooking.status === "Confirmed" ? (
                  <Button
                    variant="outline"
                    className="rounded-full text-destructive hover:bg-destructive/10"
                    onClick={() => handleCancel(activeBooking)}
                  >
                    <XCircle />
                    Cancel booking
                  </Button>
                ) : null}
              </DrawerFooter>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
    </PageContainer>
  );
}
