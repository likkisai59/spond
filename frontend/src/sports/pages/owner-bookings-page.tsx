"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard } from "@/components/cards";
import { bookingsService } from "@/services/sports";
import { ROUTES } from "@/constants";
import { formatDate } from "@/utils/date";
import { CalendarCheck, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { updateBookingStatusThunk } from "@/store/sports/bookings-slice";
import { notificationAdded } from "@/store/slices/notification-slice";
import { Button } from "@/components/ui/button";

export function OwnerBookingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await dispatch(updateBookingStatusThunk({ id: bookingId, status })).unwrap();
      setBookings(current => current.map(b => b.id === bookingId ? { ...b, bookingStatus: status } : b));
      dispatch(notificationAdded({
        title: "Status Updated",
        message: `Booking has been marked as ${status}.`,
        variant: "success"
      }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(notificationAdded({
        title: "Error",
        message: error.message || "Failed to update booking status.",
        variant: "error"
      }));
    }
  };

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
                    booking.bookingStatus === 'CANCELLED' || booking.bookingStatus === 'REJECTED' ? 'bg-red-100 text-red-800' : 
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
                {booking.bookingStatus === 'PENDING' && (
                  <div className="mt-4 flex gap-2 border-t pt-4">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
                      onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" /> Confirm
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-amber-600 hover:text-amber-700"
                      onClick={() => handleStatusChange(booking.id, 'HELD')}
                    >
                      <Clock className="mr-1 h-4 w-4" /> Hold
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleStatusChange(booking.id, 'REJECTED')}
                    >
                      <XCircle className="mr-1 h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
