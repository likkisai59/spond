/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { bandService } from "@/services/band";
import { Loader2 } from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isEntertainmentVenue } from "@/utils/sportsFilter";
import {
  Search,
  MapPin,
  Users,
  Building2,
  IndianRupee,
  Sparkles,
  CheckCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";

// ─── Filter Constants ─────────────────────────────────────────────────────────

const VENUE_TYPES = [
  "Banquet Hall",
  "Concert Arena",
  "Resort",
  "Hotel",
  "Rooftop",
  "Club",
  "Stadium",
  "Auditorium",
];

const CITIES = [
  "Chennai", "Bengaluru", "Hyderabad", "Mumbai", "Delhi", "Pune", "Kolkata", "Ahmedabad",
];

const CAPACITY_OPTIONS = [
  { label: "Up to 100", value: "100" },
  { label: "Up to 250", value: "250" },
  { label: "Up to 500", value: "500" },
  { label: "Up to 1000", value: "1000" },
  { label: "1000+", value: "5000" },
];

const RATINGS = [3, 3.5, 4, 4.5, 5];

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenuesMarketplacePage() {
  const [venues, setVenues] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filter state
  const [search, setSearch] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);
  const [venueType, setVenueType] = React.useState("");
  const [city, setCity] = React.useState("");
  const [minCapacity, setMinCapacity] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [minRating, setMinRating] = React.useState("");

  const hasActiveFilters = !!(venueType || city || minCapacity || maxPrice || minRating);

  const clearFilters = () => {
    setVenueType("");
    setCity("");
    setMinCapacity("");
    setMaxPrice("");
    setMinRating("");
  };

  const fetchVenues = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await (bandService as any).getVenues?.() ?? [];
      const allVenues = Array.isArray(data) ? data : data?.results ?? data?.items ?? [];
      // Bug fix: exclude sports/club venues from band entertainment marketplace
      setVenues(allVenues.filter((v: any) => isEntertainmentVenue(v as Record<string, unknown>)));
    } catch (err: any) {
      setError(err?.message || "Failed to load venues. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // Client-side filtering
  const filteredVenues = React.useMemo(() => {
    return venues.filter((venue: any) => {
      const vName = (venue.name || venue.venue_name || venue.display_name || "").toLowerCase();
      const vCity = (venue.city?.name || venue.city || venue.district || venue.state || venue.address || "").toLowerCase();
      const vType = (venue.venue_type || venue.type || "").toLowerCase();
      const vCapacity = Number(venue.capacity || venue.max_capacity || venue.min_capacity || 0);
      const vPrice = Number(venue.base_price || venue.pricing_details?.base_price || (typeof venue.pricing === "number" ? venue.pricing : 0) || 0);
      const vRating = Number(venue.rating || 0);

      if (search) {
        const q = search.toLowerCase();
        const matchName = vName.includes(q);
        const matchCity = vCity.includes(q);
        if (!matchName && !matchCity) return false;
      }
      if (venueType && vType !== venueType.toLowerCase()) return false;
      if (city && !vCity.includes(city.toLowerCase())) return false;
      if (minCapacity && vCapacity < Number(minCapacity)) return false;
      if (maxPrice && vPrice > Number(maxPrice)) return false;
      if (minRating && vRating < Number(minRating)) return false;
      return true;
    });
  }, [venues, search, venueType, city, minCapacity, maxPrice, minRating]);

  return (
    <div className="min-h-screen p-6 space-y-6 relative">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 rounded-full border border-secondary/25 text-secondary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Discover Premium Event Spaces</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground font-heading">
          Find the Perfect Venue
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Browse our curated list of verified banquet halls, concert arenas, resorts, and
          private event spaces. Compare capacities, pricing, and real photos — all in one
          place.
        </p>
      </div>

      {/* ── Search + Filter Bar ──────────────────────────────────────────────── */}
      <Card className="relative z-10 bg-card/45 backdrop-blur-md border border-border/85 rounded-2xl p-5 mb-4 shadow-xl">
        {/* Primary search row */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="venue-search"
              placeholder="Search venue name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border/80 h-10 text-xs text-foreground"
            />
          </div>

          <Button
            id="toggle-venue-filters"
            variant="outline"
            size="sm"
            className="h-10 flex items-center gap-1.5 font-semibold shrink-0"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-white text-[9px] font-black">
                ✓
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 text-muted-foreground hover:text-foreground shrink-0"
              onClick={clearFilters}
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Expanded filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Venue Type */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Venue Type
              </label>
              <select
                id="venue-type-filter"
                value={venueType}
                onChange={(e) => setVenueType(e.target.value)}
                className="w-full h-10 rounded-lg border border-border/80 bg-card text-foreground text-xs px-3 focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="">All Venue Types</option>
                {VENUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                City
              </label>
              <select
                id="venue-city-filter"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 rounded-lg border border-border/80 bg-card text-foreground text-xs px-3 focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="">All Cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Min Capacity */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Min Capacity (guests)
              </label>
              <select
                id="venue-capacity-filter"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
                className="w-full h-10 rounded-lg border border-border/80 bg-card text-foreground text-xs px-3 focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="">Any Capacity</option>
                {CAPACITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Max Price (₹/day)
              </label>
              <Input
                id="venue-max-price"
                type="number"
                placeholder="e.g. 200000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-card border-border/80 h-10 text-xs text-foreground"
              />
            </div>

            {/* Amenities (visual placeholder — backend supports future) */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Amenities
              </label>
              <select
                id="venue-amenities-filter"
                className="w-full h-10 rounded-lg border border-border/80 bg-card text-foreground text-xs px-3 focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="">Any Amenities</option>
                <option value="parking">Parking</option>
                <option value="catering">Catering</option>
                <option value="av_equipment">AV Equipment</option>
                <option value="ac">Air Conditioning</option>
                <option value="stage">Stage / Podium</option>
              </select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Min Rating
              </label>
              <select
                id="venue-rating-filter"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full h-10 rounded-lg border border-border/80 bg-card text-foreground text-xs px-3 focus:outline-none focus:ring-1 focus:ring-secondary"
              >
                <option value="">Any Rating</option>
                {RATINGS.map((r) => (
                  <option key={r} value={r}>⭐ {r}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="relative z-10 flex flex-wrap gap-2 mb-4">
          {venueType && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold rounded-full">
              {venueType}
              <button onClick={() => setVenueType("")} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
          {city && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold rounded-full">
              {city}
              <button onClick={() => setCity("")} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
          {minCapacity && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold rounded-full">
              {CAPACITY_OPTIONS.find(o => o.value === minCapacity)?.label || minCapacity} guests
              <button onClick={() => setMinCapacity("")} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold rounded-full">
              Up to ₹{Number(maxPrice).toLocaleString("en-IN")}/day
              <button onClick={() => setMaxPrice("")} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
          {minRating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold rounded-full">
              ⭐ {minRating}
              <button onClick={() => setMinRating("")} className="hover:opacity-70"><X className="h-2.5 w-2.5" /></button>
            </span>
          )}
        </div>
      )}

      {/* Results Grid */}
      <div className="relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <Loader2 className="h-8 w-8 text-secondary animate-spin" />
            <p className="text-xs text-muted-foreground animate-pulse font-medium">
              Loading premium event spaces...
            </p>
          </div>
        ) : error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <ErrorState title="Failed to load venues" onRetry={fetchVenues} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue: any) => {
              const venueDisplayName = venue.venue_name || venue.name || venue.display_name || "Venue";
              const venueCapacity = venue.capacity || venue.max_capacity || venue.min_capacity || 0;
              const venueLocation = (venue as any).city?.name || venue.city || venue.district || venue.state || venue.address?.split(",").slice(-2, -1)[0]?.trim() || "India";
              const venuePrice = venue.base_price || venue.pricing_details?.base_price || (typeof venue.pricing === "number" ? venue.pricing : 0);
              const coverImage =
                venue.metadata_fields?.cover_image ||
                venue.cover_image ||
                venue.profile_image ||
                (typeof venue.gallery?.[0] === "string" ? venue.gallery[0] : (venue.gallery?.[0] as any)?.url) ||
                (Array.isArray(venue.images) && venue.images[0]) ||
                "https://images.unsplash.com/photo-1519167758481-83f550bb49b3";
              return (
                <Link key={venue.id} href={`/band/marketplace/venues/${venue.id}`}>
                  <Card className="bg-card/45 backdrop-blur-md border border-border/70 overflow-hidden hover:border-primary/45 transition-all duration-300 group h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-52 w-full overflow-hidden">
                      <img
                        src={coverImage}
                        alt={venueDisplayName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        {venue.verification_status === "approved" && (
                          <span className="flex items-center gap-0.5 bg-emerald-500/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-secondary/90 hover:bg-secondary text-white font-bold text-[9px] uppercase px-2 py-0.5">
                          {venue.venue_type || "Venue"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors truncate">
                          {venueDisplayName}
                        </h3>

                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            {venueLocation}
                          </span>
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-secondary" />
                            {venueCapacity > 0 ? `Up to ${venueCapacity.toLocaleString()} guests` : "Flexible capacity"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5 text-secondary" />
                            {venue.facilities?.length || 0} facilities
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5">
                          {venue.description || "Premium event space available for bookings."}
                        </p>
                      </div>

                      <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                            Starting From
                          </span>
                          <span className="text-sm font-black text-foreground font-mono flex items-center gap-0.5">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {venuePrice > 0 ? Number(venuePrice).toLocaleString("en-IN") : "Contact for Pricing"}
                            {venuePrice > 0 && (
                              <span className="text-[10px] font-normal text-muted-foreground ml-0.5">
                                / day
                              </span>
                            )}
                          </span>
                        </div>
                        <Button size="sm" className="font-bold text-xs h-8 rounded-lg cursor-pointer bg-secondary hover:bg-secondary/90 text-white">
                          Explore Venue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}

            {filteredVenues.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center space-y-3">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground italic">
                  No approved event venues matching your filters were found.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
