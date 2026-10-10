/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { BookingRequestDetail } from "@/types/booking";
import { bookingService } from "@/services/bookingService";
import { bandService } from "@/services/band";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { BookingTimeline } from "./BookingTimeline";
import { BookingInformationCard } from "./BookingInformationCard";
import { PaymentModal } from "./PaymentModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  IndianRupee,
  MessageSquare,
  Send,
  X,
  Check,
  Ban,
  CheckSquare,
  Star,
  MessageSquarePlus,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMessagingStore } from "@/features/messaging/store/messaging-store";
import { useCanReviewBooking, useCreateReview } from "@/hooks/use-reviews";
import { LeaveReviewDialog } from "@/components/reviews/LeaveReviewDialog";
import { AlreadyReviewedCard } from "@/components/reviews/AlreadyReviewedCard";
import { ReviewEligibilityBanner } from "@/components/reviews/ReviewEligibilityBanner";

interface BookingDetailsDialogProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: (silent?: boolean) => void;
  role: "client" | "artist" | "venue" | "admin";
}

/** Normalize a raw band Booking into the BookingRequestDetail shape */
function normalizeBandBooking(raw: any): BookingRequestDetail {
  return {
    id: raw.id,
    event_name: raw.event_name || raw.customer_name || `Booking #${String(raw.id).slice(-6).toUpperCase()}`,
    event_date: raw.event_date,
    start_time: raw.event_time,
    end_time: raw.event_time,
    proposed_price: raw.total_amount,
    counter_price: null,
    status: (String(raw.status).toLowerCase()) as BookingRequestDetail["status"],
    location: "",
    notes: raw.message || null,
    client: { 
      id: raw.customer_id, 
      name: raw.customer_name || "Client", 
      email: raw.customer_email || "",
      phone: raw.customer_phone || ""
    },
    provider_phone: raw.provider_phone || "",
    customer_phone: raw.customer_phone || "",
    artist: null,
    venue: null,
    timeline: [],
    booking_notes: [],
    timeline_events: [],
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export function BookingDetailsDialog({
  bookingId,
  isOpen,
  onClose,
  onRefresh,
  role,
}: BookingDetailsDialogProps) {
  const router = useRouter();
  const createConversation = useMessagingStore((s) => s.createConversation);
  const {
    canReview,
    alreadyReviewed,
    eligibility,
    refetch: refetchEligibility,
  } = useCanReviewBooking(bookingId);
  const { createReview } = useCreateReview();

  const [booking, setBooking] = React.useState<BookingRequestDetail | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [actioning, setActioning] = React.useState<boolean>(false);
  const [newComment, setNewComment] = React.useState<string>("");
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState<boolean>(false);
  const [cancelReason, setCancelReason] = React.useState<string>("");
  const [cancelReasonError, setCancelReasonError] = React.useState<string | null>(null);
  const [leaveReviewOpen, setLeaveReviewOpen] = React.useState<boolean>(false);
  const [paymentModalOpen, setPaymentModalOpen] = React.useState<boolean>(false);
  const [paymentType, setPaymentType] = React.useState<"ADVANCE_PAID" | "FULLY_PAID">("ADVANCE_PAID");

  const isBandRole = role === "artist" || role === "venue";

  const fetchBookingDetails = React.useCallback(async () => {
    setLoading(true);
    try {
      if (isBandRole) {
        const raw = await bandService.getBooking(bookingId);
        if (raw) setBooking(normalizeBandBooking(raw));
      } else {
        const data = await bookingService.getBookingDetails(bookingId);
        setBooking(data);
      }
      // Silently refresh the parent inbox so it reflects any external changes!
      if (onRefresh) onRefresh(true);
    } catch {
      toast.error("Failed to load booking details.");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [bookingId, isBandRole, onClose, onRefresh]);

  React.useEffect(() => {
    if (isOpen && bookingId) fetchBookingDetails();
  }, [isOpen, bookingId, fetchBookingDetails]);

  const handleStatusAction = async (action: "accept" | "reject" | "complete") => {
    setActioning(true);
    try {
      if (isBandRole) {
        const statusMap: Record<string, string> = {
          accept: "ACCEPTED",
          reject: "REJECTED",
          complete: "COMPLETED",
        };
        const rawUpdated = await bandService.updateBookingStatus(bookingId, statusMap[action]);
        if (rawUpdated) setBooking(normalizeBandBooking(rawUpdated));
        const msg =
          action === "accept"
            ? "Booking accepted!"
            : action === "reject"
            ? "Booking rejected."
            : "Event completed!";
        toast.success(msg);
      } else {
        let res: BookingRequestDetail;
        if (action === "accept") {
          res =
            (role as string) === "venue"
              ? await bookingService.acceptVenueBooking(bookingId)
              : await bookingService.acceptBooking(bookingId);
          toast.success("Booking request accepted!");
          try {
            const conversation = await createConversation(bookingId);
            if (conversation) router.push(`/band/${role}/messages`);
          } catch {
            // ignore chat errors
          }
        } else if (action === "reject") {
          res =
            (role as string) === "venue"
              ? await bookingService.rejectVenueBooking(bookingId)
              : await bookingService.rejectBooking(bookingId);
          toast.success("Booking request rejected.");
        } else {
          res = await bookingService.completeVenueBooking(bookingId);
          toast.success("Event marked as completed!");
        }
        setBooking(res);
      }
      refetchEligibility();
      if (onRefresh) onRefresh();
    } catch (err) {
      const error = err as { response?: { data?: { error?: { message?: string }, detail?: string, message?: string } } };
      const msg =
        error.response?.data?.error?.message || 
        error.response?.data?.detail || 
        error.response?.data?.message || 
        `Failed to perform ${action} action.`;
      toast.error(msg);
    } finally {
      setActioning(false);
    }
  };

  const handleCancelWithReason = async () => {
    if (cancelReason.trim().length < 10) {
      setCancelReasonError("Please provide a reason of at least 10 characters.");
      return;
    }
    setCancelReasonError(null);
    setActioning(true);
    try {
      let res: BookingRequestDetail;
      if (booking?.venue_id) {
        res = await bookingService.cancelVenueBooking(bookingId, cancelReason);
      } else {
        res = await bookingService.cancelBooking(bookingId, cancelReason);
      }
      toast.success("Booking request cancelled.");
      setBooking(res);
      setCancelConfirmOpen(false);
      setCancelReason("");
      if (onRefresh) onRefresh();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to cancel booking.";
      toast.error(msg);
    } finally {
      setActioning(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!window.confirm("Are you sure you want to delete this booking? This will remove it from your workspace permanently.")) return;
    setActioning(true);
    try {
      await bookingService.deleteBooking(bookingId);
      toast.success("Booking deleted.");
      onClose();
      if (onRefresh) onRefresh();
    } catch {
      toast.error("Failed to delete booking.");
    } finally {
      setActioning(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setActioning(true);
    try {
      await bookingService.addBookingNote(bookingId, newComment.trim());
      setNewComment("");
      toast.success("Comment added.");
      const updated = await bookingService.getBookingDetails(bookingId);
      setBooking(updated);
    } catch {
      toast.error("Failed to add comment.");
    } finally {
      setActioning(false);
    }
  };

  const handleReviewSubmit = async (data: any) => {
    const created = await createReview(data);
    if (created) {
      toast.success("Review submitted successfully!");
      refetchEligibility();
      return true;
    }
    return false;
  };

  // Accept/reject: band bookings use "requested"; old flow uses "pending" etc.
  const actionableStatuses = ["pending", "under_review", "requested"];
  const canAccept =
    booking && actionableStatuses.includes(booking.status) && role !== "client";
  const canReject =
    booking && actionableStatuses.includes(booking.status) && role !== "client";
  const canCancel =
    booking &&
    [...actionableStatuses, "accepted", "confirmed"].includes(booking.status);
  const canComplete =
    booking &&
    ["accepted", "confirmed"].includes(booking.status) &&
    role !== "client";
  const isCompleted = booking && booking.status === "completed";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          onClose={onClose}
          className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 text-xs text-muted-foreground scrollbar-thin"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Spinner className="h-10 w-10 text-[#f03e65]" />
              <p className="text-sm animate-pulse text-muted-foreground">
                Retrieving booking parameters...
              </p>
            </div>
          ) : !booking ? (
            <div className="text-center py-10 text-sm">Failed to load booking.</div>
          ) : (
            <div className="space-y-6">
              <DialogHeader className="border-b border-border pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                      {booking.event_type || "Booking"} Request
                    </span>
                    <DialogTitle className="text-lg font-extrabold text-foreground font-heading tracking-tight leading-none">
                      {booking.event_title || booking.event_name}
                    </DialogTitle>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center pr-8">
                    <BookingStatusBadge status={booking.status} />
                    <span className="text-[10px] text-muted-foreground">
                      ID: {booking.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Review Section Banner on Completed Booking */}
              {isCompleted && (
                <div className="space-y-3">
                  {canReview && (
                    <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-xs">
                          Event Completed! Leave your performance review.
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setLeaveReviewOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                      >
                        <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
                        Write Review
                      </Button>
                    </div>
                  )}
                  {alreadyReviewed && <AlreadyReviewedCard />}
                  {!canReview && !alreadyReviewed && eligibility?.reason && (
                    <ReviewEligibilityBanner eligible={false} reason={eligibility.reason} />
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  <BookingInformationCard booking={booking} />

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                    {!isBandRole && booking.payment_status === "ADVANCE_PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setPaymentType("ADVANCE_PAID");
                          setPaymentModalOpen(true);
                        }}
                        disabled={actioning}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <IndianRupee className="h-4 w-4" />
                        <span>Pay 25% Advance ({booking.advance_amount || booking.proposed_price * 0.25})</span>
                      </Button>
                    )}
                    {!isBandRole && booking.payment_status === "FINAL_PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setPaymentType("FULLY_PAID");
                          setPaymentModalOpen(true);
                        }}
                        disabled={actioning}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <IndianRupee className="h-4 w-4" />
                        <span>Pay 75% Final Balance</span>
                      </Button>
                    )}
                    {canAccept && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusAction("accept")}
                        disabled={actioning}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                        <span>Accept Inquiry</span>
                      </Button>
                    )}
                    {canReject && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusAction("reject")}
                        disabled={actioning}
                        className="border-red-500/30 hover:bg-red-500/10 text-red-400 font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ban className="h-4 w-4" />
                        <span>Reject Inquiry</span>
                      </Button>
                    )}
                    {canComplete && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusAction("complete")}
                        disabled={actioning}
                        className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckSquare className="h-4 w-4" />
                        <span>Conclude &amp; Complete</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const conv = await createConversation(booking.id);
                        if (conv) {
                          onClose();
                          router.push(`/band/${role}/messages`);
                        }
                      }}
                      className="border-primary/40 hover:bg-primary/10 text-primary font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Open Chat</span>
                    </Button>
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelConfirmOpen(true)}
                        disabled={actioning}
                        className="border-border hover:bg-accent hover:text-foreground font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                        <span>Cancel Booking</span>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeleteBooking}
                      disabled={actioning}
                      className="border-red-500/30 hover:bg-red-500/10 text-red-500 font-bold h-9 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>

                {/* Right Column: Timeline */}
                <div className="space-y-4 lg:border-l lg:border-border lg:pl-6">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Request Timeline Flow
                  </h4>
                  <BookingTimeline events={Array.isArray(booking.timeline_events) ? booking.timeline_events : []} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent className="bg-card border border-border max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black tracking-tight text-foreground">
              Cancel Booking Request?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Please provide a cancellation reason. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 my-4">
            <Label htmlFor="cancel_reason_dialog" className="text-xs font-bold text-foreground">
              Cancellation Rationale
            </Label>
            <textarea
              id="cancel_reason_dialog"
              placeholder="Provide cancellation rationale here..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg border border-border bg-background/50 text-xs font-semibold focus-visible:ring-primary focus-visible:outline-none resize-none"
            />
            {cancelReasonError && (
              <p className="text-[10px] font-bold text-red-500 animate-pulse">
                {cancelReasonError}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              disabled={actioning}
              onClick={() => {
                setCancelConfirmOpen(false);
                setCancelReasonError(null);
              }}
              className="border-border hover:bg-accent/20 text-xs font-bold"
            >
              Keep Reservation
            </Button>
            <Button
              disabled={actioning}
              onClick={handleCancelWithReason}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold"
            >
              {actioning ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Review Dialog */}
      <LeaveReviewDialog
        open={leaveReviewOpen}
        onOpenChange={setLeaveReviewOpen}
        bookingId={bookingId}
        onSubmit={handleReviewSubmit}
      />

      {/* Payment Modal */}
      {booking && paymentModalOpen && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          bookingId={booking.id}
          amount={paymentType === "ADVANCE_PAID" ? (booking.advance_amount || booking.proposed_price * 0.25) : (booking.proposed_price - (booking.advance_amount || booking.proposed_price * 0.25))}
          paymentType={paymentType}
          onSuccess={() => {
            fetchBookingDetails();
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
}
