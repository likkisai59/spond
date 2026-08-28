"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  CreditCard,
  Heart,
  MapPin,
  Mic2,
  Music2,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateEventModal } from "@/band/components/create-event-modal";
import { ROUTES } from "@/constants";

const TRENDING_TAGS = [
  { label: "Wedding Venues", kind: "venues", city: "Hyderabad" },
  { label: "Live Bands", kind: "bands", city: "Hyderabad" },
  { label: "Popular Singers", kind: "artists", city: "Hyderabad" },
  { label: "DJs & Electronic", kind: "artists", city: "Hyderabad" },
  { label: "Corporate Events", kind: "venues", city: "Hyderabad" },
];

export function EventHubHeroSection() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [category, setCategory] = useState<string>("all");
  const [location, setLocation] = useState<string>("Hyderabad");
  const [date, setDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category !== "all") params.set("kind", category);
    if (location) params.set("city", location);
    if (date) params.set("date", date);

    router.push(`/band/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {/* Background Concert Image with Dark Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074&auto=format&fit=crop"
          alt="Concert stage crowd"
          className="h-full w-full object-cover object-center opacity-40 brightness-75 scale-105 transition-transform duration-10000 ease-out animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-slate-950/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-32 flex flex-col items-center text-center">
        {/* Navigation Breadcrumb / Top Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in-up">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EventHub Marketplace · Celebrate Every Moment</span>
        </div>

        {/* Hero Title Matching Uploaded Reference */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-slate-50 leading-[1.15]">
          Find the perfect venue, artists & bands for{" "}
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 bg-clip-text text-transparent">
            your next event
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
          From intimate gatherings to grand celebrations, we connect you with the finest verified talent and venues.
        </p>

        {/* Floating Search Bar (Card matching uploaded Reference UI) */}
        <div className="mt-10 w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl border border-white/20 text-slate-900 transition-all">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
          >
            {/* Category Dropdown */}
            <div className="sm:col-span-4 flex items-center gap-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
                <Music2 className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  What are you looking for?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="all">Venue, Artist or Band</option>
                  <option value="venues">Venues & Halls</option>
                  <option value="artists">Artists & Singers</option>
                  <option value="bands">Live Music Bands</option>
                </select>
              </div>
            </div>

            {/* Location Input */}
            <div className="sm:col-span-3 flex items-center gap-3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Event Date Input */}
            <div className="sm:col-span-3 flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 text-sm"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Trending Tags Matching Reference UI */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
          <span className="font-semibold text-pink-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Trending:
          </span>
          {TRENDING_TAGS.map((tag) => (
            <Link
              key={tag.label}
              href={`/band/search?kind=${tag.kind}&city=${tag.city}`}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-slate-200 hover:text-white transition-colors"
            >
              {tag.label}
            </Link>
          ))}
        </div>

        {/* Browse Top Categories Section (Directly from reference) */}
        <div className="mt-16 sm:mt-24 w-full text-left">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-pink-400">
              Explore
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Browse Top Categories
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Discover the best venues, artists and bands for any kind of event.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Card 1: Venues */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-xl hover:border-pink-500/50 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1000&auto=format&fit=crop"
                  alt="Venues"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-amber-500/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">
                  Venues
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Banquet halls, luxury resorts, intimate rooftops and aesthetic gardens.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">120+ Locations</span>
                  <Link
                    href="/band/search?kind=venues"
                    className="text-xs font-bold text-pink-400 group-hover:translate-x-1 transition-transform flex items-center gap-1"
                  >
                    Explore Venues <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Category Card 2: Artists */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-xl hover:border-pink-500/50 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop"
                  alt="Artists"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-purple-500/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg">
                  <Mic2 className="w-5 h-5" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">
                  Artists
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Singers, solo instrumentalists, high-energy DJs and celebrity performers.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">350+ Artists</span>
                  <Link
                    href="/band/search?kind=artists"
                    className="text-xs font-bold text-pink-400 group-hover:translate-x-1 transition-transform flex items-center gap-1"
                  >
                    Explore Artists <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Category Card 3: Bands */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-xl hover:border-pink-500/50 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1000&auto=format&fit=crop"
                  alt="Bands"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-blue-500/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg">
                  <Music2 className="w-5 h-5" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">
                  Bands
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  Live bands for weddings, rock concerts, corporate evenings & galas.
                </p>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">85+ Live Bands</span>
                  <Link
                    href="/band/search?kind=bands"
                    className="text-xs font-bold text-pink-400 group-hover:translate-x-1 transition-transform flex items-center gap-1"
                  >
                    Explore Bands <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Booking Process from Reference UI */}
        <div className="mt-20 w-full">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-pink-400">
              How It Works
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Book in 4 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h4 className="font-bold text-base text-white">Create Your Event</h4>
              <p className="text-xs text-slate-400 mt-1">
                Tell us about your event date, location, guest count and budget requirements.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h4 className="font-bold text-base text-white">Discover & Compare</h4>
              <p className="text-xs text-slate-400 mt-1">
                Browse verified venues, artists, and live bands with clear pricing and availability.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h4 className="font-bold text-base text-white">Send Requests</h4>
              <p className="text-xs text-slate-400 mt-1">
                Lock your favorite providers and receive swift acceptances or counter-offers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm mb-3">
                4
              </div>
              <h4 className="font-bold text-base text-white">Confirm & Celebrate</h4>
              <p className="text-xs text-slate-400 mt-1">
                Pay 25% advance to confirm your booking and enjoy a hassle-free milestone payment experience.
              </p>
            </div>
          </div>
        </div>

        {/* Provider CTA Banner from Reference UI */}
        <div className="mt-16 w-full rounded-2xl bg-gradient-to-r from-pink-900/60 via-purple-900/40 to-slate-900/80 border border-pink-500/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div className="text-left">
            <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-[11px] font-bold uppercase tracking-wider">
              For Providers
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-2">
              Are You an Artist, Band, or Venue Owner?
            </h3>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Join thousands of providers growing their bookings with milestone payments and direct customer discovery.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              asChild
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold shadow-lg shadow-pink-600/30"
            >
              <Link href="/band/provider/onboarding">Join as Provider →</Link>
            </Button>
          </div>
        </div>
      </div>

      <CreateEventModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </section>
  );
}
