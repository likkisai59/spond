"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  MapPin,
  Mic2,
  Music2,
  Plus,
  Share2,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/store/hooks";
import { activeEventSet } from "@/store/band/marketplace-slice";
import { eventHubService } from "@/services/eventhub/events.service";
import { PaymentCountdownCard } from "../components/payment-countdown-card";
import { formatCurrency } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import type { EventHubEvent, EventHubBooking } from "@/types";
import { ROUTES } from "@/constants";

export function EventDashboardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [event, setEvent] = useState<EventHubEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = async () => {
    if (!params?.id) return;
    try {
      setLoading(true);
      const res = await eventHubService.getEventById(params.id);
      if (res.data) {
        setEvent(res.data);
        dispatch(activeEventSet(res.data));
      }
    } catch (err: any) {
      setError(err?.message || "Could not load event dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [params?.id]);

  // Map attached bookings to slots
  const slots = useMemo(() => {
    const bookings = event?.bookings || [];
    const venueBooking = bookings.find(
      (b) => b.providerType === "Venue" || b.venueName || b.packageId?.includes("venue")
    );
    const artistBooking = bookings.find(
      (b) => b.providerType === "Artist"
    );
    const bandBooking = bookings.find(
      (b) => b.providerType === "Band" || b.bandName
    );

    return {
      venue: venueBooking,
      artist: artistBooking,
      band: bandBooking,
    };
  }, [event?.bookings]);

  const totalCommitted = useMemo(() => {
    return (event?.bookings || []).reduce((acc, b) => {
      if (["ACCEPTED", "CONFIRMED", "EVENT_COMPLETED", "COMPLETED"].includes(b.bookingStatus)) {
        return acc + (b.amount || 0);
      }
      return acc;
    }, 0);
  }, [event?.bookings]);

  const remainingBudget = Math.max(0, (event?.budget || 0) - totalCommitted);
  const budgetPercentage = event?.budget
    ? Math.min(100, Math.round((totalCommitted / event.budget) * 100))
    : 0;

  if (loading) {
    return (
      <PageContainer className="py-10">
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading your Event Dashboard...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !event) {
    return (
      <PageContainer className="py-10">
        <Card className="p-8 text-center rounded-2xl max-w-lg mx-auto">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground">Event Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-6">
            {error || "We couldn't retrieve this event dashboard."}
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={ROUTES.BAND}>Return to Marketplace</Link>
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success" className="text-[10px] uppercase font-bold">Confirmed & Paid</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-pink-600 text-white text-[10px] uppercase font-bold">15m Window Open</Badge>;
      case "REQUESTED":
        return <Badge variant="warning" className="text-[10px] uppercase font-bold">Request Pending</Badge>;
      case "EVENT_COMPLETED":
        return <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px] uppercase font-bold">Event Done • Pay 75%</Badge>;
      case "COMPLETED":
        return <Badge variant="success" className="text-[10px] uppercase font-bold">Completed</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase font-semibold">Not Booked</Badge>;
    }
  };

  return (
    <PageContainer className="py-8 space-y-8">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between gap-4">
        <Breadcrumb
          items={[
            { label: "Marketplace", href: ROUTES.BAND },
            { label: "My Events", href: ROUTES.BAND_EVENTS },
            { label: event.title },
          ]}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dispatch(activeEventSet(event));
              router.push(`/band/search?city=${encodeURIComponent(event.location)}&date=${event.date}`);
            }}
            className="rounded-xl text-xs font-semibold"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Explore Services for this Event
          </Button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-pink-500/5 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-pink-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
                Single Event Control Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Calendar className="h-4 w-4 text-pink-500" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <MapPin className="h-4 w-4 text-pink-500" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Users className="h-4 w-4 text-pink-500" />
                {event.guestCount} Guests
              </span>
              {event.eventType && (
                <Badge variant="outline" className="text-[11px] rounded-lg">
                  {event.eventType}
                </Badge>
              )}
            </div>
          </div>

          {/* Budget Overview Card */}
          <div className="w-full lg:w-80 rounded-2xl bg-card border border-border/80 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground">Committed Budget</span>
              <span className="font-bold text-foreground">
                {formatCurrency(totalCommitted)} / {formatCurrency(event.budget)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Remaining Budget:</span>
              <span className="font-bold text-emerald-500">{formatCurrency(remainingBudget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active 15-Minute Payment Alerts (if any booking is ACCEPTED) */}
      {event.bookings?.some((b) => b.bookingStatus === "ACCEPTED") && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-pink-500 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Action Required: Complete Advance Payments
          </h3>
          {event.bookings
            .filter((b) => b.bookingStatus === "ACCEPTED")
            .map((b) => (
              <PaymentCountdownCard
                key={b.id}
                booking={b}
                onPaymentSuccess={fetchEvent}
                onExpired={fetchEvent}
              />
            ))}
        </div>
      )}

      {/* Event Services Grid (Venue, Artist, Band) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          Event Entertainment & Venue Slots
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* VENUE SLOT */}
          <Card className="rounded-2xl border-border/80 p-5 shadow-sm flex flex-col justify-between hover:border-border transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Venue
                  </span>
                </div>
                {renderStatusBadge(slots.venue?.bookingStatus)}
              </div>

              {slots.venue ? (
                <div className="space-y-1.5 pt-2">
                  <h4 className="font-bold text-sm text-foreground">
                    {slots.venue.venueName || slots.venue.providerName || "Selected Venue"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Agreed: {formatCurrency(slots.venue.amount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Advance: {formatCurrency(slots.venue.advanceAmount)}
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">No venue booked yet</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Find banquet halls, lawns and resort stages in {event.location}.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-border/50">
              {slots.venue ? (
                <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs">
                  <Link href={`/band/bookings/${slots.venue.id}`}>View Booking Details →</Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    dispatch(activeEventSet(event));
                    router.push(`/band/search?kind=venues&city=${encodeURIComponent(event.location)}&date=${event.date}`);
                  }}
                  className="w-full rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Find & Book Venue
                </Button>
              )}
            </div>
          </Card>

          {/* ARTIST SLOT */}
          <Card className="rounded-2xl border-border/80 p-5 shadow-sm flex flex-col justify-between hover:border-border transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <Mic2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Solo Artist / DJ
                  </span>
                </div>
                {renderStatusBadge(slots.artist?.bookingStatus)}
              </div>

              {slots.artist ? (
                <div className="space-y-1.5 pt-2">
                  <h4 className="font-bold text-sm text-foreground">
                    {slots.artist.providerName || "Selected Artist"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Agreed: {formatCurrency(slots.artist.amount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Advance: {formatCurrency(slots.artist.advanceAmount)}
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">No solo artist booked yet</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Explore playback singers, acoustic vocalists & live DJs.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-border/50">
              {slots.artist ? (
                <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs">
                  <Link href={`/band/bookings/${slots.artist.id}`}>View Booking Details →</Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    dispatch(activeEventSet(event));
                    router.push(`/band/search?kind=artists&city=${encodeURIComponent(event.location)}&date=${event.date}`);
                  }}
                  className="w-full rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Find & Book Artist
                </Button>
              )}
            </div>
          </Card>

          {/* BAND SLOT */}
          <Card className="rounded-2xl border-border/80 p-5 shadow-sm flex flex-col justify-between hover:border-border transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                    <Music2 className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Live Band
                  </span>
                </div>
                {renderStatusBadge(slots.band?.bookingStatus)}
              </div>

              {slots.band ? (
                <div className="space-y-1.5 pt-2">
                  <h4 className="font-bold text-sm text-foreground">
                    {slots.band.bandName || slots.band.providerName || "Selected Live Band"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Agreed: {formatCurrency(slots.band.amount)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Advance: {formatCurrency(slots.band.advanceAmount)}
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">No band booked yet</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Live rock, fusion, Bollywood and jazz bands with full lineups.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-border/50">
              {slots.band ? (
                <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs">
                  <Link href={`/band/bookings/${slots.band.id}`}>View Booking Details →</Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    dispatch(activeEventSet(event));
                    router.push(`/band/search?kind=bands&city=${encodeURIComponent(event.location)}&date=${event.date}`);
                  }}
                  className="w-full rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Find & Book Band
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
