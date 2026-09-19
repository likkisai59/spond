import { BookingRequestDetail } from "@/types/booking";

export const useArtistBookings = () => ({
  bookings: [] as BookingRequestDetail[],
  total: 0,
  loading: false,
  error: null,
  status: "",
  setStatus: (s: string) => {},
  search: "",
  setSearch: (s: string) => {},
  page: 1,
  setPage: (p: any) => {},
  limit: 10,
  refetch: () => {}
});