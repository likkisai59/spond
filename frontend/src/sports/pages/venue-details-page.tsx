"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { bookingCreated } from "@/store/sports/bookings-slice";
import { selectAllGroups } from "@/store/sports/selectors";
import { VenueCard } from "../components/venue-card";
import {
  MOCK_VENUES,
  VENUE_SLOTS,
  isSlotTaken,
  slotLabel,
  upcomingDates,
} from "../mocks/venues.mock";
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/helpers";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";

function toDateLabel(date: string): { weekday: string; day: string; month: string } {
  const parsed = new Date(`${date}T00:00:00`);
  return {
    weekday: parsed.toLocaleDateString("en-US", { weekday: "short" }),
    day: parsed.toLocaleDateString("en-US", { day: "numeric" }),
    month: parsed.toLocaleDateString("en-US", { month: "short" }),
  };
}

export function VenueDetailsPage() {
  const params = useParams<{ venueId: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const groups = useAppSelector(selectAllGroups);

  const venue = MOCK_VENUES.find((v) => v.id === params.venueId);
  const venueId = venue?.id;

  const dates = useMemo(
    () => upcomingDates(14).map((date) => ({ date, ...toDateLabel(date) })),
    []
  );
  const [selectedDate, setSelectedDate] = useState(dates[0].date);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    groups[0]?.id ?? ""
  );

  const slotsForDate = useMemo(
    () =>
      VENUE_SLOTS.map((slot) => ({
        slot,
        taken: venueId ? isSlotTaken(venueId, selectedDate, slot.id) : false,
      })),
    [venueId, selectedDate]
  );

  const selectedSlot = useMemo(
    () => VENUE_SLOTS.find((slot) => slot.id === selectedSlotId) ?? null,
    [selectedSlotId]
  );

  if (!venue) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "Sports", href: ROUTES.SPORTS },
            { label: "Venues", href: ROUTES.SPORTS_VENUES },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          title="Venue not found"
          description="This venue may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.SPORTS_VENUES}>Back to venues</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const selectedGroup = groups.find((group) => group.id === selectedGroupId);
  const otherVenues = MOCK_VENUES.filter((v) => v.id !== venue?.id);

  const handleConfirmBooking = () => {
    if (!selectedSlot || !selectedGroup) return;
    dispatch(
      bookingCreated({
        venueId: venue.id,
        venueName: venue.name,
        eventDate: selectedDate,
        slotId: selectedSlot.id,
        slotLabel: slotLabel(selectedSlot),
        groupName: selectedGroup.name,
        price: selectedSlot.price,
      })
    );
    dispatch(
      notificationAdded({
        title: "Booking confirmed",
        message: `${venue.name} · ${formatDate(selectedDate)} · ${slotLabel(selectedSlot)} for ${selectedGroup.name} (demo mode).`,
        variant: "success",
      })
    );
    router.push(ROUTES.SPORTS_BOOKINGS);
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Venues", href: ROUTES.SPORTS_VENUES },
          { label: venue.name },
        ]}
        className="mb-4"
      />

      <Card className="animate-fade-in-up p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient-soft">
              <Building2 className="h-8 w-8 text-accent" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
                {venue.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-accent" />
                  {venue.address}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-accent" />
                  {venue.rating.toFixed(1)} ({venue.reviewCount} reviews)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-accent" />
                  Fits {venue.capacity}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {venue.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{venue.surface}</Badge>
                {venue.sports.map((sport) => (
                  <Badge key={sport} variant="outline">
                    {sport}
                  </Badge>
                ))}
                {venue.amenities.map((amenity) => (
                  <Badge key={amenity} variant="gradient" className="text-[10px]">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Button asChild variant="ghost" className="shrink-0">
            <Link href={ROUTES.SPORTS_VENUES}>
              <ArrowLeft />
              Back to venues
            </Link>
          </Button>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5 sm:p-6 animate-fade-in-up">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <CalendarDays className="h-4 w-4 text-accent" />
              Select a date
            </h2>
            <div
              className="mt-4 flex gap-2 overflow-x-auto pb-1"
              role="group"
              aria-label="Select a booking date"
            >
              {dates.map(({ date, weekday, day, month }) => {
                const selected = date === selectedDate;
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedSlotId(null);
                    }}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-16 shrink-0 flex-col items-center rounded-xl border px-2 py-2.5 transition-all",
                      selected
                        ? "border-transparent bg-brand-gradient text-white shadow-sm"
                        : "border-border/70 hover:border-accent/40 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {weekday}
                    </span>
                    <span className="text-lg font-extrabold leading-tight">{day}</span>
                    <span className="text-[10px] font-semibold uppercase opacity-80">
                      {month}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 sm:p-6 animate-fade-in-up">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Clock className="h-4 w-4 text-accent" />
              Select a slot
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Hourly slots for {formatDate(selectedDate)}. Booked slots are
              disabled (demo availability).
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {slotsForDate.map(({ slot, taken }) => {
                const selected = slot.id === selectedSlotId;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={taken}
                    onClick={() => setSelectedSlotId(slot.id)}
                    aria-pressed={selected}
                    aria-label={taken ? `${slotLabel(slot)} — booked` : `Select ${slotLabel(slot)}`}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-all",
                      taken && "cursor-not-allowed border-border/50 opacity-40",
                      !taken &&
                        selected &&
                        "border-transparent bg-brand-gradient text-white shadow-sm",
                      !taken &&
                        !selected &&
                        "border-border/70 hover:border-accent/40 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-sm font-bold">{slotLabel(slot)}</span>
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        selected ? "text-white/85" : "text-muted-foreground"
                      )}
                    >
                      {taken ? "Booked" : formatCurrency(slot.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="h-fit p-5 sm:p-6 animate-fade-in-up lg:sticky lg:top-24">
          <h2 className="text-base font-bold">Booking summary</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-muted/40 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Venue
              </p>
              <p className="truncate text-sm font-bold">{venue.name}</p>
            </div>
            <div className="rounded-xl bg-muted/40 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </p>
              <p className="text-sm font-bold">{formatDate(selectedDate)}</p>
            </div>
            <div className="rounded-xl bg-muted/40 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Slot
              </p>
              <p className="text-sm font-bold">
                {selectedSlot
                  ? `${slotLabel(selectedSlot)} · 1 hour`
                  : "No slot selected"}
              </p>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Book for group
              </p>
              <Select
                value={selectedGroupId}
                onValueChange={setSelectedGroupId}
                disabled={groups.length === 0}
              >
                <SelectTrigger aria-label="Select group">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-3">
              <span className="text-sm font-semibold text-muted-foreground">
                Total
              </span>
              <span className="text-2xl font-extrabold tracking-tight">
                {selectedSlot ? formatCurrency(selectedSlot.price) : "—"}
              </span>
            </div>
          </div>
          <Button
            variant="accent"
            className="mt-5 w-full rounded-full"
            disabled={!selectedSlot || !selectedGroup}
            onClick={handleConfirmBooking}
          >
            <CheckCircle2 />
            Confirm booking
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            Demo mode — no payment is processed. The booking is added to your
            history.
          </p>
        </Card>
      </div>

      {otherVenues.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-extrabold tracking-tight">
            More venues
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {otherVenues.map((other) => (
              <VenueCard key={other.id} venue={other} />
            ))}
          </div>
        </section>
      ) : null}
    </PageContainer>
  );
}
