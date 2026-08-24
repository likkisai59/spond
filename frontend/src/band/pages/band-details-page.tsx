"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  MapPin,
  Music,
  Play,
  Star,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { MOCK_BANDS, MOCK_REVIEWS } from "@/band/mocks/band.mock";
import {
  BAND_MEMBERS,
  BAND_PACKAGES,
  BAND_VIDEOS,
  GALLERY_LABELS,
} from "@/data/band";
import {
  AvailabilityBadge,
  BookingCta,
  GalleryGrid,
  ProfileHeader,
  ReviewCard,
  ReviewSummary,
} from "../components";
import { ROUTES } from "@/constants";
import { formatCurrency, getInitials } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import { cn } from "@/utils/cn";

export function BandDetailsPage() {
  const params = useParams<{ bandId: string }>();
  const band = useMemo(
    () => MOCK_BANDS.find((item) => item.id === params.bandId),
    [params.bandId]
  );

  const members = useMemo(
    () => (band ? BAND_MEMBERS[band.id] ?? [] : []),
    [band]
  );
  const reviews = useMemo(
    () =>
      band
        ? MOCK_REVIEWS.filter((review) => review.subjectName === band.name)
        : [],
    [band]
  );

  if (!band) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "BandConnect", href: ROUTES.BAND },
            { label: "Bands", href: ROUTES.BAND_BANDS },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          icon={Music}
          title="Band not found"
          description="This band may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.BAND_BANDS}>Back to bands</Link>
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
          { label: "Bands", href: ROUTES.BAND_BANDS },
          { label: band.name },
        ]}
        className="mb-4"
      />

      <ProfileHeader
        icon={Music}
        name={band.name}
        verified={band.verified}
        rating={band.rating}
        ratingCount={band.reviewCount}
        meta={[
          { icon: MapPin, label: band.location },
          { icon: Users, label: `${band.members} members` },
          {
            icon: CalendarClock,
            label: `Free from ${formatDate(band.nextAvailable)}`,
          },
        ]}
        badges={[band.availability, `${band.completedGigs} gigs completed`]}
        stats={[
          { label: "Starting from", value: formatCurrency(band.priceFrom) },
          { label: "Members", value: band.members },
          { label: "Reviews", value: band.reviewCount },
          { label: "Rating", value: band.rating.toFixed(1) },
        ]}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link href={ROUTES.BAND_BANDS}>
                <ArrowLeft />
                Back
              </Link>
            </Button>
            <BookingCta
              kind="Band"
              performerId={band.id}
              performerName={band.name}
              basePrice={band.priceFrom}
            />
          </>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">About</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {band.bio}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <AvailabilityBadge status={band.availability} />
              {band.genres.map((genre) => (
                <Badge key={genre} variant="gradient" className="text-[10px]">
                  {genre}
                </Badge>
              ))}
            </div>
          </Card>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">Members</h2>
            {members.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {members.map((member) => (
                  <Card
                    key={member.id}
                    interactive
                    className="flex items-center gap-3.5 p-4"
                  >
                    <Avatar className="h-11 w-11">
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      since {member.since}
                    </Badge>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyCard
                icon={Users}
                title="Members not listed"
                description="This band has not shared its full lineup yet."
              />
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">Gallery</h2>
            <GalleryGrid labels={GALLERY_LABELS.slice(0, 8)} />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">Videos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BAND_VIDEOS.map((video) => (
                <Card
                  key={video.id}
                  interactive
                  className="animate-fade-in-up overflow-hidden"
                >
                  <div className="relative flex aspect-video items-center justify-center bg-primary/90">
                    <div
                      className="absolute inset-0 bg-brand-gradient opacity-40"
                      aria-hidden="true"
                    />
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="ml-0.5 h-5 w-5 text-white" />
                    </span>
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white">
                      {video.duration}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="truncate text-sm font-bold">{video.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {video.venue} · {video.views} views
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">Pricing</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {BAND_PACKAGES.map((template) => {
                const price =
                  Math.round((band.priceFrom * template.multiplier) / 500) * 500;
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
                description="Reviews from hosts who booked this band will appear here."
              />
            )}
          </section>
        </div>

        <div className="space-y-6">
          <Card className="animate-fade-in-up p-6">
            <h2 className="text-lg font-extrabold tracking-tight">
              Book {band.name}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Starting from{" "}
              <span className="font-extrabold text-foreground">
                {formatCurrency(band.priceFrom)}
              </span>{" "}
              per event. Pick a package, date and venue to send a request.
            </p>
            <BookingCta
              kind="Band"
              performerId={band.id}
              performerName={band.name}
              basePrice={band.priceFrom}
              className="mt-5 w-full"
            />
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              No charges until the band confirms (demo mode).
            </p>
          </Card>

          <Card className="animate-fade-in-up p-6 [animation-delay:80ms]">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <CalendarClock className="h-4 w-4 text-accent" />
              Availability
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Currently <span className="font-bold text-foreground">{band.availability.toLowerCase()}</span> —
              next open date is {formatDate(band.nextAvailable)}.
            </p>
            <AvailabilityBadge status={band.availability} className="mt-3" />
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
