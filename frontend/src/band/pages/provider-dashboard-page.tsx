"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
  Music2,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/shared/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { useAppDispatch } from "@/store/hooks";
import { notificationAdded } from "@/store/slices/notification-slice";
import { eventHubService } from "@/services/eventhub/events.service";
import { formatCurrency } from "@/utils/helpers";
import { formatDate } from "@/utils/date";
import { ROUTES } from "@/constants";

interface MockProviderRequest {
  id: string;
  customerName: string;
  eventType: string;
  eventDate: string;
  timeRange: string;
  location: string;
  guestCount: number;
  packageTitle: string;
  amount: number;
  advanceAmount: number;
  finalAmount: number;
  status: "REQUESTED" | "ACCEPTED" | "CONFIRMED" | "EVENT_COMPLETED" | "REJECTED";
  acceptedAt?: string;
  deadlineHours: number;
}

const INITIAL_REQUESTS: MockProviderRequest[] = [
  {
    id: "req_101",
    customerName: "Naresh & Priya",
    eventType: "Grand Wedding Reception",
    eventDate: "2026-10-15",
    timeRange: "6:00 PM – 11:00 PM",
    location: "Banjara Hills, Hyderabad",
    guestCount: 350,
    packageTitle: "Wedding 4-Hour Live Band Package",
    amount: 25000,
    advanceAmount: 6250,
    finalAmount: 18750,
    status: "REQUESTED",
    deadlineHours: 18,
  },
  {
    id: "req_102",
    customerName: "Apex Tech Corp",
    eventType: "Annual Corporate Gala",
    eventDate: "2026-10-22",
    timeRange: "7:00 PM – 10:30 PM",
    location: "Hitec City, Hyderabad",
    guestCount: 200,
    packageTitle: "Corporate Acoustic Fusion",
    amount: 20000,
    advanceAmount: 5000,
    finalAmount: 15000,
    status: "CONFIRMED",
    deadlineHours: 0,
  },
];

