"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard } from "@/components/cards";
import { bookingsService } from "@/services/sports";
import { ROUTES } from "@/constants";
import { formatDate } from "@/utils/helpers";
import { CalendarCheck, Users } from "lucide-react";

export function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsService.getOwnerBookings()
      .then((res) => {
        setBookings(res.data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        description="View and manage all bookings for your venues."
      />

      <div className="mt-8">
        {loading ? (
          <p>Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <EmptyCard
            title="No bookings yet"
            description="You don't have any bookings across your venues yet."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-border/70 bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Booking #{booking.id.slice(-6).toUpperCase()}</h3>
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                    booking.bookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 
                    booking.bookingStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {booking.bookingStatus}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4" />
                    <span>{formatDate(booking.bookingDate || booking.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Booked by: {booking.bookedBy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
