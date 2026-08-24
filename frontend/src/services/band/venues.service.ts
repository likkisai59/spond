import { apiClient } from "@/services/api-client";
import type { ApiResponse, Paginated, Venue } from "@/types";

export const venuesService = {
  list: async (query?: Record<string, unknown>): Promise<ApiResponse<Paginated<Venue>>> => {
    const { data } = await apiClient.get("/api/v1/band/venues", { params: query });
    return data;
  },
  getById: async (id: string): Promise<ApiResponse<Venue>> => {
    const { data } = await apiClient.get(`/api/v1/band/venues/${id}`);
    return data;
  },
  create: async (input: unknown): Promise<ApiResponse<Venue>> => {
    const { data } = await apiClient.post("/api/v1/band/venues", input);
    return data;
  },
  update: async (id: string, input: unknown): Promise<ApiResponse<Venue>> => {
    const { data } = await apiClient.put(`/api/v1/band/venues/${id}`, input);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.delete(`/api/v1/band/venues/${id}`);
    return data;
  }
};
