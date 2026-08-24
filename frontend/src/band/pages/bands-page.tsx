"use client";

import { useMemo, useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { Music, Search, SearchX } from "lucide-react";
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
import { BandCard } from "../components/band-card";

type AvailabilityFilter = "all" | "Available" | "Limited" | "Booked";

export function BandsPage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const debouncedSearch = useDebounce(search, 250);

  const [rawBands, setRawBands] = useState<any[]>([]);

  useEffect(() => {
    const fetchBands = async () => {
      try {
        const response = await apiClient.get("/band/analytics/artists");
        // Reuse artist analytics data for bands as a placeholder
        const mapped = (response.data.items || response.data || []).map((a: any) => ({
          id: a.artist_id || Math.random().toString(),
          name: (a.artist_id || "Unknown Band") + " Band",
          location: "On Tour",
          genres: ["Indie", "Rock"],
          availability: "Available",
          rating: a.performance_score || 0,
          priceFrom: (a.total_revenue || 0) * 2,
          completedGigs: a.total_events || 0,
          verified: false,
          bio: "Analytics generated band profile.",
          reviewCount: a.total_bookings || 0,
          memberCount: 4
        }));
        setRawBands(mapped);
      } catch (error) {
        console.error("Failed to fetch bands", error);
      }
    };
    fetchBands();
  }, []);

  const filteredBands = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return rawBands.filter((band) => {
      const matchesQuery =
        query.length === 0 ||
        band.name.toLowerCase().includes(query) ||
        band.location.toLowerCase().includes(query) ||
        band.genres.some((g: string) => g.toLowerCase().includes(query));
      const matchesGenre = genre === "all" || band.genres.includes(genre as BandGenre);
      const matchesAvailability =
        availability === "all" || band.availability === availability;
      return matchesQuery && matchesGenre && matchesAvailability;
    }).sort((a, b) => b.rating - a.rating);
  }, [debouncedSearch, genre, availability, rawBands]);

  const hasActiveFilters =
    search.length > 0 || genre !== "all" || availability !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setGenre("all");
    setAvailability("all");
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Bands" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Bands"
        description="Full-lineup acts for festivals, weddings and club nights."
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row animate-fade-in-up">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search bands, genres, cities…"
            className="pl-9"
            aria-label="Search bands"
          />
        </div>
        <Select value={genre} onValueChange={setGenre}>
          <SelectTrigger className="sm:w-44" aria-label="Filter by genre">
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
          <SelectTrigger className="sm:w-44" aria-label="Filter by availability">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any availability</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Limited">Limited</SelectItem>
            <SelectItem value="Booked">Booked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 text-sm font-semibold text-muted-foreground">
        {filteredBands.length} band{filteredBands.length === 1 ? "" : "s"} found
      </div>

      <div className="mt-4">
        {filteredBands.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBands.map((band) => (
              <BandCard key={band.id} band={band} />
            ))}
          </div>
        ) : (
          <EmptyCard
            icon={hasActiveFilters ? SearchX : Music}
            title="No bands found"
            description={
              hasActiveFilters
                ? "Try a different search term, genre or availability filter."
                : "Bands will appear here once the marketplace listings are live."
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
