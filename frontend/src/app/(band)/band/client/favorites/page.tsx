"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, MapPin, Trash2, Music, Building2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";

export interface FavoriteItem {
  id: string;
  name: string;
  type: "artist" | "venue";
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceStartingAt: number;
  image: string;
  savedAt: string;
}

const DEFAULT_FAVORITES: FavoriteItem[] = [];

const STORAGE_KEY = "eventhub_client_favorites";

export default function ClientFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | "artist" | "venue">("all");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAVORITES));
        setFavorites(DEFAULT_FAVORITES);
      }
    } catch {
      setFavorites(DEFAULT_FAVORITES);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const removeFavorite = (id: string, name: string) => {
    const updated = favorites.filter((item) => item.id !== id);
    setFavorites(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
    toast.success(`Removed "${name}" from your favorites`);
  };

  const filteredFavorites = favorites.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
            My Saved Favorites
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep track of top artists, bands, and venues you love for upcoming events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl font-medium">
            <Link href="/band/marketplace/artists">Find Artists</Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl font-medium">
            <Link href="/band/marketplace/venues">Browse Venues</Link>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setFilterType("all")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            filterType === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All ({favorites.length})
        </button>
        <button
          onClick={() => setFilterType("artist")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            filterType === "artist"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Music className="h-3.5 w-3.5" />
          Artists ({favorites.filter((f) => f.type === "artist").length})
        </button>
        <button
          onClick={() => setFilterType("venue")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            filterType === "venue"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Venues ({favorites.filter((f) => f.type === "venue").length})
        </button>
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <CardContent className="space-y-4 p-0">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <Heart className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">No favorites found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {filterType === "all"
                  ? "You haven't added any favorites yet. Explore the marketplace to discover incredible talent and venues!"
                  : `You don't have any saved ${filterType === "artist" ? "artists" : "venues"} yet.`}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button asChild size="sm" className="rounded-xl">
                <Link href={filterType === "venue" ? "/band/marketplace/venues" : "/band/marketplace/artists"}>
                  Explore {filterType === "venue" ? "Venues" : "Artists"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden border border-border/80 bg-card hover:shadow-lg transition-all duration-200 flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <Badge
                  variant="secondary"
                  className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold uppercase tracking-wider border-none"
                >
                  {item.type === "artist" ? "Artist / Band" : "Venue"}
                </Badge>
                <button
                  onClick={() => removeFavorite(item.id, item.name)}
                  title="Remove from favorites"
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md flex items-center justify-center transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      <span>{item.rating}</span>
                      <span className="text-muted-foreground text-[10px]">({item.reviewCount})</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-foreground mt-1 line-clamp-1">{item.name}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/70 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Starting from</span>
                    <span className="font-bold text-sm text-foreground">
                      ₹{item.priceStartingAt.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="h-8 text-xs rounded-lg px-2.5">
                      <Link href={item.type === "artist" ? `/band/marketplace/artists` : `/band/marketplace/venues`}>
                        View
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="h-8 text-xs rounded-lg px-3 gap-1">
                      <Link href={`/band/client/bookings?tab=inbox`}>
                        <Calendar className="h-3 w-3" />
                        Book
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
