import { apiClient } from "@/services/api-client";
import type {
  ApiResponse,
  Paginated,
  EventHubEvent,
  EventHubEventInput,
  EventHubBooking,
  ProviderAvailabilityResponse
} from "@/types";

export const eventHubService = {
  // --- Customer Events ---
  listEvents: async (status?: string): Promise<ApiResponse<Paginated<EventHubEvent>>> => {
    const { data } = await apiClient.get("/api/v1/eventhub/events", {
      params: status ? { status } : undefined
    });
    return data;
  },

  getEventById: async (id: string): Promise<ApiResponse<EventHubEvent>> => {
    const { data } = await apiClient.get(`/api/v1/eventhub/events/${id}`);
    return data;
  },

  createEvent: async (input: EventHubEventInput): Promise<ApiResponse<EventHubEvent>> => {
    const { data } = await apiClient.post("/api/v1/eventhub/events", input);
    return data;
  },

  updateEvent: async (id: string, input: Partial<EventHubEventInput>): Promise<ApiResponse<EventHubEvent>> => {
    const { data } = await apiClient.put(`/api/v1/eventhub/events/${id}`, input);
    return data;
  },

  deleteEvent: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const { data } = await apiClient.delete(`/api/v1/eventhub/events/${id}`);
    return data;
  },

  // --- Provider Availability ---
  checkAvailability: async (
    providerId: string,
    eventDate: string,
    startTime?: string,
    endTime?: string
  ): Promise<ApiResponse<ProviderAvailabilityResponse>> => {
    const { data } = await apiClient.get(`/api/v1/band/providers/${providerId}/availability`, {
      params: {
        event_date: eventDate,
        start_time: startTime || undefined,
        end_time: endTime || undefined
      }
    });
    return data;
  },

  // --- Provider Actions on Bookings ---
  acceptBooking: async (bookingId: string): Promise<ApiResponse<EventHubBooking>> => {
    const { data } = await apiClient.put(`/api/v1/band/bookings/${bookingId}/accept`);
    return data;
  },

  rejectBooking: async (bookingId: string, reason?: string): Promise<ApiResponse<EventHubBooking>> => {
    const { data } = await apiClient.put(`/api/v1/band/bookings/${bookingId}/reject`, null, {
      params: reason ? { reason } : undefined
    });
    return data;
  },

  completeEvent: async (bookingId: string): Promise<ApiResponse<EventHubBooking>> => {
    const { data } = await apiClient.put(`/api/v1/band/bookings/${bookingId}/complete-event`);
    return data;
  },

  counterOfferBooking: async (
    bookingId: string,
    amount: number,
    note?: string
  ): Promise<ApiResponse<EventHubBooking>> => {
    const { data } = await apiClient.put(`/api/v1/band/bookings/${bookingId}/counter-offer`, {
      amount,
      note: note || undefined
    });
    return data;
  },

  // --- Provider Blackout Dates ---
  updateBlackoutDates: async (
    providerId: string,
    dates: string[]
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put(`/api/v1/band/providers/${providerId}/blackout`, {
      dates
    });
    return data;
  },

  // --- Unified Provider Onboarding ---
  onboardProvider: async (payload: any): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post("/api/v1/band/providers/onboarding", payload);
    return data;
  },

  // --- Payment Orders & Verification ---
  createPaymentOrder: async (
    bookingId: string,
    amount: number,
    milestone: "advance" | "final"
  ): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post("/api/v1/payments/create-order", {
      module: "band",
      module_id: bookingId,
      amount,
      milestone,
      currency: "INR"
    });
    return data;
  },

  verifyPayment: async (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    paymentId: string;
    milestone: "advance" | "final";
  }): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post("/api/v1/payments/verify", {
      razorpay_order_id: payload.razorpayOrderId,
      razorpay_payment_id: payload.razorpayPaymentId,
      razorpay_signature: payload.razorpaySignature,
      payment_id: payload.paymentId,
      milestone: payload.milestone
    });
    return data;
  }
};
