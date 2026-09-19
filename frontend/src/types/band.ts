export interface Package {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  description: string;
}

export interface Artist {
  id: string;
  user_id: string;
  name: string;
  display_name?: string;
  genre: string[];
  bio: string;
  city?: string;
  state?: string;
  gallery?: Array<string | { url: string; is_cover?: boolean }>;
  packages: Package[];
  rating: number;
  reviews_count: number;
}

export interface Band {
  id: string;
  user_id: string;
  name: string;
  genre: string[];
  members_count: number;
  bio: string;
  city: string;
  packages: Package[];
  rating: number;
  reviews_count: number;
}

export interface Venue {
  id: string;
  user_id: string;
  name: string;
  type: string;
  capacity: number;
  city: string;
  amenities: string[];
  packages: Package[];
  rating: number;
  reviews_count: number;
}

export interface BookingRequest {
  provider_id: string;
  provider_type: "artist" | "band" | "venue";
  package_id: string;
  event_date: string;
  event_time: string;
  message?: string;
  proposed_price?: number;
}

export type BookingStatus = "REQUESTED" | "ACCEPTED" | "REJECTED" | "CONFIRMED" | "EVENT_COMPLETED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "ADVANCE_PENDING" | "ADVANCE_PAID" | "FINAL_PENDING" | "FULLY_PAID" | "REFUNDED";

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  provider_type: "artist" | "band" | "venue";
  package_id: string;
  event_date: string;
  event_time: string;
  message?: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  advance_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerEventCreate {
  title: string;
  event_type: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  guest_count: number;
  budget: number;
}

export interface CustomerEvent extends CustomerEventCreate {
  id: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
}
