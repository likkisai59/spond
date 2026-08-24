"use client";

import { useMemo, useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { Mic2, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks";
import { BAND_GENRES, type BandGenre } from "@/types";
import { ROUTES } from "@/constants";
// Mock removed
import { ArtistCard } from "../components/artist-card";

type SortKey = "rating" | "price-asc" | "price-desc" | "gigs";
type AvailabilityFilter = "all" | "Available" | "Limited" | "Booked";

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Top rated", value: "rating" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Most gigs", value: "gigs" },
];

export function ArtistsPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [minRating, setMinRating] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("rating");
  const debouncedSearch = useDebounce(search, 250);

  const [rawArtists, setRawArtists] = useState<any[]>([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await apiClient.get("/band/analytics/artists");
        // Map analytics to the UI shape
        const mapped = (response.data.items || response.data || []).map((a: any) => ({
          id: a.artist_id || a.id || Math.random().toString(),
          name: a.artist_id || "Unknown Artist",
          location: "Remote",
          genres: ["Pop", "Rock"], // Fallback genres
          availability: "Available",
          rating: a.performance_score || 0,
          priceFrom: a.total_revenue || 0,
          completedGigs: a.total_events || 0,
          verified: true,
          bio: "Analytics driven profile.",
          reviewCount: a.total_bookings || 0
        }));
        setRawArtists(mapped);
      } catch (error) {
        console.error("Failed to fetch artists", error);
      }
    };
    fetchArtists();
  }, []);

  const filteredArtists = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return rawArtists.filter((artist) => {
      const matchesQuery =
        query.length === 0 ||
        artist.name.toLowerCase().includes(query) ||
        artist.location.toLowerCase().includes(query) ||
        artist.genres.some((g: string) => g.toLowerCase().includes(query));
      const matchesGenre = genre === "all" || artist.genres.includes(genre as BandGenre);
      const matchesAvailability =
        availability === "all" || artist.availability === availability;
      const matchesRating =
        minRating === "all" || artist.rating >= Number(minRating);
      return matchesQuery && matchesGenre && matchesAvailability && matchesRating;
    }).sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.priceFrom - b.priceFrom;
        case "price-desc":
          return b.priceFrom - a.priceFrom;
        case "gigs":
          return b.completedGigs - a.completedGigs;
        default:
          return b.rating - a.rating;
      }
    });
  }, [debouncedSearch, genre, availability, minRating, sort, rawArtists]);

  const hasActiveFilters =
    search.length > 0 ||
    genre !== "all" ||
    availability !== "all" ||
    minRating !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setGenre("all");
    setAvailability("all");
    setMinRating("all");
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Artists" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Artists"
        description="Discover solo performers, vocalists and DJs for your next event."
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center animate-fade-in-up">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search artists, genres, cities…"
            className="pl-9"
            aria-label="Search artists"
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="sm:w-40" aria-label="Filter by genre">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {BAND_GENRES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={availability}
            onValueChange={(value) => setAvailability(value as AvailabilityFilter)}
          >
            <SelectTrigger className="sm:w-40" aria-label="Filter by availability">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any availability</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Limited">Limited</SelectItem>
              <SelectItem value="Booked">Booked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger className="sm:w-40" aria-label="Filter by rating">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any rating</SelectItem>
              <SelectItem value="4.5">4.5+ stars</SelectItem>
              <SelectItem value="4.7">4.7+ stars</SelectItem>
              <SelectItem value="4.8">4.8+ stars</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
            <SelectTrigger className="sm:w-48" aria-label="Sort artists">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4 text-accent" />
        {filteredArtists.length} artist{filteredArtists.length === 1 ? "" : "s"} found
      </div>

      <div className="mt-4">
        {filteredArtists.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <EmptyCard
            icon={hasActiveFilters ? SearchX : Mic2}
            title="No artists found"
            description={
              hasActiveFilters
                ? "Try a different search term, genre or filter combination."
                : "Artists will appear here once the marketplace listings are live."
            }
            action={
              hasActiveFilters ? (
                <Button variant="accent" onClick={handleResetFilters}>
                  Clear search & filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </PageContainer>
  );
}
