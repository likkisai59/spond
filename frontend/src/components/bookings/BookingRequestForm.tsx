"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookingService } from "@/services/bookingService";
import { BookingRequestFormData, bookingRequestSchema } from "@/utils/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, IndianRupee, MapPin, Send, Sparkles, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { bandService } from "@/services/band";
import type { Artist, Venue } from "@/types/band";
import { Music, Building } from "lucide-react";

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
      event_type: "Wedding",
      event_date: "",
      start_time: "18:00",
      end_time: "22:00",
      guest_count: 50,
      proposed_price: proposedPrice || 15000,
      location: venueName || "",
      address: "",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      google_maps_coords: "",
      special_requests: "",
      notes: "",
    },
  });

  useEffect(() => {
    async function loadProviders() {
      try {
        const [aList, vList] = await Promise.all([
          bandService.getArtists().catch(() => []),
          bandService.getVenues().catch(() => []),
        ]);
        setArtists(aList);
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
      ].filter(Boolean);
      const composedLocation = locationParts.join(", ") || "Location not specified";

      const targetArtistId = data.artist_profile_id || artistProfileId || null;
      const targetVenueId = data.venue_id || venueId || null;

      // Map frontend field names to backend API contract
      const apiPayload: Record<string, unknown> = {
        artist_profile_id: targetArtistId,
        venue_id: targetVenueId,
        // Backend expects event_name, not event_title
        event_name: data.event_title,
        event_date: data.event_date,
        start_time: data.start_time,
        end_time: data.end_time,
        location: composedLocation,
        proposed_price: Number(data.proposed_price),
        notes:
          [
            data.special_requests?.trim()
              ? `Special requests: ${data.special_requests.trim()}`
              : "",
            data.notes?.trim() || "",
          ]
            .filter(Boolean)
            .join("\n") || null,
      };

      let createdId = "";
      try {
        const providerId = targetArtistId || targetVenueId || "";
        const providerType = targetArtistId ? "artist" : "venue";
        if (providerId) {
          const bandRes = await bandService.createBooking({
            provider_id: providerId,
            provider_type: providerType,
            package_id: "pkg-custom",
            event_date: data.event_date,
            event_time: data.start_time,
            message: data.notes || data.special_requests || data.event_title,
            proposed_price: Number(data.proposed_price),
          });
          createdId = bandRes.id;
        } else {
          const res = isArtistBookingVenue
            ? await bookingService.createArtistVenueBooking(apiPayload)
            : isVenueBookingTalent
              ? await bookingService.createVenueTalentBooking(apiPayload)
              : await bookingService.createBooking(apiPayload);
          createdId = res.id;
        }
      } catch {
        const res = isArtistBookingVenue
          ? await bookingService.createArtistVenueBooking(apiPayload)
          : isVenueBookingTalent
            ? await bookingService.createVenueTalentBooking(apiPayload)
            : await bookingService.createBooking(apiPayload);
        createdId = res.id;
      }

      toast.success("Booking request submitted successfully!");
      if (onSuccess) onSuccess(createdId);
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = error.response?.data?.error?.message || "Failed to submit booking request.";
      toast.error(msg);
    }
  };

  return (
    <Card className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden text-card-foreground">
      <CardHeader className="border-b border-border bg-muted/20 p-6 flex flex-row items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <CardTitle className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            {isArtistBookingVenue ? "Book a Venue" : "Create Booking Request"}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {isArtistBookingVenue
              ? "Search for and reserve a venue for your performance"
              : artistName && venueName
                ? `Submit inquiry for ${artistName} at ${venueName}`
                : artistName
                  ? `Submit booking inquiry for performer ${artistName}`
                  : venueName
                    ? `Request a reservation for ${venueName}`
                    : "Hire performers or spaces for live gig entertainment"}
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 0: Select Provider / Venue from Marketplace */}
          <div className="space-y-4 p-4 rounded-2xl bg-muted/10 border border-border">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              {isArtistBookingVenue ? (
                <>
                  <Building className="h-4 w-4 text-accent" />
                  <span>Select Venue</span>
                </>
              ) : (
                <>
                  <Music className="h-4 w-4 text-accent" />
                  <span>Select Performer & Venue</span>
                </>
              )}
            </h3>

            <div className={`grid grid-cols-1 ${!isArtistBookingVenue ? "sm:grid-cols-2" : ""} gap-4`}>
              {/* Artist / Performer Select — hidden when artist is booking a venue (Bug 12 fix) */}
              {!isArtistBookingVenue && (
                <div className="space-y-1.5">
                  <Label htmlFor="artist_profile_id" className="text-xs font-semibold text-foreground">
                    Performer / Band {artistName ? `(Selected: ${artistName})` : ""}
                  </Label>
                  <select
                    id="artist_profile_id"
                    className="w-full h-9 rounded-xl border border-border bg-background text-foreground text-xs px-3 focus:outline-none focus:ring-1 focus:ring-accent"
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
                    <option value="">-- Choose Performer / Band from Marketplace --</option>
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({Array.isArray(a.genre) ? a.genre.join(", ") : a.genre || "Live Music"} - ₹{(a.packages?.[0]?.price || 15000).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Venue Select */}
              <div className="space-y-1.5">
                <Label htmlFor="venue_id" className="text-xs font-semibold text-foreground">
                  Venue {venueName ? `(Selected: ${venueName})` : ""}
                </Label>
                <select
                  id="venue_id"
                  className="w-full h-9 rounded-xl border border-border bg-background text-foreground text-xs px-3 focus:outline-none focus:ring-1 focus:ring-accent"
                  {...register("venue_id", {
                    onChange: (e) => {
                      const selected = venues.find((v) => v.id === e.target.value);
                      if (selected) {
                        setValue("location", selected.name);
                        if (selected.city) setValue("city", selected.city);
                      }
                    },
                  })}
                >
                  <option value="">-- Choose Venue or Enter Custom Location Below --</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.city || "Venue"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 1: Event Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Event Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="event_title">Event Title</Label>
                <div className="relative">
                  <Input
                    id="event_title"
                    placeholder="e.g. Annual Tech Summit Afterparty"
                    className="text-foreground text-xs bg-background border-border placeholder:text-muted-foreground rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                    {...register("event_title", {
                      onChange: (e) => {
                        // Restrict numeric input by automatically removing numeric digits (Bug 13 fix)
                        if (/\d/.test(e.target.value)) {
                          e.target.value = e.target.value.replace(/\d/g, "");
                          setValue("event_title", e.target.value, { shouldValidate: true });
                        }
                      },
                    })}
                    onKeyDown={(e) => {
                      // Prevent typing numeric digits 0-9
                      if (e.key >= "0" && e.key <= "9") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Letters, spaces, and punctuation only (no numbers allowed).</p>
                {errors.event_title && (
                  <p className="text-xs text-error font-medium">{errors.event_title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event_type">Event Type</Label>
                <select
                  id="event_type"
                  className="w-full h-9 rounded-xl border border-border bg-background text-foreground text-xs px-3 focus:outline-none focus:ring-1 focus:ring-accent"
                  {...register("event_type")}
                >
                  <option value="Wedding">Wedding Celebration</option>
                  <option value="Corporate Gig">Corporate Event</option>
                  <option value="Private Event">Private Party</option>
                  <option value="Concert">Public Concert</option>
                  <option value="Festival">Festival Gig</option>
                  <option value="Club Performance">Club/Pub Event</option>
                  <option value="Other">Other Occasion</option>
                </select>
                {errors.event_type && (
                  <p className="text-xs text-error font-medium">{errors.event_type.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="event_date" className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  <span>Date</span>
                </Label>
                <Input
                  id="event_date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                  {...register("event_date")}
                />
                {errors.event_date && (
                  <p className="text-xs text-error font-medium">{errors.event_date.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="start_time" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  <span>Start Time</span>
                </Label>
                <Input
                  id="start_time"
                  type="time"
                  className="text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                  {...register("start_time")}
                />
                {errors.start_time && (
                  <p className="text-xs text-error font-medium">{errors.start_time.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="end_time" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  <span>End Time</span>
                </Label>
                <Input
                  id="end_time"
                  type="time"
                  className="text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                  {...register("end_time")}
                />
                {errors.end_time && (
                  <p className="text-xs text-error font-medium">{errors.end_time.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="guest_count" className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-accent" />
                  <span>Expected Guests</span>
                </Label>
                <Input
                  id="guest_count"
                  type="number"
                  placeholder="50"
                  className="text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                  {...register("guest_count", { valueAsNumber: true })}
                />
                {errors.guest_count && (
                  <p className="text-xs text-error font-medium">{errors.guest_count.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proposed_price" className="flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5 text-accent" />
                  <span>Proposed Budget (INR)</span>
                </Label>
                <Input
                  id="proposed_price"
                  type="number"
                  placeholder="15000"
                  className="text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                  {...register("proposed_price", { valueAsNumber: true })}
                />
                {errors.proposed_price && (
                  <p className="text-xs text-error font-medium">{errors.proposed_price.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Location Details */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Location details
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                <span>Venue Name / Location Description</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. Taj West End, Grand Ballroom"
                className="text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-xs text-error font-medium">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                placeholder="e.g. 25 Race Course Road"
                className="text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-xs text-error font-medium">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Bangalore"
                  className={`text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent ${
                    errors.city ? "border-error focus-visible:ring-error" : ""
                  }`}
                  {...register("city", {
                    onChange: (e) => {
                      if (/\d/.test(e.target.value)) {
                        e.target.value = e.target.value.replace(/\d/g, "");
                        setValue("city", e.target.value, { shouldValidate: true });
                      }
                    },
                  })}
                  onKeyDown={(e) => {
                    if (e.key >= "0" && e.key <= "9") {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.city && (
                  <p className="text-xs text-error font-medium">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Karnataka"
                  className={`text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent ${
                    errors.state ? "border-error focus-visible:ring-error" : ""
                  }`}
                  {...register("state", {
                    onChange: (e) => {
                      if (/\d/.test(e.target.value)) {
                        e.target.value = e.target.value.replace(/\d/g, "");
                        setValue("state", e.target.value, { shouldValidate: true });
                      }
                    },
                  })}
                  onKeyDown={(e) => {
                    if (e.key >= "0" && e.key <= "9") {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.state && (
                  <p className="text-xs text-error font-medium">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  className={`text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent ${
                    errors.country ? "border-error focus-visible:ring-error" : ""
                  }`}
                  {...register("country", {
                    onChange: (e) => {
                      if (/\d/.test(e.target.value)) {
                        e.target.value = e.target.value.replace(/\d/g, "");
                        setValue("country", e.target.value, { shouldValidate: true });
                      }
                    },
                  })}
                  onKeyDown={(e) => {
                    if (e.key >= "0" && e.key <= "9") {
                      e.preventDefault();
                    }
                  }}
                />
                {errors.country && (
                  <p className="text-xs text-error font-medium">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="google_maps_coords">Google Maps URL or Coordinates (Optional)</Label>
              <Input
                id="google_maps_coords"
                placeholder="e.g. https://maps.google.com/?q=... or 12.9716, 77.5946"
                className={`text-foreground text-xs bg-background border-border rounded-xl focus:border-accent focus:ring-1 focus:ring-accent ${
                  errors.google_maps_coords ? "border-error focus-visible:ring-error" : ""
                }`}
                {...register("google_maps_coords")}
              />
              {errors.google_maps_coords && (
                <p className="text-xs text-error font-medium">{errors.google_maps_coords.message}</p>
              )}
            </div>
          </div>

          {/* Section 3: Notes & Special Requests */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Notes & Special Instructions
            </h3>

            <div className="rounded-xl border border-accent/20 bg-accent/80 p-3 text-white">
              <p className="text-[11px] font-medium text-white/70">Request preview</p>
              <p className="mt-1 text-sm font-medium">{summary}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="special_requests">Special Equipment / Performance Requests</Label>
              <textarea
                id="special_requests"
                rows={2}
                placeholder="e.g. Wireless microphones requested, custom sound check required, specific song choice etc."
                className="w-full rounded-xl border border-border bg-background text-foreground text-xs p-3 focus:outline-none focus:ring-1 focus:ring-accent resize-y"
                {...register("special_requests")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Introductory Note for Artist / Venue</Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Share more context about the event crowd, musical preference, layout, or timeline scheduling."
                className="w-full rounded-xl border border-border bg-background text-foreground text-xs p-3 focus:outline-none focus:ring-1 focus:ring-accent resize-y"
                {...register("notes")}
              />
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel ? onCancel : () => window.history.back()}
              disabled={isSubmitting}
              className="font-bold text-xs h-9 px-5 border-border bg-muted/30 hover:bg-muted text-foreground cursor-pointer rounded-xl transition-colors shadow-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-bold text-xs h-9 px-5 flex items-center gap-1.5 cursor-pointer bg-accent hover:bg-accent/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <span>Submitting request...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Booking Request</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
