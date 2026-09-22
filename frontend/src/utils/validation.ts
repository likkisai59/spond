import { z } from "zod";
import { COUNTRY_CODES } from "@/components/shared/PhoneInputField";

const personNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name cannot exceed 100 characters")
  .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters");



// ── Artist Profile Update ───────────────────────────────────────────────────
export const artistProfileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[a-zA-Z\s.'\-]+$/, "Legal name must contain letters only (numbers are not allowed)"),
  display_name: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name cannot exceed 50 characters")
    .regex(/^[a-zA-Z_\-]+$/, "Display name cannot contain numbers or spaces. Use letters, hyphens, and underscores only."),
  bio: z.string().max(2000, "Bio cannot exceed 2000 characters").optional().default(""),
  years_of_experience: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0, "Experience cannot be negative")
  ).default(0),
  profile_image: z.string().optional().default(""),
  cover_image: z.string().optional().default(""),
  mobile_number: z
    .string()
    .trim()
    .min(1, "Mobile phone number is required")
    .superRefine((val, ctx) => {
      const match = val.match(/^(\+\d{1,4})\s*(\d*)$/);
      if (!match) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter a valid phone number with country code (e.g. +91 9876543210)",
        });
        return;
      }
      const [, code, digits] = match;
      const country = COUNTRY_CODES.find((c) => c.code === code);
      if (country) {
        if (digits.length !== country.digits) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${country.name} (${country.code}) requires exactly ${country.digits} digits (currently ${digits.length})`,
          });
        }
      } else {
        if (digits.length < 7 || digits.length > 15) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Phone number must contain between 7 and 15 digits",
          });
        }
      }
    }),
  band_type: z.string().min(1, "Performer type is required").default("Solo"),
  total_members: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 1 : Number(val)),
    z.number().min(1, "Must have at least 1 member")
  ).default(1),
  base_rate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0, "Rate cannot be negative")
  ).default(0),
  currency: z.string().min(1, "Currency is required").default("INR"),
  travel_radius: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0, "Radius cannot be negative")
  ).default(0),
  travel_charges: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0, "Charges cannot be negative")
  ).default(0),
  min_booking_hours: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0, "Minimum hours cannot be negative")
  ).default(0),
  max_booking_hours: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? 0 : Number(val)),
    z.number().min(0, "Maximum hours cannot be negative")
  ).default(0),
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
      instagram: z
        .string()
        .optional()
        .default("")
        .refine(
          (val) =>
            !val ||
            /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i.test(
              val.trim(),
            ),
          { message: "Enter proper links" },
        ),
      facebook: z
        .string()
        .optional()
        .default("")
        .refine(
          (val) =>
            !val ||
            /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i.test(
              val.trim(),
            ),
          { message: "Enter proper links" },
        ),
      twitter: z
        .string()
        .optional()
        .default("")
        .refine(
          (val) =>
            !val ||
            /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i.test(
              val.trim(),
            ),
          { message: "Enter proper links" },
        ),
      website: z
        .string()
        .optional()
        .default("")
        .refine(
          (val) =>
            !val ||
            /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i.test(
              val.trim(),
            ),
          { message: "Enter proper links" },
        ),
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
    contact_person: z
      .string()
      .trim()
      .max(100, "Name cannot exceed 100 characters")
      .refine((val) => !val || /^[a-zA-Z\s.'-]+$/.test(val), {
        message: "Booking Representative must contain letters only (no numbers)",
      })
      .optional()
      .default(""),
    gst_number: z
      .string()
      .optional()
      .default("")
      .refine((val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val.toUpperCase()), {
        message: "Invalid GST Number format (e.g. 22AAAAA0000A1Z5)",
      }),
    pan_number: z
      .string()
      .optional()
      .default("")
      .refine((val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.toUpperCase()), {
        message: "Invalid PAN format (e.g. ABCDE1234F)",
      }),

    venue_name: z
      .string()
      .min(2, "Venue Name must be at least 2 characters")
      .refine((val) => !/\d/.test(val), { message: "Venue Name cannot contain numbers" }),
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
    district: z
      .string()
      .optional()
      .default("")
      .refine((val) => !val || !/\d/.test(val), { message: "District cannot contain numbers" }),
    city_id: z.string().uuid("City is required"),
    area: z
      .string()
      .optional()
      .default("")
      .refine((val) => !val || /^[a-zA-Z\s,'.-]+$/.test(val), { message: "Area / Suburb should contain letters and spaces only" }),
    address: z.string().min(5, "Address must be at least 5 characters"),
    landmark: z
      .string()
      .optional()
      .default("")
      .refine((val) => !val || !/^\d+$/.test(val), { message: "Landmark cannot be purely numeric" }),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be exactly 6 digits (numbers only)"),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    google_map_location: z
      .string()
      .optional()
      .default("")
      .refine(
        (val) =>
          !val ||
          /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i.test(val) &&
          (val.toLowerCase().includes("google.com/maps") ||
            val.toLowerCase().includes("maps.google") ||
            val.toLowerCase().includes("goo.gl/maps") ||
            val.toLowerCase().includes("maps.app.goo.gl")),
        { message: "Google Maps Link must be a valid Google Maps URL (e.g. https://maps.google.com/...)" }
      ),

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

export const isValidGoogleMapsOrCoordinates = (val: string): boolean => {
  if (!val || !val.trim()) return true;
  const trimmed = val.trim();

  // Coordinate pattern (lat, lng) e.g., "12.9716, 77.5946"
  const coordRegex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
  if (coordRegex.test(trimmed)) {
    const parts = trimmed.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const [lat, lng] = parts;
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return true;
      }
    }
  }

  // Google Maps URL pattern e.g. https://maps.google.com/..., https://maps.app.goo.gl/...
  const urlRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/i;
  if (urlRegex.test(trimmed)) {
    const lower = trimmed.toLowerCase();
    if (
      lower.includes("google.com/maps") ||
      lower.includes("maps.google.") ||
      lower.includes("goo.gl/maps") ||
      lower.includes("maps.app.goo.gl")
    ) {
      return true;
    }
  }

  return false;
};

// ── Booking Request ─────────────────────────────────────────────────────────
export const bookingRequestSchema = z.object({
  artist_profile_id: z.string().nullable().optional(),
  venue_id: z.string().nullable().optional(),
  event_title: z
    .string()
    .trim()
    .min(2, "Event title must be at least 2 characters")
    .max(100, "Event title cannot exceed 100 characters")
    .refine((val) => !/\d/.test(val), {
      message: "Event title cannot contain numbers",
    }),
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
  city: z
    .string()
    .optional()
    .default("")
    .refine((val) => !val || !/\d/.test(val), {
      message: "City must contain letters and spaces only (no numbers)",
    }),
  state: z
    .string()
    .optional()
    .default("")
    .refine((val) => !val || !/\d/.test(val), {
      message: "State must contain letters and spaces only (no numbers)",
    }),
  country: z
    .string()
    .optional()
    .default("India")
    .refine((val) => !val || !/\d/.test(val), {
      message: "Country must contain letters and spaces only (no numbers)",
    }),
  google_maps_coords: z
    .string()
    .optional()
    .default("")
    .refine((val) => isValidGoogleMapsOrCoordinates(val), {
      message: "Enter a valid Google Maps URL or coordinates (e.g., https://maps.google.com/... or 12.9716, 77.5946)",
    }),
  special_requests: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export type BookingRequestFormData = z.infer<typeof bookingRequestSchema>;

// ── Review Submission ─────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a star rating").max(5),
  review_title: z.string().optional().default(""),
  review_text: z.string().min(10, "Review text must be at least 10 characters").max(2000, "Review text is too long"),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

