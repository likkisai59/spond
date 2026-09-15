import { apiClient } from "../api-client";
import type { ApiResponse, Paginated } from "@/types";

export const bookingsService = {
  list: async (query?: Record<string, unknown>): Promise<ApiResponse<Paginated<any>>> => {
    const { data } = await apiClient.get("/api/v1/sports/bookings", { params: query });
    return data;
  },

  getHistory: async (): Promise<ApiResponse<Paginated<any>>> => {
    const { data } = await apiClient.get("/api/v1/sports/bookings/history");
    return data;
  },

  getOwnerBookings: async (): Promise<ApiResponse<Paginated<any>>> => {
    const { data } = await apiClient.get("/api/v1/sports/bookings/owner");
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.get(`/api/v1/sports/bookings/${id}`);
    return data;
  },

  create: async (bookingData: any): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post("/api/v1/sports/bookings", bookingData);
    return data;
  },

  cancel: async (id: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put(`/api/v1/sports/bookings/${id}/cancel`);
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put(`/api/v1/sports/bookings/${id}/status`, { status });
    return data;
  }
};
