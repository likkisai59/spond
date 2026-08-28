"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Calendar,
  MapPin,
  Mic2,
  Music,
  RotateCcw,
  SearchX,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/cards";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import {
  filtersReset,
  querySet,
  filterSet,
  recentSearchAdded,
  recentSearchesCleared,
  activeEventCleared,
} from "@/store/band/marketplace-slice";
import {
  selectMarketplaceFilters,
  selectRecentSearches,
  selectActiveEvent,
} from "@/store/band/selectors";
import { DEFAULT_RECENT_SEARCHES, MARKETPLACE_CATEGORIES } from "@/data/band";
import { MOCK_ARTISTS, MOCK_BANDS, MOCK_VENUES } from "@/band/mocks/band.mock";
import {
  ArtistCard,
  BandCard,
  FilterSidebar,
  MarketplaceSearch,
  VenueCard,
} from "../components";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/date";

type ResultKind = "all" | "artists" | "bands" | "venues";

const KIND_TABS: { label: string; value: ResultKind }[] = [
  { label: "All results", value: "all" },
  { label: "Artists", value: "artists" },
  { label: "Bands", value: "bands" },
  { label: "Venues", value: "venues" },
];

function matchesQuery(query: string, ...fields: string[]): boolean {
  if (query.length === 0) return true;
  return fields.some((field) => field.toLowerCase().includes(query));
}

export function MarketplaceSearchPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectMarketplaceFilters);
  const storedSearches = useAppSelector(selectRecentSearches);
  const activeEvent = useAppSelector(selectActiveEvent);

  const initialKind = (searchParams.get("kind") as ResultKind) || "all";
  const [kind, setKind] = useState<ResultKind>(initialKind);

  const queryParam = searchParams.get("q") ?? "";
  const cityParam = searchParams.get("city") ?? "";

  useEffect(() => {
    dispatch(querySet(queryParam));
    if (queryParam.trim().length > 0) {
      dispatch(recentSearchAdded(queryParam.trim()));
    }
    if (cityParam) {
      dispatch(filterSet({ key: "city", value: cityParam }));
    }
  }, [queryParam, cityParam, dispatch]);

  const recentSearches =
    storedSearches.length > 0 ? storedSearches : DEFAULT_RECENT_SEARCHES;

  const filteredArtists = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return MOCK_ARTISTS.filter((artist) => {
      return (
        matchesQuery(query, artist.name, artist.location, artist.bio, ...artist.genres) &&
        (filters.genre === "all" || artist.genres.includes(filters.genre as never)) &&
        (filters.city === "all" || artist.location.startsWith(filters.city)) &&
        artist.rating >= filters.minRating &&
        (filters.priceMax === 0 || artist.priceFrom <= filters.priceMax) &&
        (filters.availability === "all" || artist.availability === filters.availability)
      );
    }).sort((a, b) => b.rating - a.rating);
  }, [filters]);

  const filteredBands = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return MOCK_BANDS.filter((band) => {
      return (
        matchesQuery(query, band.name, band.location, band.bio, ...band.genres) &&
        (filters.genre === "all" || band.genres.includes(filters.genre as never)) &&
        (filters.city === "all" || band.location.startsWith(filters.city)) &&
        band.rating >= filters.minRating &&
        (filters.priceMax === 0 || band.priceFrom <= filters.priceMax) &&
        (filters.availability === "all" || band.availability === filters.availability)
      );
    }).sort((a, b) => b.rating - a.rating);
  }, [filters]);

  const filteredVenues = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return MOCK_VENUES.filter((venue) => {
      return (
        matchesQuery(query, venue.name, venue.location, venue.city, venue.venueType, ...venue.amenities) &&
        (filters.genre === "all") &&
        (filters.city === "all" || venue.city === filters.city) &&
        venue.rating >= filters.minRating &&
        (filters.priceMax === 0 || venue.pricePerHour <= filters.priceMax) &&
        (filters.setting === "all" || (venue.setting ?? "Indoor") === filters.setting) &&
        venue.capacity >= filters.capacityMin
      );
    }).sort((a, b) => b.rating - a.rating);
  }, [filters]);

  const totalResults =
    filteredArtists.length + filteredBands.length + filteredVenues.length;
  const hasQuery = queryParam.trim().length > 0;

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Search" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Marketplace search"
        description="Search across artists, bands and venues in one place."
      />

      {activeEvent && (
        <div className="mt-4 rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-card to-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500">
                  Active Event Context
                </span>
                <span className="text-xs font-bold text-foreground">
                  {activeEvent.title}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-pink-500" />
                  {formatDate(activeEvent.date)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-pink-500" />
                  {activeEvent.location}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs h-8">
              <Link href={`/band/events/${activeEvent.id}`}>Back to Dashboard →</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatch(activeEventCleared())}
              className="rounded-xl text-xs h-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 max-w-2xl animate-fade-in-up">
        <MarketplaceSearch defaultQuery={queryParam} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px,1fr]">
        <div className="hidden lg:block">
          <FilterSidebar className="sticky top-24" />
        </div>

        <div className="min-w-0 space-y-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {KIND_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setKind(tab.value)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                      kind === tab.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                {totalResults} result{totalResults === 1 ? "" : "s"} for
                {" "}
                <span className="font-extrabold text-foreground">
                  &ldquo;{queryParam}&rdquo;
                </span>
              </p>
            </div>

            <div className="lg:hidden">
              <FilterSidebar />
            </div>

            {totalResults === 0 ? (
              <EmptyCard
                icon={SearchX}
                title="No search results"
                description="Nothing matched your search and filters. Try clearing filters or a different term."
                action={
                  <Button
                    variant="accent"
                    onClick={() => {
                      dispatch(filtersReset());
                      dispatch(querySet(""));
                    }}
                  >
                    <RotateCcw />
                    Reset search & filters
                  </Button>
                }
              />
            ) : null}

            {kind === "all" || kind === "artists" ? (
              <ResultSection
                title="Artists"
                icon={Mic2}
                count={filteredArtists.length}
                emptyDescription="Adjust the genre, rating or price filters."
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredArtists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </ResultSection>
            ) : null}

            {kind === "all" || kind === "bands" ? (
              <ResultSection
                title="Bands"
                icon={Music}
                count={filteredBands.length}
                emptyDescription="Adjust the genre, city or availability filters."
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredBands.map((band) => (
                    <BandCard key={band.id} band={band} />
                  ))}
                </div>
              </ResultSection>
            ) : null}

            {kind === "all" || kind === "venues" ? (
              <ResultSection
                title="Venues"
                icon={Building2}
                count={filteredVenues.length}
                emptyDescription="Adjust the city, setting or capacity filters."
              >
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredVenues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>
              </ResultSection>
            ) : null}
          </div>
        </div>
    </PageContainer>
  );
}

function ResultSection({
  title,
  icon: Icon,
  count,
  emptyDescription,
  children,
}: {
  title: string;
  icon: typeof Mic2;
  count: number;
  emptyDescription: string;
  children: React.ReactNode;
}) {
  if (count === 0) {
    return (
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <Icon className="h-4 w-4 text-accent" />
          {title} (0)
        </h2>
        <p className="rounded-xl border border-dashed border-border/70 bg-card/60 p-5 text-sm text-muted-foreground">
          {emptyDescription}
        </p>
      </section>
    );
  }
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
        <Icon className="h-4 w-4 text-accent" />
        {title}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}
