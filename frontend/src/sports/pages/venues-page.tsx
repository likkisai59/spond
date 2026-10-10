"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, SearchX } from "lucide-react";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyCard } from "@/components/cards";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks";
import { VenueCard } from "../components/venue-card";
import { venuesService } from "@/services/sports";
import { ROUTES } from "@/constants";
import { cn } from "@/utils/cn";
import { INDIA_STATES_DATA } from "@/utils/indiaStates";

const CITIES = Array.from(new Set(INDIA_STATES_DATA.states.flatMap(s => s.districts))).sort();

export function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    venuesService.list().then((res) => {
      setVenues(res.data?.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredVenues = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return venues.filter((venue) => {
      const matchesQuery =
        query.length === 0 ||
        venue.name?.toLowerCase().includes(query) ||
        venue.city?.toLowerCase().includes(query);
      return matchesQuery;
    });
  }, [venues, debouncedSearch]);

  return (
    <PageContainer as="main">
      <Breadcrumb
        items={[
          { label: "Home", href: ROUTES.HOME },
          { label: "Sports", href: ROUTES.SPORTS },
          { label: "Venues" },
        ]}
        className="mb-4"
      />

      <PageHeader
        title="Venues"
        description="Discover pitches, courts and tracks near your groups and book hourly slots."
        className="animate-fade-in-up"
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            list="sports-cities-list"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search venues, cities, sports…"
            className="pl-9"
            aria-label="Search venues"
          />
          <datalist id="sports-cities-list">
             {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </datalist>
        </div>
        <p className="text-xs font-semibold text-muted-foreground lg:ml-auto">
          {filteredVenues.length} of {venues.length} venues
        </p>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading venues...</p>
        ) : venues.length === 0 ? (
          <EmptyCard
            title="No venues yet"
            description="Bookable venues will appear here once published."
          />
        ) : filteredVenues.length === 0 ? (
          <EmptyCard
            icon={SearchX}
            title="No matching venues"
            description="Try a different name, city or surface."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
