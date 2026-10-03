"use client";

import * as React from "react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ReviewList } from "@/components/reviews/ReviewList";
import { reviewService } from "@/services/reviewService";
import { Review } from "@/types/review";
import { ReviewFormModal } from "@/components/reviews/ReviewFormModal";
import { ReviewFormData } from "@/utils/validation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { bookingService } from "@/services/band/bookings.service";
import { BookingRequestDetail } from "@/types/booking";

export default function ReviewsPage() {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingReview, setEditingReview] = React.useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [eligibleBookings, setEligibleBookings] = React.useState<BookingRequestDetail[]>([]);
  
  const { user } = useAuth();
  const currentUserId = user?.id || "";

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getReviews();
      setReviews(response.data);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingService.getClientBookings({ limit: 100 });
      const completed = (response.bookings || []).filter((b: BookingRequestDetail) => 
        (b.status as string) === "completed" || (b.status as string) === "EVENT_COMPLETED" || b.status === "confirmed"
      );
      setEligibleBookings(completed);
    } catch (err: unknown) {
      console.error("Failed to load eligible bookings for review:", err);
    }
  };

  React.useEffect(() => {
    fetchReviews();
    fetchBookings();
  }, []);

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleDelete = async (review: Review) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewService.deleteReview(review.id);
        toast.success("Review deleted successfully!");
        fetchReviews();
      } catch (err: unknown) {
        toast.error((err as Error).message || "Failed to delete review");
      }
    }
  };

  const handleSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview.id, {
          rating: data.rating,
          review_title: data.review_title,
          review_text: data.review_text,
        });
        toast.success("Review updated successfully!");
      } else {
        if (!data.booking_id) {
          throw new Error("Please select a booking to review");
        }
        await reviewService.createReview({
          rating: data.rating,
          review_title: data.review_title,
          review_text: data.review_text,
          booking_id: data.booking_id,
        });
        toast.success("Review submitted successfully!");
      }
      setIsModalOpen(false);
      setEditingReview(null);
      fetchReviews();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openNewReview = () => {
    setEditingReview(null);
    setIsModalOpen(true);
  };

  return (
    <PageContainer as="main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Reviews" 
          description="View your past reviews and ratings." 
        />
        <Button onClick={openNewReview} className="w-full sm:w-auto self-start sm:self-auto flex items-center gap-2">
          <Plus className="h-4 w-4" /> Write a Review
        </Button>
      </div>

      <div className="mt-8">
        <ReviewList 
          reviews={reviews}
          loading={loading}
          error={error}
          onRefresh={fetchReviews}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentUserId={currentUserId}
          emptyTitle="No reviews yet"
          emptyMessage="You haven't written any reviews yet. Complete bookings to leave feedback!"
        />
      </div>

      <ReviewFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingReview}
        isLoading={isSubmitting}
        eligibleBookings={eligibleBookings}
      />
    </PageContainer>
  );
}