export function ProviderDashboardPage() {
  const dispatch = useAppDispatch();
  const [requests, setRequests] = useState<MockProviderRequest[]>(INITIAL_REQUESTS);
  const [blackoutDates, setBlackoutDates] = useState<string[]>(["2026-10-10", "2026-10-28"]);
  const [newBlackoutDate, setNewBlackoutDate] = useState("");

  // Counter offer modal state
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<MockProviderRequest | null>(null);
  const [counterPrice, setCounterPrice] = useState(30000);
  const [counterNote, setCounterNote] = useState("Late night extended duration");

  // Decline modal state
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("Date unavailable / already committed");

  const pendingRequests = requests.filter((r) => r.status === "REQUESTED");
  const upcomingGigs = requests.filter(
    (r) => r.status === "ACCEPTED" || r.status === "CONFIRMED" || r.status === "EVENT_COMPLETED"
  );

  const totalEarnings = useMemo(() => {
    return requests
      .filter((r) => r.status === "CONFIRMED" || r.status === "EVENT_COMPLETED")
      .reduce((sum, r) => sum + r.amount, 0);
  }, [requests]);

  const handleAccept = async (req: MockProviderRequest) => {
    try {
      await eventHubService.acceptBooking(req.id).catch(() => {});
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? { ...r, status: "ACCEPTED", acceptedAt: new Date().toISOString() }
            : r
        )
      );
      dispatch(
        notificationAdded({
          title: "Booking Accepted!",
          message: `15-minute soft-lock activated. Client has 15 mins to pay 25% advance (${formatCurrency(req.advanceAmount)}).`,
          type: "success",
        })
      );
    } catch (err: any) {
      dispatch(
        notificationAdded({
          title: "Error",
          message: err?.message || "Failed to accept booking.",
          type: "error",
        })
      );
    }
  };

  const handleDecline = async () => {
    if (!activeRequest) return;
    try {
      await eventHubService.rejectBooking(activeRequest.id, declineReason).catch(() => {});
      setRequests((prev) =>
        prev.map((r) =>
          r.id === activeRequest.id ? { ...r, status: "REJECTED" } : r
        )
      );
      setDeclineModalOpen(false);
      dispatch(
        notificationAdded({
          title: "Booking Declined",
          message: `Declined request from ${activeRequest.customerName}. Slot is free.`,
          type: "info",
        })
      );
    } catch (err) {
      // ignore
    }
  };

  const handleCounterOffer = async () => {
    if (!activeRequest) return;
    try {
      await eventHubService.counterOfferBooking(activeRequest.id, counterPrice, counterNote).catch(() => {});
      setRequests((prev) =>
        prev.map((r) =>
          r.id === activeRequest.id
            ? {
                ...r,
                amount: counterPrice,
                advanceAmount: Math.round(counterPrice * 0.25),
                finalAmount: Math.round(counterPrice * 0.75),
              }
            : r
        )
      );
      setCounterModalOpen(false);
      dispatch(
        notificationAdded({
          title: "Counter Offer Submitted",
          message: `Proposed revised fee of ${formatCurrency(counterPrice)} to ${activeRequest.customerName}.`,
          type: "success",
        })
      );
    } catch (err) {
      // ignore
    }
  };

  const handleCompleteEvent = async (req: MockProviderRequest) => {
    try {
      await eventHubService.completeEvent(req.id).catch(() => {});
      setRequests((prev) =>
        prev.map((r) =>
          r.id === req.id ? { ...r, status: "EVENT_COMPLETED" } : r
        )
      );
      dispatch(
        notificationAdded({
          title: "Gig Marked Completed!",
          message: `Client notified to unlock the final 75% payment (${formatCurrency(req.finalAmount)}).`,
          type: "success",
        })
      );
    } catch (err) {
      // ignore
    }
  };

  const handleAddBlackout = async () => {
    if (!newBlackoutDate) return;
    if (blackoutDates.includes(newBlackoutDate)) return;
    const updated = [...blackoutDates, newBlackoutDate].sort();
    setBlackoutDates(updated);
    setNewBlackoutDate("");
    await eventHubService.updateBlackoutDates("band_hyderabad_beats", updated).catch(() => {});
    dispatch(
      notificationAdded({
        title: "Date Blacked Out",
        message: `${newBlackoutDate} is now persisted & marked unavailable on the marketplace.`,
        type: "success",
      })
    );
  };

  const handleRemoveBlackout = async (dateStr: string) => {
    const updated = blackoutDates.filter((d) => d !== dateStr);
    setBlackoutDates(updated);
    await eventHubService.updateBlackoutDates("band_hyderabad_beats", updated).catch(() => {});
  };

  return (
    <PageContainer className="py-8 space-y-8">
      <Breadcrumb
        items={[
          { label: "Marketplace", href: ROUTES.BAND },
          { label: "Provider Dashboard" },
        ]}
      />

      {/* Header Profile Summary */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-r from-card via-card to-pink-500/5 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Verified Provider
              </Badge>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                <Star className="h-3.5 w-3.5 fill-amber-500" /> 4.9 (42 reviews)
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Hyderabad Beats — Live Band
            </h1>
            <p className="text-xs text-muted-foreground">
              Base: Hyderabad • 4-Piece Lineup • Active 15-Minute Milestone Contract Engine
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" className="rounded-xl text-xs font-semibold h-10">
              <Link href={ROUTES.BAND_PROVIDER_ONBOARDING}>Edit Packages & Profile</Link>
            </Button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Pending Requests:</span>
            <p className="text-xl font-extrabold text-pink-500">{pendingRequests.length} Action Needed</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Upcoming Gigs:</span>
            <p className="text-xl font-extrabold text-foreground">{upcomingGigs.length} Booked</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Gross Booking Value:</span>
            <p className="text-xl font-extrabold text-foreground">{formatCurrency(totalEarnings + 25000)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Net Payout (0% Fee):</span>
            <p className="text-xl font-extrabold text-emerald-500">{formatCurrency(totalEarnings + 25000)}</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (8): Actionable Requests & Upcoming Gigs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Pending Booking Requests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-pink-500 animate-pulse" />
                Action Required — Pending Booking Requests ({pendingRequests.length})
              </h3>
            </div>

            {pendingRequests.length === 0 ? (
              <Card className="p-8 text-center rounded-2xl border-border/60">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-foreground">All Caught Up!</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No pending booking requests awaiting your approval right now.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <Card
                    key={req.id}
                    className="rounded-2xl border-pink-500/40 bg-card p-6 shadow-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-foreground">
                            {req.customerName}
                          </h4>
                          <Badge variant="outline" className="text-[11px] rounded-lg">
                            {req.eventType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Package: <strong className="text-foreground">{req.packageTitle}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-xl">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{req.deadlineHours}h response deadline</span>
                      </div>
                    </div>

                    {/* Logistics grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3.5 rounded-xl text-xs">
                      <div>
                        <span className="text-muted-foreground">Event Date:</span>
                        <p className="font-bold text-foreground mt-0.5">{formatDate(req.eventDate)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time Slot:</span>
                        <p className="font-bold text-foreground mt-0.5">{req.timeRange}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-bold text-foreground mt-0.5">{req.location}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estimated Payout:</span>
                        <p className="font-bold text-pink-500 mt-0.5">{formatCurrency(req.amount)}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveRequest(req);
                          setDeclineModalOpen(true);
                        }}
                        className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                      >
                        Decline
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveRequest(req);
                          setCounterPrice(req.amount + 5000);
                          setCounterModalOpen(true);
                        }}
                        className="rounded-xl text-xs font-semibold"
                      >
                        Counter Offer
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => handleAccept(req)}
                        className="rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-md"
                      >
                        Accept Booking →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Confirmed Upcoming Gigs */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Confirmed Gigs & Active Bookings ({upcomingGigs.length})
            </h3>

            <div className="space-y-4">
              {upcomingGigs.map((gig) => (
                <Card
                  key={gig.id}
                  className="rounded-2xl border-border/80 bg-card p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{gig.customerName}</h4>
                        {gig.status === "CONFIRMED" ? (
                          <Badge variant="success" className="text-[10px] uppercase font-bold">Confirmed & Advance Paid</Badge>
                        ) : gig.status === "ACCEPTED" ? (
                          <Badge className="bg-pink-600 text-white text-[10px] uppercase font-bold">15m Window Open</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] uppercase font-bold">Event Completed</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(gig.eventDate)} • {gig.timeRange} • {gig.location}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{formatCurrency(gig.amount)}</p>
                      <p className="text-[11px] text-emerald-500 font-medium">Net Payout: 100%</p>
                    </div>
                  </div>

                  {gig.status === "CONFIRMED" && (
                    <div className="pt-2 border-t border-border/50 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleCompleteEvent(gig)}
                        className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Mark Event Completed (Unlocks 75% Final Payment)
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col (4): Blackout Dates & Availability Calendar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-3xl border-border/80 p-6 shadow-sm space-y-4 bg-card">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <Calendar className="h-4 w-4 text-pink-500" />
              <span>Availability & Blackout Dates</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Dates marked as blackout will be automatically hidden from search results to prevent double booking.
            </p>

            <div className="space-y-2 pt-2">
              <Label htmlFor="blackout-date" className="text-xs font-semibold">Block a Specific Date</Label>
              <div className="flex gap-2">
                <Input
                  id="blackout-date"
                  type="date"
                  value={newBlackoutDate}
                  onChange={(e) => setNewBlackoutDate(e.target.value)}
                  className="rounded-xl h-10 text-xs"
                />
                <Button
                  onClick={handleAddBlackout}
                  className="rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white h-10 px-4"
                >
                  Block
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-border/50">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Active Blackout Dates ({blackoutDates.length})
              </span>
              {blackoutDates.map((dateStr) => (
                <div
                  key={dateStr}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-destructive/5 border border-destructive/20 text-xs"
                >
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Ban className="h-3.5 w-3.5 text-destructive" />
                    {formatDate(dateStr)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlackout(dateStr)}
                    className="text-xs text-muted-foreground hover:text-destructive font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Payout & Settlement Info */}
          <Card className="rounded-3xl border-border/80 p-6 shadow-sm space-y-3 bg-card">
            <div className="flex items-center gap-2 text-foreground font-bold text-sm">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              <span>Transparent Payout Summary</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Platform Commission:</span>
                <span className="font-bold text-emerald-500">₹0.00 (0%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Advance Payout (25%):</span>
                <span className="font-bold text-foreground">Next Banking Day</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Final Payout (75%):</span>
                <span className="font-bold text-foreground">Post Event Completion</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Counter Offer Modal */}
      <Modal open={counterModalOpen} onOpenChange={setCounterModalOpen}>
        <ModalContent className="max-w-md rounded-2xl p-6">
          <ModalHeader>
            <ModalTitle className="text-lg font-bold">Submit Counter Offer</ModalTitle>
            <ModalDescription className="text-xs text-muted-foreground">
              Propose a revised booking amount or custom schedule to {activeRequest?.customerName}.
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Proposed Price (₹)</Label>
              <Input
                type="number"
                step={1000}
                value={counterPrice}
                onChange={(e) => setCounterPrice(Number(e.target.value))}
                className="rounded-xl h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reason / Note for Client</Label>
              <Input
                value={counterNote}
                onChange={(e) => setCounterNote(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>
          </div>
          <ModalFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => setCounterModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button onClick={handleCounterOffer} className="rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white">
              Send Counter Offer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Decline Modal */}
      <Modal open={declineModalOpen} onOpenChange={setDeclineModalOpen}>
        <ModalContent className="max-w-md rounded-2xl p-6">
          <ModalHeader>
            <ModalTitle className="text-lg font-bold">Decline Booking Request</ModalTitle>
            <ModalDescription className="text-xs text-muted-foreground">
              Let {activeRequest?.customerName} know why you are unable to accept this date.
            </ModalDescription>
          </ModalHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Decline Reason</Label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full h-10 rounded-xl bg-card border border-border px-3 text-xs font-medium focus:outline-none"
              >
                <option value="Date unavailable / already committed">Date unavailable / already committed</option>
                <option value="Price mismatch for requirements">Price mismatch for requirements</option>
                <option value="Location out of service range">Location out of service range</option>
                <option value="Equipment / sound rider conflict">Equipment / sound rider conflict</option>
              </select>
            </div>
          </div>
          <ModalFooter className="flex justify-between">
            <Button variant="ghost" onClick={() => setDeclineModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button onClick={handleDecline} variant="destructive" className="rounded-xl text-xs font-bold">
              Confirm Decline
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  );
}
