/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
"use client";

import * as React from "react";
import { VenueResponseData } from "@/types/venue";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Clock, 
  Grid, 
  Users, 
  Sparkles, 
  Calendar, 
  Video,
  FileCheck,
  CheckCircle2,
  Phone
} from "lucide-react";

const FACILITY_OPTIONS = [
  { id: "parking", label: "Parking Space" },
  { id: "ac", label: "Air Conditioning (AC)" },
  { id: "generator", label: "Generator / Power Backup" },
  { id: "stage", label: "Elevated Stage" },
  { id: "sound_system", label: "Sound System" },
  { id: "lighting", label: "Lighting setup" },
  { id: "green_room", label: "Green Room / Makeup Space" },
  { id: "dining_hall", label: "Dining Hall" },
  { id: "kitchen", label: "Kitchen Space" },
  { id: "rest_rooms", label: "Rest Rooms" },
  { id: "wheelchair_access", label: "Wheelchair Access" },
  { id: "lift", label: "Passenger Lift" },
  { id: "wifi", label: "Guest WiFi" },
  { id: "cctv", label: "CCTV Security" },
  { id: "security", label: "Guard Security" },
  { id: "power_backup", label: "Power Backup" },
  { id: "decoration_support", label: "Decoration Support" },
  { id: "catering_support", label: "Catering Support" }
];

interface VenueProfilePreviewProps {
  profile: VenueResponseData;
}

