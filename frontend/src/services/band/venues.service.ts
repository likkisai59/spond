import { api } from "../api";
import { VenueProfileUpdateFormData } from "@/utils/validation";
import {
  VenueResponseData,
  VenueDashboardData,
  VenueMediaData,
  VenueAvailabilityData,
  VenueConflictCheckRequest,
  VenueConflictCheckResponse,
  VenueFacilitiesData,
  VenuePricingData,
  VenueAnalyticsData,
  VenueDocumentsResubmitData,
  VenueSettingsData,
} from "@/types/venue";
import { isPreviewActive, toastMutationBlocked } from "@/utils/dev-mode";

export const venueService = {
  getDashboardStats: async (): Promise<VenueDashboardData> => {
    if (isPreviewActive()) return toastMutationBlocked() as unknown as Promise<VenueDashboardData>;
    const response = await api.get<any>("/band/venues/me/dashboard");
    return response.data.data;
  },

  getProfile: async (): Promise<VenueResponseData> => {
    if (isPreviewActive()) return toastMutationBlocked() as unknown as Promise<VenueResponseData>;
    const response = await api.get<any>("/band/venues/me");
    return response.data.data;
  },

  updateProfile: async (data: VenueProfileUpdateFormData): Promise<VenueResponseData> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<any>("/band/venues/me", data);
    return response.data.data;
  },

  getMedia: async (): Promise<VenueMediaData> => {
    if (isPreviewActive()) return toastMutationBlocked() as unknown as Promise<VenueMediaData>;
    const response = await api.get<any>("/band/venues/me/media");
    return response.data.data;
  },

  updateMedia: async (data: VenueMediaData): Promise<VenueMediaData> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<any>("/band/venues/me/media", data);
    return response.data.data;
  },

  getAvailability: async (): Promise<VenueAvailabilityData> => {
    if (isPreviewActive())
      return toastMutationBlocked() as unknown as Promise<VenueAvailabilityData>;
    const response = await api.get<any>("/band/venues/me/availability");
    return response.data.data;
  },

  updateAvailability: async (
    data: Omit<VenueAvailabilityData, "bookings">,
  ): Promise<VenueAvailabilityData> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<any>("/band/venues/me/availability", data);
    return response.data.data;
  },

  checkConflict: async (data: VenueConflictCheckRequest): Promise<VenueConflictCheckResponse> => {
    if (isPreviewActive()) return Promise.resolve({ conflict: false, reason: null });
    const response = await api.post<any>("/band/venues/me/availability/check-conflict", data);
    return response.data.data;
  },

  getFacilities: async (): Promise<VenueFacilitiesData> => {
    if (isPreviewActive()) return toastMutationBlocked() as unknown as Promise<VenueFacilitiesData>;
    const response = await api.get<any>("/band/venues/me/facilities");
    return response.data.data;
  },

  updateFacilities: async (data: VenueFacilitiesData): Promise<VenueFacilitiesData> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<any>("/band/venues/me/facilities", data);
    return response.data.data;
  },

  getPricing: async (): Promise<VenuePricingData> => {
    if (isPreviewActive()) return toastMutationBlocked() as unknown as Promise<VenuePricingData>;
    const response = await api.get<any>("/band/venues/me/pricing");
    return response.data.data;
  },

  updatePricing: async (data: VenuePricingData): Promise<VenuePricingData> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<any>("/band/venues/me/pricing", data);
    return response.data.data;
  },

  getAnalytics: async (): Promise<VenueAnalyticsData> => {
    if (isPreviewActive()) return toastMutationBlocked() as unknown as Promise<VenueAnalyticsData>;
    const response = await api.get<any>("/band/venues/me/analytics");
    return response.data.data;
  },

  resubmitVerificationDocuments: async (
    data: VenueDocumentsResubmitData,
  ): Promise<VenueResponseData> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<any>("/band/venues/me/verification/resubmit", data);
    return response.data.data;
  },

  updateVenueSettings: async (data: VenueSettingsData): Promise<VenueResponseData> => {
    if (isPreviewActive()) return toastMutationBlocked();
    const response = await api.put<any>("/band/venues/me/settings", data);
    return response.data.data;
  },

  getPublicVenueDetail: async (id: string): Promise<VenueResponseData> => {
    if (isPreviewActive()) return toastMutationBlocked() as unknown as Promise<VenueResponseData>;
    const response = await api.get<any>(`/band/venues/${id}`);
    return response.data.data;
  },

  getPublicVenues: async (
    params?: Record<string, unknown>,
  ): Promise<{ venues: VenueResponseData[]; total: number }> => {
    if (isPreviewActive()) return Promise.resolve({ venues: [], total: 0 });
    const response = await api.get<any>("/band/venues", { params });
    const d = response.data.data;
    return { venues: d.items ?? d.venues ?? [], total: d.total ?? 0 };
  },
};
