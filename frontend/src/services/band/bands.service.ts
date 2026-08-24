import { apiClient } from "@/services/api-client";
import type { ApiResponse, Paginated, BandProfile } from "@/types";

export const bandsService = {
  list: async (query?: Record<string, unknown>): Promise<ApiResponse<Paginated<BandProfile>>> => {
    const { data } = await apiClient.get("/api/v1/band/bands", { params: query });
    return data;
  },
  getById: async (id: string): Promise<ApiResponse<BandProfile>> => {
    const { data } = await apiClient.get(`/api/v1/band/bands/${id}`);
    return data;
  },
  create: async (input: unknown): Promise<ApiResponse<BandProfile>> => {
    const { data } = await apiClient.post("/api/v1/band/bands", input);
    return data;
  },
  update: async (id: string, input: unknown): Promise<ApiResponse<BandProfile>> => {
    const { data } = await apiClient.put(`/api/v1/band/bands/${id}`, input);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.delete(`/api/v1/band/bands/${id}`);
    return data;
  }
};
