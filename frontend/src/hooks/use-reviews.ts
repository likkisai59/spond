import { useState, useCallback, useEffect } from "react";
import { reviewService } from "@/services/reviewService";
import { Review, CreateReviewPayload, UpdateReviewPayload } from "@/types/review";

export const useReviews = (targetUserId?: string, revieweeOnly?: boolean) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | boolean> = {};
      if (targetUserId) params.user_id = targetUserId;
      if (revieweeOnly) params.reviewee_only = true;
      const res = await reviewService.getReviews(Object.keys(params).length ? params : undefined);
      setReviews(res.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, revieweeOnly]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
  };
};

export const useCreateReview = () => {
  const createReview = async (data: CreateReviewPayload) => {
    try {
      const res = await reviewService.createReview(data);
      return !!res.data;
    } catch (error) {
      console.error("Failed to create review", error);
      return false;
    }
  };
  return { createReview, replyToVenueReview: async () => false };
};

export const useCanReviewBooking = (_id: string) => {
  // Assume basic logic to allow review if booking ID exists, 
  // detailed check happens in the backend or component.
  return {
    canReview: true, 
    alreadyReviewed: false, 
    eligibility: { reason: "" }, 
    refetch: () => {}
  };
};

export const useUpdateReview = () => ({
  updateReview: async (id: string, data: UpdateReviewPayload) => {
    try {
      const res = await reviewService.updateReview(id, data);
      return !!res.data;
    } catch (error) {
      console.error("Failed to update review", error);
      return false;
    }
  }
});

export const useDeleteReview = () => ({
  deleteReview: async (id: string) => {
    try {
      await reviewService.deleteReview(id);
      return true;
    } catch (error) {
      console.error("Failed to delete review", error);
      return false;
    }
  }
});

