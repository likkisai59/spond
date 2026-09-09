/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
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
import {
  Search,
  MapPin,
  Star,
  Sparkles,
  SlidersHorizontal,
  X,
  Zap,
  Music2,
  IndianRupee,
  CheckCircle,
} from "lucide-react";

// ─── Filter Constants ─────────────────────────────────────────────────────────

const CITIES = [
  "Chennai", "Bengaluru", "Hyderabad", "Mumbai", "Delhi", "Pune", "Kolkata", "Ahmedabad",
];
const BAND_TYPES = ["Solo", "Duo", "3-4 Members", "5+ Members"];
const GENRES = [
  "Bollywood", "Carnatic", "Hindustani", "Jazz", "Rock", "Pop",
  "Electronic", "Folk", "Classical", "Fusion", "Instrumental",
];
const RATINGS = ["4.5+", "4.0+", "3.5+", "3.0+"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicArtistsListPage() {
  const [artists, setArtists] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [city, setCity] = React.useState("");
  const [bandType, setBandType] = React.useState("");
  const [genre, setGenre] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [minRating, setMinRating] = React.useState("");

  const fetchArtists = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bandService.getArtists();
      setArtists(data || []);
    } catch (err: any) {
      setError("Failed to fetch performers. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const hasActiveFilters = !!(city || bandType || genre || minPrice || maxPrice || minRating);

  const clearFilters = () => {
    setCity(""); setBandType(""); setGenre("");
    setMinPrice(""); setMaxPrice(""); setMinRating("");
  };

  // Client-side filtering
  const filtered = React.useMemo(() => {
    return artists.filter((a: any) => {
      const name = (a.display_name || a.name || "").toLowerCase();
      const bio = (a.bio || "").toLowerCase();
      const artistCity = (a.city || "").toLowerCase();
      const genreList: string[] = Array.isArray(a.genres)
        ? a.genres.map((g: any) => (typeof g === "string" ? g : g?.name || "")).filter(Boolean)
        : Array.isArray(a.genre) ? a.genre : [];

      if (search && !name.includes(search.toLowerCase()) && !bio.includes(search.toLowerCase())) return false;
      if (city && artistCity !== city.toLowerCase()) return false;
      if (bandType && (a.band_type || "").toLowerCase() !== bandType.toLowerCase()) return false;
      if (genre && !genreList.some((g) => g.toLowerCase().includes(genre.toLowerCase()))) return false;
      if (minPrice && (a.base_rate ?? 0) < Number(minPrice)) return false;
      if (maxPrice && (a.base_rate ?? 0) > Number(maxPrice)) return false;
      if (minRating && (a.rating ?? 0) < Number(minRating.replace("+", ""))) return false;
      return true;
    });
  }, [artists, search, city, bandType, genre, minPrice, maxPrice, minRating]);

  return (
    <div className="relative min-h-screen pb-16 pt-24 px-6 max-w-7xl mx-auto">
      {/* Background ambient glow */}
      <div className="absolute inset-0 glow-overlay pointer-events-none" />

      {/* Hero Header */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Browse Top Music Talent</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground font-heading">
          Find the Perfect Artist
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Find solo singers, instrumentalists, and multi-member rock bands in your region.
          Compare rates, genres, and real portfolios — all in one place.
        </p>
      </div>

      {/* Search + Filter Bar */}
      <Card className="relative z-10 bg-card/45 backdrop-blur-md border border-border/85 rounded-2xl p-5 mb-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="artist-search"
              placeholder="Search by name or genre..."
              className="pl-10 bg-transparent border-border/60 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 gap-1.5 text-xs font-bold"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-primary text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <select className="text-xs border border-border/60 rounded-lg px-3 py-2 bg-card text-foreground" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="text-xs border border-border/60 rounded-lg px-3 py-2 bg-card text-foreground" value={bandType} onChange={(e) => setBandType(e.target.value)}>
              <option value="">All Types</option>
              {BAND_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="text-xs border border-border/60 rounded-lg px-3 py-2 bg-card text-foreground" value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="">All Genres</option>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <Input placeholder="Min Rate (₹)" className="text-xs h-9" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <Input placeholder="Max Rate (₹)" className="text-xs h-9" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            <select className="text-xs border border-border/60 rounded-lg px-3 py-2 bg-card text-foreground" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
              <option value="">Any Rating</option>
              {RATINGS.map((r) => <option key={r} value={r}>⭐ {r}</option>)}
            </select>
          </div>
        )}
      </Card>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="relative z-10 flex flex-wrap items-center gap-2 mb-4">
          <button onClick={clearFilters} className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
            <X className="h-3 w-3" /> Clear all
          </button>
          {city && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-full">{city}<button onClick={() => setCity("")}><X className="h-2.5 w-2.5" /></button></span>}
          {bandType && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-full">{bandType}<button onClick={() => setBandType("")}><X className="h-2.5 w-2.5" /></button></span>}
          {genre && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-full">{genre}<button onClick={() => setGenre("")}><X className="h-2.5 w-2.5" /></button></span>}
        </div>
      )}

      {/* Results Grid */}
      <div className="relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground animate-pulse font-medium">
              Syncing performance talent catalog...
            </p>
          </div>
        ) : error ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <ErrorState title="Failed to load performers" description={error} onRetry={fetchArtists} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((artist: any) => {
              const coverImage =
                artist.profile_image ||
                (typeof artist.gallery?.[0] === "string" ? artist.gallery[0] : (artist.gallery?.[0] as any)?.url) ||
                "https://images.unsplash.com/photo-1501386761578-eac5c94b800a";
              const displayName = artist.display_name || artist.name || artist?.user?.name || "Performer";
              const genreList: string[] = (
                Array.isArray(artist.genres)
                  ? artist.genres.map((g: any) => (typeof g === "string" ? g : g?.name || ""))
                  : Array.isArray(artist.genre) ? artist.genre : []
              ).filter(Boolean);
              const price = artist.base_rate ?? artist.packages?.[0]?.price ?? null;

              return (
                <Link key={artist.id} href={`/band/marketplace/artists/${artist.id}`}>
                  <Card className="bg-card/45 backdrop-blur-md border border-border/70 overflow-hidden hover:border-primary/45 transition-all duration-300 group h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-52 w-full overflow-hidden">
                      <img
                        src={coverImage}
                        alt={displayName}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/90 text-white text-[8px] font-bold rounded-full">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          {typeof artist.rating === "number" ? artist.rating.toFixed(1) : "5.0"}
                        </span>
                        {artist.verification_status === "approved" && (
                          <span className="flex items-center gap-0.5 bg-emerald-500/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary hover:bg-primary text-white font-bold text-[9px] uppercase px-2 py-0.5">
                          {artist.band_type || "Artist"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors truncate">
                          {displayName}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{artist.city || artist.state || "Not specified"}</span>
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Music2 className="h-3.5 w-3.5 text-primary" />
                            {genreList.slice(0, 2).join(", ") || "Various genres"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 pt-0.5">
                          {artist.bio || "No biography registered for this live performer."}
                        </p>
                      </div>

                      <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Rate</span>
                          <span className="text-sm font-black text-foreground font-mono flex items-center gap-0.5">
                            {price != null ? (
                              <>
                                <IndianRupee className="h-3.5 w-3.5" />
                                {price.toLocaleString("en-IN")}
                                <span className="text-[10px] font-normal text-muted-foreground ml-0.5">/ hr</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground text-xs">Contact for price</span>
                            )}
                          </span>
                        </div>
                        <Button size="sm" className="font-bold text-xs h-8 rounded-lg cursor-pointer">
                          <Zap className="h-3.5 w-3.5 mr-1" />
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center space-y-3">
                <Sparkles className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground italic">
                  No active, approved music performers matching your filters were found.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
