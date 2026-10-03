"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, ReviewFormData } from "@/utils/validation";
import { Review } from "@/types/review";
import { BookingRequestDetail } from "@/types/booking";
import { InteractiveRatingStars } from "./RatingStars";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => void;
  initialData?: Review | null;
  isLoading?: boolean;
  eligibleBookings?: BookingRequestDetail[];
}

export function ReviewFormModal({ isOpen, onClose, onSubmit, initialData, isLoading, eligibleBookings }: ReviewFormModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      review_title: "",
      review_text: "",
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          rating: initialData.rating,
          review_title: initialData.review_title || "",
          review_text: initialData.review_text || initialData.comment || "",
          booking_id: initialData.booking_id || undefined,
        });
      } else {
        reset({ rating: 0, review_title: "", review_text: "", booking_id: "" });
      }
    }
  }, [isOpen, initialData, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Review" : "Write a Review"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update your feedback below." : "Share your experience about this booking."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          {!initialData && eligibleBookings && eligibleBookings.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="booking_id" className="text-xs font-bold text-muted-foreground uppercase">
                Select Booking to Review
              </Label>
              <select
                id="booking_id"
                className="flex h-9 w-full rounded-xl border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...register("booking_id", { required: "Please select a booking to review" })}
              >
                <option value="">-- Choose a completed booking --</option>
                {eligibleBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.artist_name || b.venue_name || b.event_name || b.event_title || "Booking"} - {new Date(b.event_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {errors.booking_id && <p className="text-xs text-error">{errors.booking_id.message}</p>}
            </div>
          )}

          <div className="space-y-2 flex flex-col items-center">
            <Label className="text-xs uppercase font-bold text-muted-foreground">Your Rating</Label>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <InteractiveRatingStars
                  rating={field.value}
                  size="lg"
                  onRatingChange={field.onChange}
                />
              )}
            />
            {errors.rating && <p className="text-xs text-error font-medium">{errors.rating.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review_title" className="text-xs font-bold text-muted-foreground uppercase">
              Title (Optional)
            </Label>
            <Input
              id="review_title"
              placeholder="Sum up your experience"
              {...register("review_title")}
            />
            {errors.review_title && <p className="text-xs text-error">{errors.review_title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review_text" className="text-xs font-bold text-muted-foreground uppercase">
              Review Details
            </Label>
            <Textarea
              id="review_text"
              placeholder="What did you like? What could be better?"
              rows={4}
              {...register("review_text")}
            />
            {errors.review_text && <p className="text-xs text-error">{errors.review_text.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
