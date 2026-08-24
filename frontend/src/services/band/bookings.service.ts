import { apiClient } from "@/services/api-client";
import type { ApiResponse, Paginated, BandBooking } from "@/types";

export const bookingsService = {
  list: async (query?: Record<string, unknown>): Promise<ApiResponse<Paginated<BandBooking>>> => {
    const { data } = await apiClient.get("/api/v1/band/bookings", { params: query });
    return data;
  },
  getHistory: async (): Promise<ApiResponse<Paginated<BandBooking>>> => {
    const { data } = await apiClient.get("/api/v1/band/bookings/history");
    return data;
  },
  getById: async (id: string): Promise<ApiResponse<BandBooking>> => {
    const { data } = await apiClient.get(`/api/v1/band/bookings/${id}`);
    return data;
  },
  create: async (input: unknown): Promise<ApiResponse<BandBooking>> => {
    const { data } = await apiClient.post("/api/v1/band/bookings", input);
    return data;
  },
  update: async (id: string, input: unknown): Promise<ApiResponse<BandBooking>> => {
    const { data } = await apiClient.put(`/api/v1/band/bookings/${id}`, input);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.delete(`/api/v1/band/bookings/${id}`);
    return data;
  }
};
