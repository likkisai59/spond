import { Review, CreateReviewPayload, UpdateReviewPayload } from "@/types/review";

// Mock initial data
let mockReviews: Review[] = [];

export const reviewService = {
  getReviews: async (params?: any): Promise<{ data: Review[] }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: [...mockReviews] };
  },

  createReview: async (payload: CreateReviewPayload): Promise<{ data: Review }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      rating: payload.rating,
      review_title: payload.review_title,
      review_text: payload.review_text,
      comment: payload.review_text,
      is_public: payload.is_public ?? true,
      images: payload.images || [],
      videos: payload.videos || [],
      booking_id: payload.booking_id,
      client_id: "client-current",
      reviewer_id: "client-current",
      reviewer_role: "client",
      reviewer: { id: "client-current", name: "You" },
      client: { id: "client-current", name: "You" },
      created_at: new Date().toISOString(),
    };
    mockReviews = [newReview, ...mockReviews];
    return { data: newReview };
  },

  updateReview: async (id: string, payload: UpdateReviewPayload): Promise<{ data: Review }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockReviews.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Review not found");
    
    const updatedReview = { 
      ...mockReviews[index], 
      ...payload,
      review_text: payload.review_text || payload.comment || mockReviews[index].review_text,
      comment: payload.review_text || payload.comment || mockReviews[index].comment,
      updated_at: new Date().toISOString() 
    };
    mockReviews[index] = updatedReview;
    return { data: updatedReview };
  },

  deleteReview: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockReviews = mockReviews.filter(r => r.id !== id);
  },

  getPublicVenueReviews: async () => ({ data: [] })
};
