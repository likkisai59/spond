"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingService } from "@/services/bookingService";
import { BookingRequestFormData, bookingRequestSchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { bandService } from "@/services/band";
import type { Artist, BookingRequest, Venue } from "@/types/band";
import { Music, Building } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface BookingRequestFormProps {
  artistProfileId?: string;
  venueId?: string;
  artistName?: string;
  venueName?: string;
  proposedPrice?: number;
  isArtistBookingVenue?: boolean;
  isVenueBookingTalent?: boolean;
  onSuccess?: (bookingId: string) => void;
  onCancel?: () => void;
}

export function BookingRequestForm({
  artistProfileId,
  venueId,
  artistName,
  venueName,
  proposedPrice,
  isArtistBookingVenue,
  isVenueBookingTalent,
  onSuccess,
  onCancel,
}: BookingRequestFormProps) {
  const [summary, setSummary] = useState<string>("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const { user } = useAuth();

  const isArtistUser = ["artist", "band"].includes(String(user?.role ?? "").toLowerCase());

  // Normalize: treat as "artist booking venue" mode whenever the prop says so.
  // This guards against any case-sensitivity issues from the call-site.
  const effectiveIsArtistBookingVenue = Boolean(isArtistBookingVenue) || isArtistUser;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingRequestFormData>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      artist_profile_id: artistProfileId || null,
      venue_id: venueId || null,
      event_title: "",
      event_type: "",
      event_date: "",
      start_time: "",
      end_time: "",
      guest_count: undefined as unknown as number,
      proposed_price: proposedPrice || (undefined as unknown as number),
      location: venueName || "",
      address: "",
      city: "",
      state: "",
      country: "",
      postcode: "",
      google_maps_coords: "",
      special_requests: "",
      notes: "",
    },
  });

  useEffect(() => {
    async function loadProviders() {
      try {
        const [aList, bList, vList] = await Promise.all([
          bandService.getArtists().catch(() => []),
          bandService.getBands().catch(() => []),
          bandService.getVenues().catch(() => []),
        ]);
        // Combine artists and bands into the performers list
        setArtists([...aList, ...bList]);
        setVenues(vList);
      } catch {
        // Fallback gracefully
      }
    }
    loadProviders();
  }, []);

  const watchedValues = watch();

  const summaryText = useMemo(() => {
    const title = watchedValues.event_title?.trim() || "your event";
    const date = watchedValues.event_date || "a selected date";
    const timeRange =
      watchedValues.start_time && watchedValues.end_time
        ? `${watchedValues.start_time} - ${watchedValues.end_time}`
        : "a scheduled time";
    const location = watchedValues.location?.trim() || "the requested venue";
    return `Requesting ${title} for ${date} at ${timeRange} in ${location}.`;
  }, [
    watchedValues.event_title,
    watchedValues.event_date,
    watchedValues.start_time,
    watchedValues.end_time,
    watchedValues.location,
  ]);

  useEffect(() => {
    setSummary(summaryText);
  }, [summaryText]);

  const onSubmit = async (data: BookingRequestFormData) => {
    try {
      // Compose a human-readable location string from address parts
      const locationParts = [
        data.location?.trim(),
        data.address?.trim(),
        data.city?.trim(),
        data.state?.trim(),
        data.country?.trim(),
        data.postcode?.trim(),
      ].filter(Boolean);
      const composedLocation = locationParts.join(", ") || "Location not specified";

      const targetArtistId = data.artist_profile_id || artistProfileId || null;
      const targetVenueId = data.venue_id || venueId || null;

      if (!targetArtistId && !targetVenueId) {
        throw new Error("A performer or venue must be selected.");
      }

      let lastCreatedId = "";

      const submitForProvider = async (pId: string, pType: string) => {
        const strictPayload = {
          provider_id: pId,
          provider_type: pType,
          package_id: "pkg-custom",
          event_date: data.event_date,
          event_time: data.start_time,
          message: data.notes || data.special_requests || data.event_title,
          proposed_price: Number(data.proposed_price),
          location: composedLocation,
        };

        if (effectiveIsArtistBookingVenue) {
          const res = await bookingService.createArtistVenueBooking(strictPayload as Record<string, unknown>);
          return res.id;
        } else if (isVenueBookingTalent) {
          const res = await bookingService.createVenueTalentBooking(strictPayload as Record<string, unknown>);
          return res.id;
        } else {
          const bandRes = await bandService.createBooking(strictPayload as BookingRequest);
          return bandRes.id;
        }
      };

      if (targetArtistId) {
        lastCreatedId = await submitForProvider(targetArtistId, "artist");
      }
      if (targetVenueId) {
        lastCreatedId = await submitForProvider(targetVenueId, "venue");
      }

      toast.success("Booking request(s) submitted successfully!");
      if (onSuccess) onSuccess(lastCreatedId);
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } }, message?: string };
      const msg = error.response?.data?.error?.message || error.message || "Failed to submit booking request.";
      toast.error(msg);
    }
  };

  return (
    <div className="bg-[#0b0a0a] h-full max-h-[85vh] rounded-2xl text-white font-sans overflow-hidden border border-[#222] shadow-2xl w-full max-w-5xl mx-auto flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#222] px-8 py-5 bg-[#0b0a0a]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f03e65] text-white">
            <div className="h-4 w-4 bg-white rotate-45" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {effectiveIsArtistBookingVenue ? "Book a Venue" : "Create Booking Request"}
            </h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
              {artistName ? `ARTIST: ${artistName.toUpperCase()}` : venueName ? `VENUE: ${venueName.toUpperCase()}` : "SUBMIT INQUIRY"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-wider"
            >
              CANCEL
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded bg-[#f03e65] px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#d83558] transition-colors"
          >
            {isSubmitting ? "SENDING..." : "SEND REQUEST"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-12">
          
          {/* Top selection boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#222] rounded-xl overflow-hidden border border-[#333]">
            
            {/* Performer Selection */}
            <div className="bg-[#121010] p-6">
              <p className="text-[10px] font-bold text-[#f03e65] uppercase tracking-wider mb-4">Selected Performer</p>
              {!effectiveIsArtistBookingVenue && !artistProfileId ? (
                <select
                  id="artist_profile_id"
                  className="w-full h-12 rounded-lg bg-[#1a1414] border border-[#333] text-white px-4 focus:outline-none focus:border-[#f03e65] text-lg font-bold"
                  {...register("artist_profile_id", {
                    onChange: (e) => {
                      const selected = artists.find((a) => a.id === e.target.value);
                      const price = selected?.packages?.[0]?.price;
                      if (price) {
                        setValue("proposed_price", price);
                      }
                    },
                  })}
                >
                  <option value="">-- Choose Performer --</option>
                  {artists.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a1414] border border-[#333]">
                    <Music className="h-6 w-6 text-[#f03e65]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">{artistName || (effectiveIsArtistBookingVenue ? "You" : "Unknown")}</span>
                    <span className="text-[#f03e65]">✓</span>
                  </div>
                </div>
              )}
            </div>

            {/* Venue Selection */}
            <div className="bg-[#121010] p-6">
              <p className="text-[10px] font-bold text-[#f03e65] uppercase tracking-wider mb-4">Venue Select</p>
              {!venueId ? (
                <select
                  id="venue_id"
                  className="w-full h-12 rounded-lg bg-[#1a1414] border border-[#333] text-white px-4 focus:outline-none focus:border-[#f03e65] text-lg font-bold"
                  {...register("venue_id", {
                    onChange: (e) => {
                      const selected = venues.find((v) => {
                        const s = v as unknown as Record<string, unknown>;
                        return (s.id || s._id) === e.target.value;
                      });
                      if (selected) {
                        const s = selected as unknown as Record<string, unknown>;
                        setValue("location", (s.name || s.venue_name || s.business_name) as string);
                        if (s.city) setValue("city", s.city as string);
                      }
                    },
                  })}
                >
                  <option value="" className="bg-[#121010]">Choose Venue or Enter Custom Location Below</option>
                  {venues.map((v: unknown) => {
                    const sv = v as Record<string, unknown>;
                    return (
                      <option key={(sv.id || sv._id) as string} value={(sv.id || sv._id) as string} className="bg-[#121010]">
                        {(sv.name || sv.venue_name || sv.business_name || "Venue") as string} ({(sv.city || "Venue") as string})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a1414] border border-[#333]">
                    <Building className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">{venueName}</span>
                    <span className="text-[#f03e65]">✓</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Event Parameters & Location Details (2 columns on large screens) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Event Parameters */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#f03e65] pl-3 mb-8">
                Event Parameters
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="event_title" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Event Title</Label>
                <Input
                  id="event_title"
                  placeholder="e.g. Annual Tech Summit Afterparty"
                  className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                  {...register("event_title", {
                    onChange: (e) => {
                      if (/\d/.test(e.target.value)) {
                        e.target.value = e.target.value.replace(/\d/g, "");
                        setValue("event_title", e.target.value, { shouldValidate: true });
                      }
                    },
                  })}
                />
                <p className="text-[10px] text-gray-500 mt-1">Letters, spaces, and punctuation only (no numbers).</p>
                {errors.event_title && <p className="text-xs text-red-500">{errors.event_title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="event_type" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Event Type</Label>
                  <select
                    id="event_type"
                    className="w-full h-11 bg-[#161212] border border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65] px-3 text-sm"
                    {...register("event_type")}
                  >
                    <option value="" disabled>Select Event Type</option>
                    <option value="Wedding">Wedding Celebration</option>
                    <option value="Corporate Gig">Corporate Event</option>
                    <option value="Private Event">Private Party</option>
                    <option value="Concert">Public Concert</option>
                    <option value="Festival">Festival Gig</option>
                    <option value="Club Performance">Club/Pub Event</option>
                    <option value="Other">Other Occasion</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="event_date" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Date</Label>
                  <div className="relative">
                    <Input
                      id="event_date"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65] [color-scheme:dark]"
                      {...register("event_date")}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start_time" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Start Time</Label>
                  <div className="relative">
                    <Input
                      id="start_time"
                      type="time"
                      className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65] [color-scheme:dark]"
                      {...register("start_time")}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_time" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">End Time</Label>
                  <div className="relative">
                    <Input
                      id="end_time"
                      type="time"
                      className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65] [color-scheme:dark]"
                      {...register("end_time")}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="guest_count" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Expected Guests</Label>
                  <Input
                    id="guest_count"
                    type="number"
                    placeholder="e.g. 50"
                    className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                    {...register("guest_count", { valueAsNumber: true })}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proposed_price" className="text-[10px] text-[#f03e65] uppercase font-bold tracking-wider">Proposed Budget (INR)</Label>
                  <Input
                    id="proposed_price"
                    type="number"
                    placeholder="e.g. 15000"
                    className="w-full h-11 bg-[#161212] border-[#333] text-[#f03e65] font-bold rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                    {...register("proposed_price", { valueAsNumber: true })}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-6 relative">
              {/* Decorative line separator on mobile, hidden on desktop */}
              <div className="w-full h-px bg-[#333] lg:hidden mb-8"></div>
              
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#f03e65] pl-3 mb-8">
                Location Details
              </h3>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Venue Name / Description</Label>
                <Input
                  id="location"
                  placeholder="e.g. Taj West End, Grand Ballroom"
                  className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                  {...register("location")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Street Address</Label>
                <Input
                  id="address"
                  placeholder="e.g. 25 Race Course Road"
                  className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                  {...register("address")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">City</Label>
                  <Input
                    id="city"
                    placeholder="Bangalore"
                    className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                    {...register("city")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">State</Label>
                  <Input
                    id="state"
                    placeholder="Karnataka"
                    className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                    {...register("state")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Country</Label>
                  <Input
                    id="country"
                    placeholder="India"
                    className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                    {...register("country")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postcode" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Postcode</Label>
                  <Input
                    id="postcode"
                    placeholder="560001"
                    className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                    {...register("postcode")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="google_maps_coords" className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Google Maps URL or Coordinates (Optional)</Label>
                <Input
                  id="google_maps_coords"
                  placeholder="e.g. https://maps.google.com/?q=... or 12.9716, 77.59"
                  className="w-full h-11 bg-[#161212] border-[#333] text-white rounded-md focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65]"
                  {...register("google_maps_coords")}
                />
              </div>
            </div>
          </div>

          {/* Decorative wave separator */}
          <div className="w-full h-24 mt-8 bg-[url('/wave-pattern.svg')] bg-repeat-x bg-center opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(240, 62, 101, 0.2) 0%, rgba(0,0,0,0) 70%)' }}>
             {/* A fallback gradient if SVG is missing */}
          </div>

          {/* Section 3: Notes & Special Instructions */}
          <div className="space-y-6 pt-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#f03e65] pl-3 mb-8">
              Notes & Special Instructions
            </h3>

            <div className="rounded-xl border border-[#4a1b26] bg-[#2a1118] p-5">
              <p className="text-[11px] font-bold text-[#f03e65] mb-2">Request preview</p>
              <p className="text-sm text-gray-200 leading-relaxed">{summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="special_requests" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Special Equipment / Performance Requests</Label>
                <textarea
                  id="special_requests"
                  rows={4}
                  placeholder="e.g. Wireless microphones requested, custom sound check required, specific song choice etc."
                  className="w-full rounded-md border border-[#333] bg-[#161212] text-white text-sm p-4 focus:outline-none focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65] resize-y"
                  {...register("special_requests")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Introductory Note for Artist / Venue</Label>
                <textarea
                  id="notes"
                  rows={4}
                  placeholder="Share more context about the event crowd, musical preference, layout, or timeline scheduling."
                  className="w-full rounded-md border border-[#333] bg-[#161212] text-white text-sm p-4 focus:outline-none focus:border-[#f03e65] focus:ring-1 focus:ring-[#f03e65] resize-y"
                  {...register("notes")}
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-4 pt-8">
            <button
              type="button"
              onClick={onCancel ? onCancel : () => window.history.back()}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-transparent border border-[#333] rounded-md hover:bg-[#222] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 flex items-center gap-2 text-sm font-bold text-white bg-[#f03e65] rounded-md hover:bg-[#d83558] transition-colors"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Booking Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#222] px-8 py-4 flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-[#0b0a0a]">
        <div className="flex items-center gap-2">
          <Music className="h-3 w-3" />
          <span>Artist Marketplace</span>
        </div>
        <span>Booking Request</span>
      </footer>
    </div>
  );
}
