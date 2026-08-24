"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MessageSquarePlus,
  Music2,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard, StatCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { useAppSelector } from "@/store/hooks";
import {
  selectActiveBookings,
  selectRecentBookings,
  selectUpcomingPerformances,
} from "@/store/band/selectors";
import { QuickActionCard } from "@/sports/components";
import {
  MARKETPLACE_ACTIVITY,
  MARKETPLACE_CATEGORIES,
  NEW_CONNECTIONS_COUNT,
} from "@/data/band";
import { MOCK_ARTISTS, MOCK_BANDS, MOCK_REVIEWS, MOCK_VENUES } from "@/band/mocks/band.mock";
import {
  BookingCard,
  MarketplaceSearch,
  ReviewCard,
  VenueCard,
} from "../components";
import { ROUTES } from "@/constants";
import { formatCurrency, formatTime } from "@/utils/helpers";
import { formatDate, formatRelative } from "@/utils/date";

const QUICK_ACTIONS = [
  {
    label: "Find artists",
    description: "Solo acts, vocalists & DJs",
    icon: Music2,
    href: ROUTES.BAND_ARTISTS,
  },
  {
    label: "Find bands",
    description: "Full-lineup live acts",
    icon: Users,
    href: ROUTES.BAND_BANDS,
  },
  {
    label: "Find venues",
    description: "Stages, clubs & auditoriums",
    icon: Search,
    href: ROUTES.BAND_VENUES,
  },
  {
    label: "Create booking",
    description: "Start a booking request",
    icon: CalendarDays,
    href: ROUTES.BAND_SEARCH,
  },
] as const;

export function MarketplaceDashboardPage() {
  const router = useRouter();
  const bookings = useAppSelector(selectRecentBookings);
  const activeBookings = useAppSelector(selectActiveBookings);
  const upcomingPerformances = useAppSelector(selectUpcomingPerformances);

  const totalListings =
    MOCK_ARTISTS.length + MOCK_BANDS.length + MOCK_VENUES.length;

  const recommendedVenues = useMemo(
    () => [...MOCK_VENUES].sort((a, b) => b.rating - a.rating).slice(0, 3),
    []
  );
  const recentReviews = useMemo(
    () =>
      [...MOCK_REVIEWS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3),
    []
  );
  const positiveReviews = useMemo(
    () => MOCK_REVIEWS.filter((review) => review.rating >= 4).length,
    []
  );

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Dashboard" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="BandConnect Dashboard"
        description="Your marketplace hub — bookings, performers, venues and reviews in one place."
      />

      <Card className="mt-6 animate-fade-in-up p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
          <Sparkles className="h-4 w-4 text-accent" />
          Search the marketplace
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Find artists, bands and venues across every city on BandConnect.
        </p>
        <MarketplaceSearch size="lg" className="mt-4 max-w-2xl" />
        <div className="mt-4 flex flex-wrap gap-2">
          {MARKETPLACE_CATEGORIES.slice(0, 4).map((category) => (
            <Button
              key={category.id}
              variant="secondary"
              size="sm"
              className="rounded-full text-xs"
              onClick={() =>
                router.push(
                  `/band/search?q=${encodeURIComponent(category.query)}`
                )
              }
            >
              {category.label}
            </Button>
          ))}
        </div>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total listings"
          value={totalListings}
          icon={Music2}
          className="animate-fade-in-up"
        />
        <StatCard
          label="Active bookings"
          value={activeBookings.length}
          icon={CalendarDays}
          className="animate-fade-in-up [animation-delay:60ms]"
        />
        <StatCard
          label="New connections"
          value={NEW_CONNECTIONS_COUNT}
          icon={Users}
          className="animate-fade-in-up [animation-delay:120ms]"
        />
        <StatCard
          label="Reviews received"
          value={MOCK_REVIEWS.length}
          icon={Star}
          className="animate-fade-in-up [animation-delay:180ms]"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight">
              Recent bookings
            </h2>
            <Button asChild variant="link" size="sm">
              <Link href={ROUTES.BAND_BOOKINGS}>View all</Link>
            </Button>
          </div>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={(item) =>
                    router.push(`/band/bookings/${item.id}`)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyCard
              icon={CalendarDays}
              title="No bookings yet"
              description="Booking requests you send from artist, band and venue profiles will appear here."
              action={
                <Button asChild variant="accent">
                  <Link href={ROUTES.BAND_SEARCH}>Start exploring</Link>
                </Button>
              }
            />
          )}

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-extrabold tracking-tight">
              Upcoming performances
            </h2>
          </div>
          {upcomingPerformances.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingPerformances.slice(0, 4).map((booking) => (
                <Card
                  key={booking.id}
                  interactive
                  className="animate-fade-in-up cursor-pointer p-5"
                  onClick={() => router.push(`/band/bookings/${booking.id}`)}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">
                    {formatDate(booking.eventDate)}
                  </p>
                  <p className="mt-1.5 truncate text-base font-extrabold tracking-tight">
                    {booking.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {booking.bandName} · {booking.venueName}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-muted-foreground">
                    {formatTime(booking.startTime)} – {formatTime(booking.endTime)} ·{" "}
                    {formatCurrency(booking.amount)}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No confirmed performances"
              description="Confirmed bookings will show up here with their showtimes."
            />
          )}

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-extrabold tracking-tight">
              Recommended venues
            </h2>
            <Button asChild variant="link" size="sm">
              <Link href={ROUTES.BAND_VENUES}>View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendedVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              Quick actions
            </h2>
            <div className="grid gap-3">
              {QUICK_ACTIONS.map((action) => (
                <QuickActionCard
                  key={action.label}
                  label={action.label}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <TrendingUp className="h-4 w-4 text-accent" />
              Activity timeline
            </h2>
            <Card className="p-5">
              <ol className="relative space-y-0">
                {MARKETPLACE_ACTIVITY.map((activity, index) => {
                  const isLast = index === MARKETPLACE_ACTIVITY.length - 1;
                  return (
                    <li key={activity.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                      {!isLast ? (
                        <span
                          className="absolute left-[7px] top-4 h-[calc(100%-16px)] w-0.5 bg-border"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="relative z-10 mt-1.5 h-4 w-4 shrink-0 rounded-full border-2 border-card bg-brand-gradient" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold">{activity.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                          {activity.actor} · {formatRelative(activity.timestamp)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold tracking-tight">
                Recent reviews
              </h2>
              <Button asChild variant="link" size="sm">
                <Link href={ROUTES.BAND_REVIEWS}>View all</Link>
              </Button>
            </div>
            {recentReviews.length > 0 ? (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <EmptyCard
                icon={MessageSquarePlus}
                title="No reviews yet"
                description="Reviews from hosts and promoters will appear here."
              />
            )}
            <p className="text-xs font-semibold text-muted-foreground">
              {positiveReviews} of {MOCK_REVIEWS.length} reviews are 4 stars or
              above
            </p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
