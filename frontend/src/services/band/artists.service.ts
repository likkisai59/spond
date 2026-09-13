import { api } from "../api";
import { ArtistProfileUpdateFormData } from "@/utils/validation";
import {
  ArtistProfile,
  ArtistDashboardData,
  AvailabilityData,
  MediaGalleryData,
  PricingData,
} from "@/types/artist";
import { ArtistAnalytics } from "@/types/analytics";
import { isPreviewActive } from "@/utils/dev-mode";
import { mockPublicArtists } from "@/utils/preview-fixtures";

export const artistService = {
  getDashboardStats: async (): Promise<ArtistDashboardData> => {
    const response = await api.get<any>("/band/artists/me/dashboard");
    return response.data.data;
  },

  getProfile: async (): Promise<ArtistProfile> => {
    const response = await api.get<any>("/band/artists/me");
    return response.data.data;
  },

  updateProfile: async (data: ArtistProfileUpdateFormData): Promise<ArtistProfile> => {
    const response = await api.put<any>("/band/artists/me", data);
    return response.data.data;
  },

  getAvailability: async (): Promise<AvailabilityData> => {
    const response = await api.get<any>("/band/artists/me/availability");
    return response.data.data;
  },

  updateAvailability: async (data: AvailabilityData): Promise<AvailabilityData> => {
    const response = await api.put<any>("/band/artists/me/availability", data);
    return response.data.data;
  },

  checkConflict: async (
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<{ has_conflict: boolean; reason: string | null }> => {
    const response = await api.post<any>("/band/artists/me/availability/check-conflict", {
      date,
      start_time: startTime,
      end_time: endTime,
    });
    return response.data.data;
  },

  getMedia: async (): Promise<MediaGalleryData> => {
    const response = await api.get<any>("/band/artists/me/media");
    return response.data.data;
  },

  updateMedia: async (data: MediaGalleryData): Promise<MediaGalleryData> => {
    const response = await api.put<any>("/band/artists/me/media", data);
    return response.data.data;
  },

  getPricing: async (): Promise<PricingData> => {
    const response = await api.get<any>("/band/artists/me/pricing");
    return response.data.data;
  },

  updatePricing: async (data: PricingData): Promise<PricingData> => {
    const response = await api.put<any>("/band/artists/me/pricing", data);
    return response.data.data;
  },

  getAnalytics: async (): Promise<ArtistAnalytics> => {
    const response = await api.get<any>("/band/artists/me/analytics");
    return response.data.data;
  },

  getPublicArtists: async (
    params?: Record<string, unknown>,
  ): Promise<{ artists: ArtistProfile[]; total: number }> => {
    if (isPreviewActive())
      return Promise.resolve({ artists: mockPublicArtists, total: mockPublicArtists.length });
    const response = await api.get<any>("/band/artists", { params });
    return response.data.data;
  },

  getPublicArtistDetail: async (id: string): Promise<ArtistProfile> => {
    if (isPreviewActive()) {
      const profile = mockPublicArtists.find((artist) => artist.id === id) || mockPublicArtists[0];
      return Promise.resolve(profile);
    }
    const response = await api.get<any>(`/band/artists/${id}`);
    return response.data.data;
  },
};
