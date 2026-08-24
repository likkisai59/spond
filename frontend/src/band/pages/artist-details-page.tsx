"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Mic2,
  Music,
  Play,
  Star,
  Users,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { Card } from "@/components/shared/card";
import { MOCK_ARTISTS, MOCK_REVIEWS } from "@/band/mocks/band.mock";
import { ARTIST_PACKAGES, ARTIST_VIDEOS, GALLERY_LABELS } from "@/data/band";
import {
  AvailabilityBadge,
  BookingCta,
  GalleryGrid,
  ProfileHeader,
  ReviewCard,
  ReviewSummary,
} from "../components";
import { ROUTES } from "@/constants";
import { formatCurrency } from "@/utils/helpers";
import { cn } from "@/utils/cn";

export function ArtistDetailsPage() {
  const params = useParams<{ artistId: string }>();
  const artist = useMemo(
    () => MOCK_ARTISTS.find((item) => item.id === params.artistId),
    [params.artistId]
  );

  const reviews = useMemo(
    () =>
      artist
        ? MOCK_REVIEWS.filter((review) => review.subjectName === artist.name)
        : [],
    [artist]
  );

  if (!artist) {
    return (
      <PageContainer as="main">
        <Breadcrumb
          items={[
            { label: "Home", href: ROUTES.HOME },
            { label: "BandConnect", href: ROUTES.BAND },
            { label: "Artists", href: ROUTES.BAND_ARTISTS },
            { label: "Not found" },
          ]}
          className="mb-6"
        />
        <EmptyCard
          icon={Mic2}
          title="Artist not found"
          description="This artist may have been removed or the link is incorrect."
          action={
            <Button asChild variant="accent">
              <Link href={ROUTES.BAND_ARTISTS}>Back to artists</Link>
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
          { label: "Artists", href: ROUTES.BAND_ARTISTS },
          { label: artist.name },
        ]}
        className="mb-4"
      />

      <ProfileHeader
        icon={Mic2}
        name={artist.name}
        verified={artist.verified}
        rating={artist.rating}
        ratingCount={artist.reviewCount}
        meta={[
          { icon: MapPin, label: artist.location },
          { icon: Music, label: artist.genres.join(" · ") },
        ]}
        badges={[artist.availability, `${artist.completedGigs} gigs completed`]}
        stats={[
          { label: "Starting from", value: formatCurrency(artist.priceFrom) },
          { label: "Gigs", value: artist.completedGigs },
          { label: "Reviews", value: artist.reviewCount },
          { label: "Rating", value: artist.rating.toFixed(1) },
        ]}
        actions={
          <>
            <Button asChild variant="ghost">
              <Link href={ROUTES.BAND_ARTISTS}>
                <ArrowLeft />
                Back
              </Link>
            </Button>
            <BookingCta
              kind="Artist"
              performerId={artist.id}
              performerName={artist.name}
              basePrice={artist.priceFrom}
            />
          </>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="animate-fade-in-up p-6 sm:p-7">
            <h2 className="text-lg font-extrabold tracking-tight">About</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {artist.bio}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <AvailabilityBadge status={artist.availability} />
              {artist.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="text-[10px]">
                  {genre}
                </Badge>
              ))}
            </div>
          </Card>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">Gallery</h2>
            <GalleryGrid labels={GALLERY_LABELS.slice(0, 8)} />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold tracking-tight">
              Performance videos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ARTIST_VIDEOS.map((video) => (
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
                    <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
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
            <h2 className="text-lg font-extrabold tracking-tight">
              Pricing packages
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {ARTIST_PACKAGES.map((template) => {
                const price = Math.round(
                  (artist.priceFrom * template.multiplier) / 500
                ) * 500;
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
                description="Reviews from hosts who booked this artist will appear here."
              />
            )}
          </section>
        </div>

        <div className="space-y-6">
          <Card className="animate-fade-in-up p-6">
            <h2 className="text-lg font-extrabold tracking-tight">
              Book {artist.name.split(" ")[0]}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Starting from{" "}
              <span className="font-extrabold text-foreground">
                {formatCurrency(artist.priceFrom)}
              </span>{" "}
              per event. Pick a package, date and venue — the request goes
              straight to the artist.
            </p>
            <BookingCta
              kind="Artist"
              performerId={artist.id}
              performerName={artist.name}
              basePrice={artist.priceFrom}
              className="mt-5 w-full"
            />
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              No charges until the artist confirms (demo mode).
            </p>
          </Card>

          <Card className="animate-fade-in-up p-6 [animation-delay:80ms]">
            <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <Users className="h-4 w-4 text-accent" />
              Best for
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {[
                "Weddings & sangeet nights",
                "Corporate galas",
                "Club & lounge sets",
                "Private house concerts",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
