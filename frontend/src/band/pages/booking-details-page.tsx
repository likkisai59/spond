"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CalendarX2,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Music,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { bookingStatusUpdated } from "@/store/band/marketplace-slice";
import { selectBookingById } from "@/store/band/selectors";
import { StatusBadge } from "@/sports/components";
import { BookingTimeline } from "../components/booking-timeline";
import { PaymentCountdownCard } from "../components/payment-countdown-card";
import type { EventHubBooking } from "@/types";

const ConfirmationModal = dynamic(
  () =>
    import("@/components/modals/confirmation-modal").then(
      (m) => m.ConfirmationModal
    ),
  { ssr: false, loading: () => null }
);
import { ROUTES } from "@/constants";
import { formatCurrency, formatTime } from "@/utils/helpers";
import { formatDate, formatDateTime } from "@/utils/date";

export function BookingDetailsPage() {
  const params = useParams<{ bookingId: string }>();
  const dispatch = useAppDispatch();
  const booking = useAppSelector((state) =>
    selectBookingById(state, params.bookingId)
  );
  const [cancelOpen, setCancelOpen] = useState(false);

  const paymentSummary = useMemo(() => {
    if (!booking) return null;
    const platformFee = Math.round(booking.amount * 0.05);
    return {
      base: booking.amount,
      platformFee,
      total: booking.amount + platformFee,
    };
  }, [booking]);

  if (!booking) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "BandConnect", href: ROUTES.BAND },
            { label: "Bookings", href: ROUTES.BAND_BOOKINGS },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          icon={CreditCard}
          title="Booking not found"
          description="This booking may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.BAND_BOOKINGS}>Back to bookings</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const handleConfirm = () => {
    dispatch(
      bookingStatusUpdated({
        id: booking.id,
        status: "Confirmed",
        note: "Booking confirmed from the BandConnect console.",
      })
    );
    dispatch(
      notificationAdded({
        title: "Booking confirmed",
        message: `"${booking.title}" is now confirmed (demo mode).`,
        variant: "success",
      })
    );
  };

  const handleContact = () => {
    dispatch(
      notificationAdded({
        title: "Message sent",
        message: `A note was sent to ${booking.bandName} (demo mode).`,
        variant: "info",
      })
    );
  };

  const handleCancelConfirm = () => {
    dispatch(
      bookingStatusUpdated({
        id: booking.id,
        status: "Cancelled",
        note: "Booking cancelled from the BandConnect console.",
      })
    );
    dispatch(
      notificationAdded({
        title: "Booking cancelled",
        message: `"${booking.title}" was cancelled (demo mode).`,
        variant: "info",
      })
    );
    setCancelOpen(false);
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Bookings", href: ROUTES.BAND_BOOKINGS },
          { label: booking.title },
        ]}
        className="mb-4"
      />

      <div className="animate-fade-in-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            <Badge variant="secondary">{booking.eventType}</Badge>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
            {booking.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDateTime(booking.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button asChild variant="ghost">
            <Link href={ROUTES.BAND_BOOKINGS}>
              <ArrowLeft />
              Back
            </Link>
          </Button>
          {booking.status === "Requested" ? (
            <Button variant="accent" onClick={handleConfirm}>
              <CheckCircle2 />
              Confirm booking
            </Button>
          ) : null}
          {booking.status === "Requested" || booking.status === "Confirmed" ? (
            <Button variant="outline" onClick={() => setCancelOpen(true)}>
              <CalendarX2 />
              Cancel booking
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {booking.status.toLowerCase() === "accepted" ? (
            <PaymentCountdownCard
              booking={{
                id: booking.id,
                title: booking.title,
                bandName: booking.bandName,
                venueName: booking.venueName,
                eventDate: booking.eventDate,
                startTime: booking.startTime,
                endTime: booking.endTime,
                amount: booking.amount,
                advanceAmount: Math.round(booking.amount * 0.25),
                finalAmount: Math.round(booking.amount * 0.75),
                bookingStatus: "ACCEPTED",
                paymentStatus: "ADVANCE_PAYMENT_PENDING",
                acceptedAt: booking.updatedAt || new Date().toISOString(),
                guestCount: booking.guestCount,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt,
              }}
              onPaymentSuccess={handleConfirm}
            />
          ) : null}

          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">
              Booking summary
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <SummaryRow
                icon={CalendarDays}
                label="Event date"
                value={formatDate(booking.eventDate)}
              />
              <SummaryRow
                icon={Clock}
                label="Time"
                value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`}
              />
              <SummaryRow
                icon={Users}
                label="Guests"
                value={String(booking.guestCount)}
              />
              <SummaryRow
                icon={CreditCard}
                label="Booking amount"
                value={formatCurrency(booking.amount)}
              />
            </div>
          </Card>

          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">
              Status timeline
            </h2>
            <BookingTimeline entries={booking.timeline} className="mt-5" />
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="animate-fade-in-up p-6">
              <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                <Music className="h-4 w-4 text-accent" />
                Performer
              </h2>
              <div className="mt-4 space-y-2.5 text-sm">
                <p className="font-extrabold">{booking.bandName}</p>
                <p className="text-muted-foreground">
                  Live performance as agreed in the package brief.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-full"
                  onClick={handleContact}
                >
                  <Mail />
                  Contact performer
                </Button>
              </div>
            </Card>

            <Card className="animate-fade-in-up p-6 [animation-delay:80ms]">
              <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                <MapPin className="h-4 w-4 text-accent" />
                Venue
              </h2>
              <div className="mt-4 space-y-2.5 text-sm">
                <p className="font-extrabold">{booking.venueName}</p>
                <p className="text-muted-foreground">
                  Load-in 2 hours before {formatTime(booking.startTime)}.
                  Soundcheck slot included.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                  <Link href={ROUTES.BAND_VENUES}>View venues</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          {paymentSummary ? (
            <Card className="animate-fade-in-up p-6">
              <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                <CreditCard className="h-4 w-4 text-accent" />
                Payment summary
              </h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Booking amount</dt>
                  <dd className="font-bold">
                    {formatCurrency(paymentSummary.base)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Platform fee (5%)
                  </dt>
                  <dd className="font-bold">
                    {formatCurrency(paymentSummary.platformFee)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-border/70 pt-2.5 text-base">
                  <dt className="font-extrabold">Total</dt>
                  <dd className="font-extrabold text-accent">
                    {formatCurrency(paymentSummary.total)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                Demo mode — no real charges. Settlement is released to the
                performer 24 hours after the event.
              </p>
            </Card>
          ) : null}

          <Card className="animate-fade-in-up p-6 [animation-delay:80ms]">
            <h2 className="text-lg font-extrabold tracking-tight">
              Event details
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-bold">{booking.eventType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="font-bold">{formatDate(booking.eventDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-bold">
                  {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Guests</dt>
                <dd className="font-bold">{booking.guestCount}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmationModal
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel booking"
        description={`"${booking.title}" will be cancelled and refunded as per policy (demo mode).`}
        confirmLabel="Cancel booking"
        variant="destructive"
        onConfirm={handleCancelConfirm}
      />
    </PageContainer>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <Icon className="h-5 w-5 shrink-0 text-accent" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}
