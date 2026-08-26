import { apiClient } from "../api-client";
import type { ApiResponse, Paginated } from "@/types";

export const venuesService = {
  list: async (query?: Record<string, unknown>): Promise<ApiResponse<Paginated<any>>> => {
    const { data } = await apiClient.get("/api/v1/sports/venues", { params: query });
    return data;
  },

  listOwnerVenues: async (): Promise<ApiResponse<Paginated<any>>> => {
    const { data } = await apiClient.get("/api/v1/sports/venues/owner");
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.get(`/api/v1/sports/venues/${id}`);
    return data;
  },

  create: async (venueData: any): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post("/api/v1/sports/venues", venueData);
    return data;
  },

  update: async (id: string, venueData: any): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put(`/api/v1/sports/venues/${id}`, venueData);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.delete(`/api/v1/sports/venues/${id}`);
    return data;
  },

  listSlots: async (id: string, query?: Record<string, unknown>): Promise<ApiResponse<Paginated<any>>> => {
    const { data } = await apiClient.get(`/api/v1/sports/venues/${id}/slots`, { params: query });
    return data;
  },

  createSlot: async (id: string, slotData: any): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post(`/api/v1/sports/venues/${id}/slots`, slotData);
    return data;
  },

  generateSlots: async (id: string, slotData: any): Promise<ApiResponse<Paginated<any>>> => {
    const { data } = await apiClient.post(`/api/v1/sports/venues/${id}/slots/generate`, slotData);
    return data;
  },

  publishVenue: async (id: string): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put(`/api/v1/sports/venues/${id}/publish`, {});
    return data;
  },

  updateSlot: async (id: string, slotData: any): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.put(`/api/v1/sports/slots/${id}`, slotData);
    return data;
  }
};
