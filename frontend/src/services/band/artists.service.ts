import { apiClient } from "@/services/api-client";
import type { ApiResponse, Paginated, BandArtist } from "@/types";

export const artistsService = {
  list: async (query?: Record<string, unknown>): Promise<ApiResponse<Paginated<BandArtist>>> => {
    const { data } = await apiClient.get("/api/v1/band/artists", { params: query });
    return data;
  },
  getById: async (id: string): Promise<ApiResponse<BandArtist>> => {
    const { data } = await apiClient.get(`/api/v1/band/artists/${id}`);
    return data;
  },
  create: async (input: unknown): Promise<ApiResponse<BandArtist>> => {
    const { data } = await apiClient.post("/api/v1/band/artists", input);
    return data;
  },
  update: async (id: string, input: unknown): Promise<ApiResponse<BandArtist>> => {
    const { data } = await apiClient.put(`/api/v1/band/artists/${id}`, input);
    return data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await apiClient.delete(`/api/v1/band/artists/${id}`);
    return data;
  }
};
