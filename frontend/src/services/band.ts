import { api } from "./api";
import { Artist, Band, Venue, Booking, BookingRequest, CustomerEvent, CustomerEventCreate } from "@/types/band";
import { isEntertainmentVenue, isEntertainmentArtist } from "@/utils/sportsFilter";

export const bandService = {
  // Artists
  getArtists: async (): Promise<any[]> => {
    const { data } = await api.get<any>("/band/artists");
    // Backend wraps in { status, data: [...] }
    const items = Array.isArray(data) ? data : (data?.data ?? []);
    return items.filter((a: any) => isEntertainmentArtist(a as Record<string, unknown>));
  },
  getArtist: async (id: string): Promise<Artist> => {
    const { data } = await api.get<any>(`/band/artists/${id}`);
    return data.data;
  },

  // Bands
  getBands: async (): Promise<any[]> => {
    const { data } = await api.get<any>("/band/bands");
    const items = Array.isArray(data) ? data : (data?.data ?? []);
    return items.filter((b: any) => isEntertainmentArtist(b as Record<string, unknown>));
  },
  getBand: async (id: string): Promise<Band> => {
    const { data } = await api.get<any>(`/band/bands/${id}`);
    return data.data;
  },

  // Venues
  getVenues: async (): Promise<any[]> => {
    const { data } = await api.get<any>("/band/venues");
    const items = Array.isArray(data) ? data : (data?.data ?? []);
    return items.filter((v: any) => isEntertainmentVenue(v as Record<string, unknown>));
  },
  getVenue: async (id: string): Promise<Venue> => {
    const { data } = await api.get<any>(`/band/venues/${id}`);
    return data.data;
  },

  // Bookings
  createBooking: async (request: BookingRequest): Promise<Booking> => {
    const { data } = await api.post<any>("/band/bookings", request);
    return data.data;
  },
  
  // roleView = 'customer' or 'provider'
  getMyBookings: async (roleView: "customer" | "provider" = "customer"): Promise<Booking[]> => {
    const { data } = await api.get<any>(`/band/bookings?role_view=${roleView}`);
    return data.data;
  },

  getBooking: async (id: string): Promise<Booking> => {
    const { data } = await api.get<any>(`/band/bookings/${id}`);
    return data.data;
  },

  updateBookingStatus: async (id: string, status: string): Promise<Booking> => {
    const { data } = await api.put<any>(`/band/bookings/${id}/status?status=${status}`);
    return data.data;
  },

  simulatePayment: async (id: string, paymentStatus: string): Promise<Booking> => {
    const { data } = await api.put<any>(`/band/bookings/${id}/payment?payment_status=${paymentStatus}`);
    return data.data;
  },

  // Files
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("module", "band");
    const { data } = await api.post<any>("/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    // the backend usually returns { data: { url: "..." } } or similar
    // we'll try to extract the file_url
    return data.data?.file_url || data.data?.url || data.file_url || data.url || "";
  },

  // Events
  createEvent: async (request: CustomerEventCreate): Promise<CustomerEvent> => {
    const { data } = await api.post<any>("/band/customer/events", request);
    return data.data;
  },
  getCustomerEvents: async (): Promise<CustomerEvent[]> => {
    const { data } = await api.get<any>("/band/customer/events");
    return data.data;
  },
  getEvent: async (id: string): Promise<CustomerEvent> => {
    const { data } = await api.get<any>(`/band/customer/events/${id}`);
    return data.data;
  },
};

export { artistService } from "./band/artists.service";
export { venueService } from "./band/venues.service";
export { bookingService } from "./band/bookings.service";

