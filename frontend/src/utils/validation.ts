import { z } from "zod";

const personNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name cannot exceed 100 characters")
  .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters");

const optionalPersonNameSchema = z
  .string()
  .trim()
  .max(100, "Name cannot exceed 100 characters")
  .optional()
  .default("");

// ── Artist Profile Update ───────────────────────────────────────────────────
export const artistProfileUpdateSchema = z.object({
  name: personNameSchema,
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters").optional().default(""),
  years_of_experience: z.coerce.number().min(0, "Experience cannot be negative").default(0),
  profile_image: z.string().optional().default(""),
  cover_image: z.string().optional().default(""),
  mobile_number: z.string().min(10, "Mobile number must be at least 10 digits"),
  band_type: z.enum(["Solo", "Duo", "Trio", "4 Members", "5+ Members"]).default("Solo"),
  total_members: z.coerce.number().min(1, "Must have at least 1 member").default(1),
  base_rate: z.coerce.number().min(0, "Rate cannot be negative").default(0),
  currency: z.string().min(1, "Currency is required").default("INR"),
  travel_radius: z.coerce.number().min(0, "Radius cannot be negative").default(0),
  travel_charges: z.coerce.number().min(0, "Charges cannot be negative").default(0),
  min_booking_hours: z.coerce.number().min(0, "Minimum hours cannot be negative").default(0),
  max_booking_hours: z.coerce.number().min(0, "Maximum hours cannot be negative").default(0),
  equipment: z
    .object({
      own_speaker: z.boolean().default(false),
      mic: z.boolean().default(false),
      mixer: z.boolean().default(false),
      keyboard: z.boolean().default(false),
      guitar: z.boolean().default(false),
      drums: z.boolean().default(false),
      lighting: z.boolean().default(false),
      dj_console: z.boolean().default(false),
    })
    .default({}),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  genres: z.array(z.string()).min(1, "Select at least one genre"),
  social_links: z
    .object({
      instagram: z.string().optional().default(""),
      facebook: z.string().optional().default(""),
      twitter: z.string().optional().default(""),
      website: z.string().optional().default(""),
    })
    .default({}),
  achievements: z.array(z.string()).default([]),
});

export type ArtistProfileUpdateFormData = z.infer<typeof artistProfileUpdateSchema>;

// ── Venue Profile Update ────────────────────────────────────────────────────
export const venueProfileUpdateSchema = z
  .object({
    owner_name: personNameSchema,
    business_name: z.string().min(2, "Business Name must be at least 2 characters"),
    contact_person: optionalPersonNameSchema,
    gst_number: z.string().optional().default(""),
    pan_number: z.string().optional().default(""),

    venue_name: z.string().min(2, "Venue Name must be at least 2 characters"),
    venue_type: z.enum([
      "Marriage Hall",
      "Resort",
      "Hotel",
      "Banquet Hall",
      "Farm House",
      "Open Ground",
      "Club",
      "Pub",
      "Restaurant",
      "Others",
    ]),
    description: z
      .string()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional()
      .default(""),
    established_year: z.coerce
      .number()
      .int()
      .min(1800, "Invalid year")
      .max(new Date().getFullYear(), "Year cannot be in the future")
      .optional()
      .nullable(),
    indoor_outdoor: z.enum(["Indoor", "Outdoor", "Both"]).default("Both"),

    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    district: z.string().optional().default(""),
    city_id: z.string().uuid("City is required"),
    area: z.string().optional().default(""),
    address: z.string().min(5, "Address must be at least 5 characters"),
    landmark: z.string().optional().default(""),
    pincode: z.string().min(6, "Pincode must be at least 6 digits"),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    google_map_location: z.string().optional().default(""),

    facilities: z.array(z.string()).default([]),
    min_capacity: z.coerce.number().min(1, "Minimum capacity must be at least 1"),
    max_capacity: z.coerce.number().min(1, "Maximum capacity must be at least 1"),

    weekly_schedule: z
      .record(
        z.string(),
        z.object({
          available: z.boolean().default(false),
          start: z.string().default("09:00"),
          end: z.string().default("22:00"),
        }),
      )
      .default({}),
    blocked_dates: z.array(z.string()).default([]),
    maintenance_days: z.array(z.string()).default([]),
    public_holidays: z.array(z.string()).default([]),
    booking_buffer_time: z.coerce.number().min(0).optional().default(0),

    doc_pan: z.string().optional().default(""),
    doc_gst: z.string().optional().default(""),
    doc_ownership_proof: z.string().optional().default(""),
    doc_government_id: z.string().optional().default(""),
    doc_business_license: z.string().optional().default(""),
    youtube_links: z.array(z.string()).default([]),
  })
  .refine((data) => data.max_capacity >= data.min_capacity, {
    message: "Maximum capacity must be greater than or equal to minimum capacity",
    path: ["max_capacity"],
  });

export type VenueProfileUpdateFormData = z.infer<typeof venueProfileUpdateSchema>;

// ── Booking Request ─────────────────────────────────────────────────────────
export const bookingRequestSchema = z.object({
  artist_profile_id: z.string().nullable().optional(),
  venue_id: z.string().nullable().optional(),
  event_title: z.string().min(2, "Event title must be at least 2 characters"),
  event_type: z.string().min(1, "Event type is required"),
  event_date: z
    .string()
    .min(1, "Event date is required")
    .refine(
      (val) => {
        if (!val) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(val);
        date.setHours(0, 0, 0, 0);
        return date >= today;
      },
      { message: "Event date cannot be in the past" },
    ),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  guest_count: z.number().min(1, "Guest count must be at least 1").default(50),
  proposed_price: z.number().min(0, "Price cannot be negative").default(0),
  location: z.string().optional().default(""),
  address: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  country: z.string().optional().default("India"),
  google_maps_coords: z.string().optional().default(""),
  special_requests: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export type BookingRequestFormData = z.infer<typeof bookingRequestSchema>;
