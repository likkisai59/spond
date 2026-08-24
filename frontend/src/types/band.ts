import type { BaseEntity } from "./common";

export const BAND_GENRES = [
  "Rock",
  "Indie",
  "Bollywood",
  "Classical",
  "Jazz",
  "Electronic",
  "Hip Hop",
  "Fusion",
  "Sufi",
  "Acoustic",
] as const;
export type BandGenre = (typeof BAND_GENRES)[number];

export const AVAILABILITY_STATUSES = [
  "Available",
  "Limited",
  "Booked",
] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export interface BandArtist extends BaseEntity {
  name: string;
  genres: BandGenre[];
  location: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  availability: AvailabilityStatus;
  bio: string;
  verified: boolean;
  completedGigs: number;
}

export interface BandProfile extends BaseEntity {
  name: string;
  genres: BandGenre[];
  location: string;
  members: number;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  availability: AvailabilityStatus;
  nextAvailable: string;
  bio: string;
  verified: boolean;
  completedGigs: number;
}

export const VENUE_TYPES = [
  "Arena",
  "Club",
  "Auditorium",
  "Open Air",
  "Studio",
] as const;
export type VenueType = (typeof VENUE_TYPES)[number];

export const VENUE_SETTINGS = ["Indoor", "Outdoor"] as const;
export type VenueSetting = (typeof VENUE_SETTINGS)[number];

export interface Venue extends BaseEntity {
  name: string;
  city: string;
  location: string;
  venueType: VenueType;
  capacity: number;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  available: boolean;
  setting?: VenueSetting;
}

export const BOOKING_STATUSES = [
  "Requested",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_EVENT_TYPES = [
  "Wedding",
  "Corporate",
  "Club Night",
  "Festival",
  "Private Party",
] as const;
export type BookingEventType = (typeof BOOKING_EVENT_TYPES)[number];

export interface BookingTimelineEntry {
  status: BookingStatus;
  timestamp: string;
  note: string;
}

export interface BandBooking extends BaseEntity {
  title: string;
  bandName: string;
  venueName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: BookingStatus;
  eventType: BookingEventType;
  guestCount: number;
  timeline: BookingTimelineEntry[];
}

export const REVIEW_SUBJECT_TYPES = ["Band", "Artist", "Venue"] as const;
export type ReviewSubjectType = (typeof REVIEW_SUBJECT_TYPES)[number];

export interface BandReview extends BaseEntity {
  author: string;
  authorRole: string;
  subjectName: string;
  subjectType: ReviewSubjectType;
  rating: number;
  title: string;
  content: string;
  eventDate: string;
}

export interface PackageTemplate {
  id: string;
  name: string;
  multiplier: number;
  durationHours: number;
  description: string;
  inclusions: string[];
  popular?: boolean;
}

export interface PerformanceVideo {
  id: string;
  title: string;
  venue: string;
  duration: string;
  views: string;
}

export interface BandMemberProfile {
  id: string;
  name: string;
  role: string;
  since: string;
}

export interface VenueAvailabilityDay {
  date: string;
  status: "Available" | "Booked";
}

export interface MarketplaceActivityItem {
  id: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
}
