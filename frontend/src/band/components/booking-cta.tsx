"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import {
  bookingAdded,
  bookingDraftReset,
  bookingDraftStarted,
} from "@/store/band/marketplace-slice";
import { MOCK_VENUES } from "@/band/mocks/band.mock";
import {
  ARTIST_PACKAGES,
  BAND_PACKAGES,
  VENUE_PACKAGES,
} from "@/data/band";
import {
  BOOKING_EVENT_TYPES,
  type BookingEventType,
  type PackageTemplate,
} from "@/types";
import { formatCurrency } from "@/utils/helpers";
import { cn } from "@/utils/cn";

type BookingKind = "Artist" | "Band" | "Venue";

function packagePrice(basePrice: number, template: PackageTemplate): number {
  return Math.round((basePrice * template.multiplier) / 500) * 500;
}

export interface BookingCtaProps {
  kind: BookingKind;
  performerId: string;
  performerName: string;
  basePrice: number;
  defaultVenueId?: string;
  className?: string;
}

export function BookingCta({
  kind,
  performerId,
  performerName,
  basePrice,
  defaultVenueId,
  className,
}: BookingCtaProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [venueId, setVenueId] = useState<string>(defaultVenueId ?? MOCK_VENUES[0].id);
  const [eventType, setEventType] = useState<BookingEventType>("Private Party");
  const [guestCount, setGuestCount] = useState(100);

  const templates =
    kind === "Artist" ? ARTIST_PACKAGES : kind === "Band" ? BAND_PACKAGES : VENUE_PACKAGES;

  const selectedPackage = useMemo(
    () => templates.find((t) => t.id === packageId) ?? null,
    [templates, packageId]
  );
  const venue = useMemo(
    () => MOCK_VENUES.find((v) => v.id === venueId) ?? MOCK_VENUES[0],
    [venueId]
  );
  const price = selectedPackage
    ? packagePrice(basePrice, selectedPackage)
    : basePrice;

  const resetFlow = () => {
    setStep(1);
    setPackageId(null);
    setDate("");
    setStartTime("19:00");
    setEventType("Private Party");
    setGuestCount(100);
    dispatch(bookingDraftReset());
  };

  const handleOpen = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      dispatch(
        bookingDraftStarted({
          performerId,
          performerName,
          performerKind: kind,
        })
      );
    } else {
      resetFlow();
    }
  };

  const handleConfirm = () => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = Math.min(23, (hours || 19) + (selectedPackage ? Math.ceil(selectedPackage.durationHours) : 3));
    const endTime = `${String(endHours).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}`;
    const title =
      kind === "Venue"
        ? `${venue.name} — venue booking`
        : `${performerName} live at ${venue.name}`;

    const action = dispatch(
      bookingAdded({
        title,
        bandName: kind === "Venue" ? "Your performance" : performerName,
        venueName: venue.name,
        eventDate: date,
        startTime,
        endTime,
        amount: price,
        eventType,
        guestCount,
      })
    );
    dispatch(
      notificationAdded({
        title: "Booking requested",
        message: `"${title}" was sent for confirmation (demo mode).`,
        variant: "success",
      })
    );
    setOpen(false);
    resetFlow();
    router.push(`/band/bookings/${action.payload.id}`);
  };

  const stepOneValid = packageId !== null;
  const stepTwoValid = date.length > 0;

  return (
    <>
      <Button
        variant="accent"
        className={className}
        onClick={() => handleOpen(true)}
      >
        <CalendarDays />
        Book now
      </Button>

      <Modal open={open} onOpenChange={handleOpen}>
        <ModalContent className="max-w-lg">
          <ModalHeader>
            <ModalTitle>
              {step === 1 ? "Choose a package" : step === 2 ? "Event details" : "Review & confirm"}
            </ModalTitle>
            <ModalDescription>
              Booking {performerName}
              {kind !== "Venue" ? ` for your event` : ""} — step {step} of 3.
            </ModalDescription>
          </ModalHeader>

          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[1, 2, 3].map((indicator) => (
              <span
                key={indicator}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  indicator <= step ? "bg-brand-gradient" : "bg-muted"
                )}
              />
            ))}
          </div>

          {step === 1 ? (
            <div className="space-y-3">
              {templates.map((template) => {
                const active = packageId === template.id;
                const templatePrice = packagePrice(basePrice, template);
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setPackageId(template.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full flex-col gap-2 rounded-xl border px-4 py-4 text-left transition-all sm:flex-row sm:items-center sm:justify-between",
                      active
                        ? "border-accent/50 bg-brand-gradient-soft shadow-sm"
                        : "border-border/70 hover:border-accent/40 hover:bg-muted/50"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-bold">
                        {template.name}
                        {template.popular ? (
                          <span className="rounded-full bg-brand-gradient px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            Popular
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {template.durationHours} hrs · {template.description}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-base font-extrabold tracking-tight">
                        {formatCurrency(templatePrice)}
                      </span>
                      {active ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-date">Event date</Label>
                  <Input
                    id="booking-date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-time">Start time</Label>
                  <Input
                    id="booking-time"
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Venue</Label>
                <Select value={venueId} onValueChange={setVenueId}>
                  <SelectTrigger aria-label="Select a venue">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_VENUES.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} · {item.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Event type</Label>
                  <Select
                    value={eventType}
                    onValueChange={(value) => setEventType(value as BookingEventType)}
                  >
                    <SelectTrigger aria-label="Select event type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOKING_EVENT_TYPES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="booking-guests">Guests</Label>
                  <Input
                    id="booking-guests"
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(event) =>
                      setGuestCount(Math.max(1, Number(event.target.value) || 1))
                    }
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 && selectedPackage ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-sm font-extrabold">{selectedPackage.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {selectedPackage.durationHours} hours · {performerName}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {selectedPackage.inclusions.map((inclusion) => (
                    <li
                      key={inclusion}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                      {inclusion}
                    </li>
                  ))}
                </ul>
              </div>
              <dl className="space-y-2.5 rounded-xl border border-border/70 p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Package</dt>
                  <dd className="font-bold">{formatCurrency(price)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Venue</dt>
                  <dd className="font-bold">{venue.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Date & time</dt>
                  <dd className="font-bold">
                    {date} · {startTime}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Guests
                  </dt>
                  <dd className="font-bold">{guestCount}</dd>
                </div>
                <div className="flex justify-between border-t border-border/70 pt-2.5 text-base">
                  <dt className="font-extrabold">Total</dt>
                  <dd className="font-extrabold text-accent">
                    {formatCurrency(price)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          <ModalFooter>
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft />
                Back
              </Button>
            ) : null}
            {step < 3 ? (
              <Button
                variant="accent"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !stepOneValid : !stepTwoValid}
              >
                Continue
                <ArrowRight />
              </Button>
            ) : (
              <Button variant="accent" onClick={handleConfirm}>
                <Check />
                Confirm booking request
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
