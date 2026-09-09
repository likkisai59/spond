import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types/band";
import { Calendar, Clock, DollarSign, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useAppDispatch } from "@/store/hooks";
import { updateBookingStatus, simulatePayment } from "@/store/band/marketplace-slice";
import { notificationAdded } from "@/store/slices/notification-slice";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isProviderView: boolean;
}

export function BookingDetailsDialog({ booking, open, onOpenChange, isProviderView }: BookingDetailsDialogProps) {
  const dispatch = useAppDispatch();

  if (!booking) return null;

  const handleUpdateStatus = async (status: string) => {
    try {
      await dispatch(updateBookingStatus({ id: booking.id, status })).unwrap();
      dispatch(notificationAdded({ title: "Success", message: "Booking updated", variant: "success" }));
    } catch (e) {
      dispatch(notificationAdded({ title: "Error", message: "Failed to update booking", variant: "error" }));
    }
  };

  const handlePayment = async (paymentStatus: string) => {
    try {
      await dispatch(simulatePayment({ id: booking.id, paymentStatus })).unwrap();
      dispatch(notificationAdded({ title: "Payment Successful", message: "Your payment has been processed.", variant: "success" }));
    } catch (e) {
      dispatch(notificationAdded({ title: "Error", message: "Failed to process payment", variant: "error" }));
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="sm:max-w-[500px]">
        <ModalHeader>
          <ModalTitle>Booking Details</ModalTitle>
        </ModalHeader>
        
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">
              Status: <Badge variant="outline">{booking.status}</Badge>
            </span>
            <span className="font-semibold text-lg">
              Payment: <Badge>{booking.payment_status}</Badge>
            </span>
          </div>

          <div className="space-y-4 rounded-xl bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{format(new Date(booking.event_date), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span>{booking.event_time}</span>
            </div>
            {booking.message && (
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">{booking.message}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Milestone Payments</h4>
            
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Advance (25%)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">${booking.advance_amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Required to confirm</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Final Payment (75%)</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">${(booking.total_amount - booking.advance_amount).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Upon completion</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-bold">Total</span>
                <span className="font-bold text-accent">${booking.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
             {isProviderView ? (
               <>
                 {booking.status === "REQUESTED" && (
                   <>
                     <Button variant="outline" className="w-full" onClick={() => handleUpdateStatus("REJECTED")}>Reject</Button>
                     <Button className="w-full" onClick={() => handleUpdateStatus("ACCEPTED")}>Accept Booking</Button>
                   </>
                 )}
                 {booking.status === "CONFIRMED" && (
                   <Button className="w-full" onClick={() => handleUpdateStatus("EVENT_COMPLETED")}>Mark Event Completed</Button>
                 )}
               </>
             ) : (
               <>
                 {booking.status === "ACCEPTED" && booking.payment_status === "UNPAID" && (
                   <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handlePayment("ADVANCE_PAID")}>Pay Advance (Razorpay)</Button>
                 )}
                 {booking.status === "EVENT_COMPLETED" && booking.payment_status === "ADVANCE_PAID" && (
                   <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handlePayment("FULLY_PAID")}>Pay Final Balance</Button>
                 )}
               </>
             )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
