import type { BaseEntity } from "./common";

export type EventHubProviderType = "Venue" | "Artist" | "Band";

export type EventHubBookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "CONFIRMED"
  | "EVENT_COMPLETED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

export type EventHubPaymentStatus =
  | "UNPAID"
  | "ADVANCE_PAYMENT_PENDING"
  | "ADVANCE_PAID"
  | "FINAL_PAYMENT_PENDING"
  | "FULLY_PAID"
  | "REFUNDED"
  | "REFUND_FAILED";

export interface BookingTimelineItem {
  status: string;
  timestamp: string;
  note?: string;
}

export interface EventHubBooking extends BaseEntity {
  eventId?: string;
  customerId?: string;
  providerId?: string;
  providerType?: EventHubProviderType;
  providerName?: string;
  packageId?: string;
  title?: string;
  bandName?: string;
  venueName?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  amount: number;
  advanceAmount: number;
  finalAmount: number;
  bookingStatus: EventHubBookingStatus;
  paymentStatus: EventHubPaymentStatus;
  status?: string; // legacy alias
  eventType?: string;
  guestCount?: number;
  acceptedAt?: string;
  advanceOrderId?: string;
  advancePaymentId?: string;
  finalOrderId?: string;
  finalPaymentId?: string;
  timeline?: BookingTimelineItem[];
  createdBy?: string;
}

export interface EventHubEvent extends BaseEntity {
  title: string;
  date: string;
  location: string;
  guestCount: number;
  budget: number;
  eventType?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  status?: string;
  customerId?: string;
  bookingCount?: number;
  totalCommitted?: number;
  bookings?: EventHubBooking[];
}

export interface EventHubEventInput {
  title: string;
  date: string;
  location: string;
  guestCount: number;
  budget: number;
  eventType?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
}

export interface ProviderPackage {
  id: string;
  title: string;
  price: number;
  durationMinutes?: number;
  description?: string;
  features?: string[];
  travelIncluded?: boolean;
  soundIncluded?: boolean;
}

export interface ProviderAvailabilityResponse {
  available: boolean;
  providerId: string;
  eventDate: string;
}
