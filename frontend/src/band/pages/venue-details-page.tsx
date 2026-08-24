"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock,
  Home,
  IndianRupee,
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
import { MOCK_REVIEWS, MOCK_VENUES } from "@/band/mocks/band.mock";
import {
  DEFAULT_AVAILABILITY,
  VENUE_AVAILABILITY,
  VENUE_PACKAGES,
  GALLERY_LABELS,
} from "@/data/band";
import {
  BookingCta,
  GalleryGrid,
  ProfileHeader,
  ReviewCard,
  ReviewSummary,
} from "../components";
import { ROUTES } from "@/constants";
import { formatCount, formatCurrency } from "@/utils/helpers";
import { cn } from "@/utils/cn";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export function VenueDetailsPage() {
  const params = useParams<{ venueId: string }>();
  const venue = useMemo(
    () => MOCK_VENUES.find((item) => item.id === params.venueId),
    [params.venueId]
  );

  const availability = useMemo(
    () =>
      venue ? VENUE_AVAILABILITY[venue.id] ?? DEFAULT_AVAILABILITY : [],
    [venue]
  );
  const reviews = useMemo(
    () =>
      venue
        ? MOCK_REVIEWS.filter((review) => review.subjectName === venue.name)
        : [],
    [venue]
  );

  const calendar = useMemo(() => {
    if (availability.length === 0) return null;
    const firstDate = new Date(`${availability[0].date}T00:00:00`);
    const leadingBlanks = firstDate.getDay();
    return { leadingBlanks, days: availability };
  }, [availability]);

  if (!venue) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "BandConnect", href: ROUTES.BAND },
            { label: "Venues", href: ROUTES.BAND_VENUES },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          icon={Building2}
          title="Venue not found"
          description="This venue may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.BAND_VENUES}>Back to venues</Link>
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Venues", href: ROUTES.BAND_VENUES },
          { label: venue.name },
        ]}
        className="mb-4"
      />

      <ProfileHeader
        icon={Building2}
        name={venue.name}
        rating={venue.rating}
        ratingCount={venue.reviewCount}
        meta={[
          { icon: MapPin, label: venue.location },
          { icon: Users, label: `${formatCount(venue.capacity)} capacity` },
          {
            icon: Home,
            label: venue.setting ?? "Indoor",
          },
        ]}
        badges={[venue.venueType, venue.available ? "Available" : "Booked out"]}
        stats={[
          {
            label: "Per hour",
            value: formatCurrency(venue.pricePerHour),
          },
          { label: "Capacity", value: formatCount(venue.capacity) },
          { label: "Reviews", value: venue.reviewCount },
          { label: "Rating", value: venue.rating.toFixed(1) },
        ]}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link href={ROUTES.BAND_VENUES}>
                <ArrowLeft />
                Back
              </Link>
            </Button>
            <BookingCta
              kind="Venue"
              performerId={venue.id}
              performerName={venue.name}
              basePrice={venue.pricePerHour}
              defaultVenueId={venue.id}
            />
          </>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              Hero gallery
            </h2>
            <GalleryGrid labels={GALLERY_LABELS.slice(0, 8)} />
          </section>

          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">
              Venue information
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={Building2}
                label="Venue type"
                value={venue.venueType}
              />
              <InfoRow
                icon={Home}
                label="Setting"
                value={venue.setting ?? "Indoor"}
              />
              <InfoRow
                icon={Users}
                label="Capacity"
                value={`${formatCount(venue.capacity)} guests`}
              />
              <InfoRow
                icon={IndianRupee}
                label="Hourly rate"
                value={formatCurrency(venue.pricePerHour)}
              />
            </div>
          </Card>

          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">
              Facilities & amenities
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {venue.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-3.5 py-1.5 text-xs font-bold"
                >
                  <Check className="h-3.5 w-3.5 text-accent" />
                  {amenity}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The venue offers on-site support for load-in and soundcheck, with
              secure parking and dedicated green rooms for performers.
            </p>
          </Card>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              Pricing packages
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {VENUE_PACKAGES.map((template) => {
                const price =
                  Math.round((venue.pricePerHour * template.multiplier) / 500) *
                  500;
                return (
                  <Card
                    key={template.id}
                    interactive
                    className={cn(
                      "flex h-full flex-col p-5",
                      template.popular && "border-accent/40 shadow-elevated"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-extrabold tracking-tight">
                        {template.name}
                      </h3>
                      {template.popular ? (
                        <Badge variant="gradient" className="text-[10px]">
                          Popular
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-primary">
                      {formatCurrency(price)}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      {template.durationHours} hours
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {template.description}
                    </p>
                    <ul className="mt-4 space-y-1.5 border-t border-border/70 pt-3">
                      {template.inclusions.map((inclusion) => (
                        <li
                          key={inclusion}
                          className="text-xs text-muted-foreground"
                        >
                          · {inclusion}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              Availability — September 2026
            </h2>
            <Card className="p-5">
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {WEEKDAY_LABELS.map((label) => (
                  <p
                    key={label}
                    className="pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    {label}
                  </p>
                ))}
                {calendar
                  ? Array.from({ length: calendar.leadingBlanks }).map(
                      (_, index) => <span key={`blank-${index}`} />
                    )
                  : null}
                {calendar
                  ? calendar.days.map((day) => {
                      const dayNumber = Number(day.date.slice(-2));
                      return (
                        <span
                          key={day.date}
                          title={`${day.date} — ${day.status}`}
                          className={cn(
                            "flex h-9 items-center justify-center rounded-lg text-xs font-bold transition-transform hover:scale-105",
                            day.status === "Available"
                              ? "bg-brand-gradient-soft text-accent"
                              : "bg-muted text-muted-foreground line-through"
                          )}
                        >
                          {dayNumber}
                        </span>
                      );
                    })
                  : null}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-brand-gradient" />
                  Available
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-muted" />
                  Booked
                </span>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <Star className="h-4 w-4 text-accent" />
              Reviews
            </h2>
            {reviews.length > 0 ? (
              <>
                <ReviewSummary ratings={reviews.map((r) => r.rating)} />
                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyCard
                icon={Star}
                title="No reviews yet"
                description="Reviews from promoters who hired this venue will appear here."
              />
            )}
          </section>
        </div>

        <div className="space-y-6">
          <Card className="animate-fade-in-up p-6">
            <h2 className="text-lg font-extrabold tracking-tight">
              Book this venue
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              From{" "}
              <span className="font-extrabold text-foreground">
                {formatCurrency(venue.pricePerHour)}
              </span>{" "}
              per hour. Choose a hire package and hold your date.
            </p>
            <BookingCta
              kind="Venue"
              performerId={venue.id}
              performerName={venue.name}
              basePrice={venue.pricePerHour}
              defaultVenueId={venue.id}
              className="mt-5 w-full"
            />
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Dates are held for 48 hours (demo mode).
            </p>
          </Card>

          <Card className="animate-fade-in-up p-6 [animation-delay:80ms]">
            <h2 className="text-lg font-extrabold tracking-tight">Location</h2>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-accent" />
              {venue.location}
            </p>
            <div className="mt-4 flex h-36 items-center justify-center rounded-xl bg-muted/60">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient shadow-elevated">
                <MapPin className="h-5 w-5 text-white" />
              </span>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Map preview (demo)
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
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
