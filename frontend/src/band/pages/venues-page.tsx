"use client";

import { useMemo, useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { Building2, Search, SearchX } from "lucide-react";
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
import { ROUTES } from "@/constants";
// Mock removed
import { VenueCard } from "../components/venue-card";

type CapacityFilter = "all" | "intimate" | "mid" | "large";
type SortKey = "rating" | "price-asc" | "price-desc" | "capacity";
type SettingFilter = "all" | "Indoor" | "Outdoor";

const CAPACITY_OPTIONS: { label: string; value: CapacityFilter; test: (n: number) => boolean }[] = [
  { label: "Any capacity", value: "all", test: () => true },
  { label: "Up to 200", value: "intimate", test: (n) => n <= 200 },
  { label: "200 – 800", value: "mid", test: (n) => n > 200 && n <= 800 },
  { label: "800+", value: "large", test: (n) => n > 800 },
];

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "Top rated", value: "rating" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Largest capacity", value: "capacity" },
];

export function VenuesPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string>("all");
  const [capacity, setCapacity] = useState<CapacityFilter>("all");
  const [setting, setSetting] = useState<SettingFilter>("all");
  const [sort, setSort] = useState<SortKey>("rating");
  const debouncedSearch = useDebounce(search, 250);

  const [rawVenues, setRawVenues] = useState<any[]>([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await apiClient.get("/band/analytics/venues");
        const mapped = (response.data.items || response.data || []).map((v: any) => ({
          id: v.venue_id || v.id || Math.random().toString(),
          name: v.venue_id || "Unknown Venue",
          location: "Downtown Area",
          city: "New York",
          setting: "Indoor",
          capacity: Math.round((v.utilization_rate || 0.5) * 1000) || 500,
          rating: 4.0 + (v.utilization_rate || 0),
          reviewCount: v.total_bookings || 0,
          pricePerHour: v.total_revenue ? v.total_revenue / (v.total_bookings || 1) : 100,
          images: [],
          features: ["PA System"]
        }));
        setRawVenues(mapped);
      } catch (error) {
        console.error("Failed to fetch venues", error);
      }
    };
    fetchVenues();
  }, []);

  const cities = useMemo(
    () => Array.from(new Set(rawVenues.map((venue) => venue.city))).sort(),
    [rawVenues]
  );

  const filteredVenues = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const capacityTest =
      CAPACITY_OPTIONS.find((option) => option.value === capacity)?.test ??
      (() => true);
    return rawVenues.filter((venue) => {
      const matchesQuery =
        query.length === 0 ||
        venue.name.toLowerCase().includes(query) ||
        venue.location.toLowerCase().includes(query);
      const matchesCity = city === "all" || venue.city === city;
      const matchesCapacity = capacityTest(venue.capacity);
      const matchesSetting =
        setting === "all" || (venue.setting ?? "Indoor") === setting;
      return matchesQuery && matchesCity && matchesCapacity && matchesSetting;
    }).sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.pricePerHour - b.pricePerHour;
        case "price-desc":
          return b.pricePerHour - a.pricePerHour;
        case "capacity":
          return b.capacity - a.capacity;
        default:
          return b.rating - a.rating;
      }
    });
  }, [debouncedSearch, city, capacity, setting, sort, rawVenues]);

  const hasActiveFilters =
    search.length > 0 ||
    city !== "all" ||
    capacity !== "all" ||
    setting !== "all";

  const handleResetFilters = () => {
    setSearch("");
    setCity("all");
    setCapacity("all");
    setSetting("all");
  };

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "BandConnect", href: ROUTES.BAND },
          { label: "Venues" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Venues"
        description="Clubs, auditoriums and open-air stages ready for your show."
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center animate-fade-in-up">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search venues or areas…"
            className="pl-9"
            aria-label="Search venues"
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="sm:w-40" aria-label="Filter by city">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={capacity}
            onValueChange={(value) => setCapacity(value as CapacityFilter)}
          >
            <SelectTrigger className="sm:w-40" aria-label="Filter by capacity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAPACITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={setting}
            onValueChange={(value) => setSetting(value as SettingFilter)}
          >
            <SelectTrigger className="sm:w-36" aria-label="Filter by setting">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Indoor & outdoor</SelectItem>
              <SelectItem value="Indoor">Indoor</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
            <SelectTrigger className="sm:w-48" aria-label="Sort venues">
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

      <div className="mt-6 text-sm font-semibold text-muted-foreground">
        {filteredVenues.length} venue{filteredVenues.length === 1 ? "" : "s"} found
      </div>

      <div className="mt-4">
        {filteredVenues.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <EmptyCard
            icon={hasActiveFilters ? SearchX : Building2}
            title="No venues found"
            description={
              hasActiveFilters
                ? "Try a different search term, city, setting or capacity filter."
                : "Venues will appear here once the marketplace listings are live."
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
