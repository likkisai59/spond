import { api } from "@/services/api";
import { Review, CreateReviewPayload, UpdateReviewPayload } from "@/types/review";

export const reviewService = {
  getReviews: async (params?: any): Promise<{ data: Review[] }> => {
    const res = await api.get("/reviews", { params });
    return res.data;
  },

  createReview: async (payload: CreateReviewPayload): Promise<{ data: Review }> => {
    const res = await api.post("/reviews", payload);
    return res.data;
  },

  updateReview: async (id: string, payload: UpdateReviewPayload): Promise<{ data: Review }> => {
    const res = await api.put(`/reviews/${id}`, payload);
    return res.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },

  getPublicVenueReviews: async () => ({ data: [] }) // To be implemented if needed
};
