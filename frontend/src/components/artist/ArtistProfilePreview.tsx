/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
"use client";

import * as React from "react";
import Image from "next/image";
import { ArtistProfile } from "@/types/artist";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Globe, 
  Award, 
  Clock, 
  Navigation, 
  Volume2, 
  Trophy,
  Sparkles,
  Image as ImageIcon,
  Video
} from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import { formatImageUrl } from "@/utils/helpers";
import { FavoriteButton } from "@/components/shared/FavoriteButton";

interface ArtistProfilePreviewProps {
  profile: ArtistProfile;
}

export function ArtistProfilePreview({ profile }: ArtistProfilePreviewProps) {
  const hasSocials = profile.social_links && Object.values(profile.social_links).some(Boolean);
  const achievements = profile.achievements || [];

  return (
    <div className="space-y-6">
      {/* Profile Header Cards */}
      <Card className="bg-card/45 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover Banner */}
        <div className="h-44 sm:h-60 bg-gradient-to-r from-primary/30 to-purple-600/30 relative">
          {profile.cover_image ? (
            <Image unoptimized src={formatImageUrl(profile.cover_image)} alt="Cover Banner" fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs italic">
              No cover image uploaded
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
          <div className="absolute top-4 right-4 z-10">
            <FavoriteButton 
              className="bg-black/40 hover:bg-black/60 border-none text-white shadow-xl"
              item={{
                id: profile.id || (profile as any)._id,
                name: (profile as unknown as Record<string, { name?: string }>).user?.name || (profile as unknown as Record<string, string>).name || profile.display_name || "Performer",
                type: "artist",
                category: profile.band_type || "Artist",
                location: profile.city || profile.state || "Not specified",
                rating: typeof (profile as any).rating === "number" ? (profile as any).rating : 5.0,
                reviewCount: (profile as any).review_count || 0,
                priceStartingAt: profile.base_rate || 0,
                image: formatImageUrl(profile.cover_image || profile.profile_image || "https://images.unsplash.com/photo-1516280440502-6c2e8c26bbec")
              }}
            />
          </div>
        </div>

        {/* Profile Info Overlay */}
        <CardContent className="p-6 relative pt-0 flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-bg-card overflow-hidden bg-accent/80 shadow-lg shrink-0 relative">
            {profile.profile_image ? (
              <Image unoptimized src={formatImageUrl(profile.profile_image)} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-semibold">
                No avatar
              </div>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1 pb-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              {(profile as unknown as Record<string, { name?: string }>).user?.name || (profile as unknown as Record<string, string>).name || profile.display_name || "Performer"}
            </h2>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">@{profile.display_name}</span>
              <span className="text-muted-foreground">•</span>
              <span>{profile.band_type}</span>
              <span className="text-muted-foreground">•</span>
              <span>{profile.years_of_experience} Years Exp</span>
            </div>
          </div>

          {/* Pricing indicator */}
          <div className="bg-accent border border-border px-5 py-3 rounded-2xl text-center self-stretch sm:self-auto flex flex-col justify-center shadow-md">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Base Rate</span>
            <span className="text-lg font-black text-foreground block">
              {formatCurrency(profile.base_rate)} / hr
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: About & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Widget */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                About The Band
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {profile.bio || "No biography provided yet. Complete your profile details to tell clients about your sound!"}
              </p>

              {/* Taxonomy Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
                <div className="space-y-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Genres</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.genres?.map((g: any, i) => {
                      const name = typeof g === "string" ? g : g?.name;
                      const id = typeof g === "string" ? `genre-${i}` : (g?.id || `genre-${i}`);
                      return (
                        <Badge key={id} variant="secondary" className="text-[10px] py-1 font-semibold text-foreground">
                          {name}
                        </Badge>
                      );
                    })}
                    {(!profile.genres || profile.genres.length === 0) && <span className="text-xs text-muted-foreground italic">No genres configured</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Languages</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.languages?.map((l: any, i) => {
                      const name = typeof l === "string" ? l : l?.name;
                      const id = typeof l === "string" ? `lang-${i}` : (l?.id || `lang-${i}`);
                      return (
                        <Badge key={id} variant="outline" className="text-[10px] py-1 font-semibold text-foreground">
                          {name}
                        </Badge>
                      );
                    })}
                    {(!profile.languages || profile.languages.length === 0) && <span className="text-xs text-muted-foreground italic">No languages configured</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements widget */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                Awards & Achievements
              </h3>
              <div className="space-y-3 pt-2">
                {achievements.map((ach: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="p-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg shrink-0">
                      <Award className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xs text-muted-foreground leading-relaxed pt-0.5">{ach}</span>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No achievement labels listed.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gallery Widget */}
          {profile.gallery && profile.gallery.length > 0 && (
            <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Media Gallery
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.gallery.map((item: any, idx: number) => {
                    const imgUrl = typeof item === "string" ? item : item.url;
                    if (!imgUrl) return null;
                    return (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-border/50">
                        <img 
                          src={formatImageUrl(imgUrl)} 
                          alt={`Gallery image ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Youtube Links Widget */}
          {profile.youtube_links && profile.youtube_links.length > 0 && (
            <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-500" />
                  YouTube Videos
                </h3>
                <div className="space-y-3">
                  {profile.youtube_links.map((link: string, idx: number) => {
                    const videoId = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1];
                    if (!videoId) return null;
                    return (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm">
                        <iframe 
                          src={`https://www.youtube.com/embed/${videoId}`} 
                          title={`YouTube video ${idx + 1}`} 
                          className="w-full h-full absolute top-0 left-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Direct Videos Widget */}
          {profile.videos && profile.videos.length > 0 && (
            <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  Videos
                </h3>
                <div className="space-y-3">
                  {profile.videos.map((video: any, idx: number) => {
                    const videoUrl = typeof video === "string" ? video : video.url;
                    if (!videoUrl) return null;
                    return (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-border/50 shadow-sm">
                        <video 
                          src={formatImageUrl(videoUrl)} 
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: Gigs constraints & Equipment */}
        <div className="space-y-6">

          {/* Booking Rules Card */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Booking Parameters
              </h3>
              <div className="space-y-3.5 divide-y divide-border/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="h-4 w-4 text-muted-foreground" /> Booking Hours</span>
                  <span className="font-bold text-foreground">
                    {profile.min_booking_hours} - {profile.max_booking_hours} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Navigation className="h-4 w-4 text-muted-foreground" /> Travel Radius</span>
                  <span className="font-bold text-foreground">{profile.travel_radius} km limit</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3.5">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Navigation className="h-4 w-4 text-muted-foreground" /> Travel Surcharge</span>
                  <span className="font-bold text-foreground">{formatCurrency(profile.travel_charges)} / extra km</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Widget */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                Equipment List
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {profile.equipment && Object.keys(profile.equipment).map(key => {
                  const isIncluded = !!profile.equipment[key];
                  const label = key.replace("_", " ");
                  return (
                    <div 
                      key={key} 
                      className={`p-2.5 rounded-lg border text-center text-[10px] font-bold capitalize truncate ${
                        isIncluded 
                          ? "bg-primary/5 border-primary/20 text-foreground" 
                          : "bg-accent/10 border-border text-muted-foreground line-through"
                      }`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Social Links Panel */}
          {hasSocials && (
            <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Social Links
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.social_links?.instagram && (
                    <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-accent border border-border text-pink-400 hover:text-foreground rounded-xl transition-colors">
                      <Instagram className="h-4.5 w-4.5" />
                    </a>
                  )}
                  {profile.social_links?.facebook && (
                    <a href={profile.social_links.facebook} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-accent border border-border text-blue-400 hover:text-foreground rounded-xl transition-colors">
                      <Facebook className="h-4.5 w-4.5" />
                    </a>
                  )}
                  {profile.social_links?.twitter && (
                    <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-accent border border-border text-sky-400 hover:text-foreground rounded-xl transition-colors">
                      <Twitter className="h-4.5 w-4.5" />
                    </a>
                  )}
                  {profile.social_links?.website && (
                    <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-accent border border-border text-purple-400 hover:text-foreground rounded-xl transition-colors">
                      <Globe className="h-4.5 w-4.5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

      </div>
    </div>
  );
}