export function VenueProfilePreview({ profile }: VenueProfilePreviewProps) {
  const weeklySchedule = profile.availability_rules?.weekly_schedule || {};
  const blockedDates = profile.availability_rules?.blocked_dates || [];
  const maintenanceDays = profile.availability_rules?.maintenance_days || [];
  const youtubeLinks = profile.metadata_fields?.youtube_links || [];

  return (
    <div className="space-y-6">
      {/* Profile Header Cards */}
      <Card className="bg-card/45 backdrop-blur-md border border-border rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover Banner */}
        <div className="h-44 sm:h-60 bg-gradient-to-r from-primary/30 to-purple-600/35 relative">
          {profile.metadata_fields?.cover_image || profile.gallery?.[0] ? (
            <img 
              src={(profile.metadata_fields?.cover_image as any) || (profile.gallery?.[0] as any)?.url || profile.gallery?.[0]} 
              alt="Cover Banner" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-1">
              <Building2 className="h-10 w-10 text-primary opacity-75" />
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
                No cover image
              </p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
        </div>

        {/* Profile Info Overlay */}
        <CardContent className="p-6 relative pt-0 flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-bg-card overflow-hidden bg-accent/90 shadow-lg shrink-0 flex items-center justify-center relative">
            <Building2 className="h-12 w-12 text-primary" />
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1 pb-2">
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {profile.name || (profile as any).venue_name || (profile as any).display_name || "Venue"}
              </h2>
              <Badge variant="outline" className="text-[9px] py-0.5 px-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 capitalize">
                {profile.verification_status || "Pending"}
              </Badge>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-primary">{profile.venue_type || "Venue"}</span>
              <span className="text-muted-foreground">•</span>
              <span>Est. {profile.metadata_fields?.established_year || (profile as any).established_year || "N/A"}</span>
              <span className="text-muted-foreground">•</span>
              <span>{profile.metadata_fields?.indoor_outdoor || (profile as any).indoor_outdoor || "Both"} Area</span>
            </div>
          </div>

          {/* Capacity settings indicator */}
          <div className="bg-accent border border-border px-5 py-3 rounded-2xl text-center self-stretch sm:self-auto flex flex-col justify-center shadow-md">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Max Guests</span>
            <span className="text-lg font-black text-foreground block">
              {profile.capacity || (profile as any).max_capacity || (profile as any).min_capacity || "Flexible"} pax
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Details Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: About & Operational schedule */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Space */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                About The Event Space
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {profile.description || "No space description provided yet."}
              </p>
            </CardContent>
          </Card>

          {/* Operational Hours */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Operating Schedule
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {Object.keys(weeklySchedule).map((day) => {
                  const item = weeklySchedule[day];
                  return (
                    <div key={day} className="flex justify-between items-center p-2.5 rounded-xl border border-border bg-accent/10">
                      <span className="text-xs font-bold text-foreground">{day}</span>
                      {item.available ? (
                        <span className="text-xs text-muted-foreground font-medium">
                          {item.start} - {item.end}
                        </span>
                      ) : (
                        <span className="text-xs text-error font-semibold">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Blocked and Maintenance Dates */}
          {(blockedDates.length > 0 || maintenanceDays.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {blockedDates.length > 0 && (
                <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-400" />
                      Blocked Dates
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {blockedDates.map((d: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[10px] py-1 border-red-500/35 text-red-400">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {maintenanceDays.length > 0 && (
                <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-400" />
                      Maintenance Days
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {maintenanceDays.map((d: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-[10px] py-1 border-amber-500/35 text-amber-400">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Youtube videos list */}
          {youtubeLinks.length > 0 && (
            <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
              <CardContent className="p-5 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" />
                  YouTube Walkthrough Media
                </h3>
                <div className="space-y-2 pt-2">
                  {youtubeLinks.map((url: string, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-center p-2.5 rounded-lg border border-border bg-accent/10">
                      <span className="p-1.5 bg-primary/10 border border-primary/20 text-primary rounded-md shrink-0">
                        <Video className="h-3.5 w-3.5" />
                      </span>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground truncate hover:text-foreground hover:underline">
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: Location, Capacity & Contact info */}
        <div className="space-y-6">

          {/* Location & Map details */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-primary" />
                Location Address
              </h3>
              <div className="space-y-2.5 text-xs text-muted-foreground">
                <p className="leading-relaxed font-medium text-foreground">{profile.address}</p>
                {profile.metadata_fields?.landmark && <p>Landmark: {profile.metadata_fields.landmark}</p>}
                <p>City / Area: {profile.city?.name || "N/A"}, {profile.metadata_fields?.area || "N/A"}</p>
                <p>State / Pin: {profile.state || "N/A"}, {profile.pincode || "N/A"}</p>
                {profile.google_map_location && (
                  <a 
                    href={profile.google_map_location} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary font-bold hover:underline pt-2"
                  >
                    <span>View on Google Maps</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Capacities card */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-primary" />
                Guest Capacity Rules
              </h3>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Min capacity</span>
                  <span className="font-black text-foreground">{profile.min_capacity} guests</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-muted-foreground">Max capacity</span>
                  <span className="font-black text-foreground">{profile.capacity} guests</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-muted-foreground">Buffer time</span>
                  <span className="font-black text-foreground">{profile.availability_rules?.booking_buffer_time || 0} Hours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities lists */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Grid className="h-4.5 w-4.5 text-primary" />
                Amenties Checklist
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {FACILITY_OPTIONS.map(opt => {
                  const hasFacility = profile.facilities?.includes(opt.id);
                  if (!hasFacility) return null;
                  return (
                    <Badge key={opt.id} variant="secondary" className="text-[10px] py-1 font-semibold text-foreground">
                      {opt.label}
                    </Badge>
                  );
                })}
                {(!profile.facilities || profile.facilities.length === 0) && (
                  <span className="text-xs text-muted-foreground italic">No facilities configured</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Representative info */}
          <Card className="bg-card/45 backdrop-blur-md border border-border rounded-2xl shadow-xl">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <FileCheck className="h-4.5 w-4.5 text-primary" />
                Contact Representative
              </h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-foreground">{profile.user.name}</span>
                </div>
                {profile.business_name && <p className="pl-6">Business Name: {profile.business_name}</p>}
                {profile.metadata_fields?.contact_person && (
                  <p className="pl-6">Representative: {profile.metadata_fields.contact_person}</p>
                )}
                <div className="flex items-center gap-2 pl-6 pt-1">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{profile.user.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
