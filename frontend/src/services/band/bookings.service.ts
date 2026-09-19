import { api } from "../api";
import { BookingRequestDetail, BookingsListResponse } from "@/types/booking";
import { isPreviewActive, toastMutationBlocked } from "@/utils/dev-mode";

interface ApiResponse<T> {
  status: string;
  data: T;
}

export const bookingService = {
  // ── Artist bookings ─────────────────────────────────────────────────────────
  getArtistBookings: async (params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingsListResponse> => {
    if (isPreviewActive())
      return toastMutationBlocked() as unknown as Promise<BookingsListResponse>;
    const response = await api.get<ApiResponse<BookingsListResponse>>("/band/bookings", {
      params: { ...params, role_view: "provider" },
    });
    return response.data.data;
  },

  // ── Client bookings ──────────────────────────────────────────────────────────
  getClientBookings: async (params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingsListResponse> => {
    if (isPreviewActive())
      return toastMutationBlocked() as unknown as Promise<BookingsListResponse>;
    const response = await api.get<ApiResponse<BookingsListResponse>>("/band/bookings", {
      params: { ...params, role_view: "customer" },
    });
    return response.data.data;
  },

  // ── Create bookings ──────────────────────────────────────────────────────────
  createBooking: async (data: Record<string, unknown>): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.post<ApiResponse<BookingRequestDetail>>("/band/bookings", data);
    return response.data.data;
  },

  createArtistVenueBooking: async (
    data: Record<string, unknown>,
  ): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.post<ApiResponse<BookingRequestDetail>>("/band/bookings/artist/venue", data);
    return response.data.data;
  },

  createVenueTalentBooking: async (
    data: Record<string, unknown>,
  ): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.post<ApiResponse<BookingRequestDetail>>("/band/bookings/venue/talent", data);
    return response.data.data;
  },

  // ── Booking detail & status ──────────────────────────────────────────────────
  getBookingDetails: async (bookingId: string): Promise<BookingRequestDetail> => {
    if (isPreviewActive())
      return toastMutationBlocked() as unknown as Promise<BookingRequestDetail>;
    const response = await api.get<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}`);
    return response.data.data;
  },

  acceptBooking: async (bookingId: string): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}/status?status=ACCEPTED`);
    return response.data.data;
  },

  rejectBooking: async (bookingId: string): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}/status?status=REJECTED`);
    return response.data.data;
  },

  counterOffer: async (
    bookingId: string,
    counterPrice: number,
    message?: string,
  ): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}/status?status=REQUESTED`, {
      counter_price: counterPrice,
      message,
    });
    return response.data.data;
  },

  cancelBooking: async (bookingId: string, reason?: string): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}/status?status=CANCELLED`, { reason });
    return response.data.data;
  },

  // ── Venue bookings (same endpoint, provider role) ────────────────────────────
  getVenueBookings: async (params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingsListResponse> => {
    if (isPreviewActive())
      return toastMutationBlocked() as unknown as Promise<BookingsListResponse>;
    const response = await api.get<ApiResponse<BookingsListResponse>>("/band/bookings", {
      params: { ...params, role_view: "provider" },
    });
    return response.data.data;
  },

  getVenueBookingDetails: async (bookingId: string): Promise<BookingRequestDetail> => {
    if (isPreviewActive())
      return toastMutationBlocked() as unknown as Promise<BookingRequestDetail>;
    const response = await api.get<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}`);
    return response.data.data;
  },

  acceptVenueBooking: async (bookingId: string): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}/status?status=ACCEPTED`);
    return response.data.data;
  },

  rejectVenueBooking: async (bookingId: string): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}/status?status=REJECTED`);
    return response.data.data;
  },

  completeVenueBooking: async (bookingId: string): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}/status?status=EVENT_COMPLETED`);
    return response.data.data;
  },

  cancelVenueBooking: async (bookingId: string, reason?: string): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}/status?status=CANCELLED`, { reason });
    return response.data.data;
  },

  addBookingNote: async (bookingId: string, content: string): Promise<Record<string, unknown>> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.post<ApiResponse<Record<string, unknown>>>(`/band/bookings/${bookingId}/notes`, { content });
    return response.data.data;
  },

  // ── Admin bookings ───────────────────────────────────────────────────────────
  adminGetBookings: async (params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BookingsListResponse> => {
    if (isPreviewActive())
      return toastMutationBlocked() as unknown as Promise<BookingsListResponse>;
    const response = await api.get<ApiResponse<BookingsListResponse>>("/band/bookings", { params });
    return response.data.data;
  },

  adminResolveDispute: async (
    bookingId: string,
    status: string,
    message?: string,
  ): Promise<BookingRequestDetail> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<ApiResponse<BookingRequestDetail>>(`/band/bookings/${bookingId}/status?status=${status}`, {
      message,
    });
    return response.data.data;
  },
};
