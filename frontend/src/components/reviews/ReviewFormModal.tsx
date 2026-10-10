"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, ReviewFormData } from "@/utils/validation";
import { Review } from "@/types/review";
import toast from "react-hot-toast";

import { InteractiveRatingStars } from "./RatingStars";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ReviewableBooking {
  id: string;
  artist?: { display_name?: string };
  artist_name?: string;
  venue_name?: string;
  event_title?: string;
  event_name?: string;
  customer_name?: string;
  provider_name?: string;
  event_date: string;
}

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => void;
  initialData?: Review | null;
  isLoading?: boolean;
  eligibleBookings?: ReviewableBooking[];
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 text-xs text-muted-foreground scrollbar-thin">
        <DialogHeader className="border-b border-border pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
              {initialData ? "Edit Review" : "Feedback"}
            </span>
            <DialogTitle className="text-xl font-extrabold text-foreground font-heading tracking-tight leading-none">
              {initialData ? "Update Your Review" : "Write a Review"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              {initialData ? "Update your feedback below." : "Share your experience about this booking to help others in the EventHub Marketplace."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please fill in all required fields (Booking and Star Rating)"))} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left side: Form inputs */}
            <div className="md:col-span-3 space-y-5">
              {!initialData && (
                <div className="space-y-1.5">
                  <Label htmlFor="booking_id" className="text-xs font-bold text-foreground">
                    Select Booking to Review
                  </Label>
                  <select
                    id="booking_id"
                    className="flex h-10 w-full rounded-xl border border-border bg-card px-3 text-xs text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    {...register("booking_id", { required: "Please select a booking to review" })}
                  >
                    {!eligibleBookings || eligibleBookings.length === 0 ? (
                      <option value="">No completed or accepted bookings available</option>
                    ) : (
                      <>
                        <option value="">-- Choose a booking --</option>
                        {eligibleBookings.map((b) => {
                          const displayName = b.event_title || b.event_name || b.customer_name || b.provider_name || b.artist?.display_name || b.artist_name || b.venue_name || "Booking";
                          return (
                            <option key={b.id} value={b.id}>
                              {displayName} • {new Date(b.event_date).toLocaleDateString()}
                            </option>
                          );
                        })}
                      </>
                    )}
                  </select>
                  {errors.booking_id && <p className="text-[10px] text-error font-medium">{errors.booking_id.message}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="review_title" className="text-xs font-bold text-foreground">
                  Summary Title (Optional)
                </Label>
                <Input
                  id="review_title"
                  placeholder="Sum up your experience in a few words"
                  className="bg-card border-border text-foreground text-xs h-10"
                  {...register("review_title")}
                />
                {errors.review_title && <p className="text-[10px] text-error font-medium">{errors.review_title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review_text" className="text-xs font-bold text-foreground">
                  Review Details
                </Label>
                <Textarea
                  id="review_text"
                  placeholder="What did you like? What could be better? Your feedback helps performers and other organizers!"
                  rows={6}
                  className="bg-card border-border text-foreground text-xs resize-none"
                  {...register("review_text")}
                />
                {errors.review_text && <p className="text-[10px] text-error font-medium">{errors.review_text.message}</p>}
              </div>
            </div>

            {/* Right side: Rating */}
            <div className="md:col-span-2 space-y-4 md:border-l md:border-border md:pl-8 flex flex-col justify-center">
              <div className="p-6 bg-accent/20 rounded-2xl border border-primary/10 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">Overall Rating</h4>
                  <p className="text-[10px] text-muted-foreground">Click to rate your experience</p>
                </div>
                
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <div className="scale-125 origin-center py-2">
                      <InteractiveRatingStars
                        rating={field.value}
                        size="lg"
                        onRatingChange={field.onChange}
                      />
                    </div>
                  )}
                />
                {errors.rating && <p className="text-[10px] text-error font-bold animate-pulse">{errors.rating.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="border-border hover:bg-accent hover:text-foreground font-bold text-xs h-10 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs h-10 px-8"
            >
              {isLoading ? "Saving..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
