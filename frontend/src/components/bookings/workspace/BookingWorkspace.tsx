"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingRequestDetail } from "@/types/booking";
import { AvailabilityData } from "@/types/artist";
import { bookingService } from "@/services/bookingService";
import { artistService } from "@/services/artistService";
import { bandService } from "@/services/band";
import type { Booking } from "@/types/band";
import { BookingInboxTab } from "./BookingInboxTab";
import { EventCalendarTab } from "./EventCalendarTab";
import { BookingHistoryTab } from "./BookingHistoryTab";
import { BookingRequestForm } from "@/components/bookings/BookingRequestForm";
import { Button } from "@/components/ui/button";
import { RefreshCw, Inbox, CalendarDays, History, Calendar, Plus } from "lucide-react";
import toast from "react-hot-toast";

/** Normalize a raw Band booking into the BookingRequestDetail shape the workspace tabs expect */
function normalizeBandBooking(b: Booking): BookingRequestDetail {
  return {
    id: b.id,
    event_name: `Booking #${b.id.slice(-6).toUpperCase()}`,
    event_date: b.event_date,
    start_time: b.event_time,
    end_time: b.event_time,
    proposed_price: b.total_amount,
    counter_price: null,
    status: b.status.toLowerCase() as BookingRequestDetail["status"],
    location: "",
    notes: b.message || null,
    client: { id: b.customer_id, name: (b as any).customer_name || "Client", email: (b as any).customer_email || "" },
    artist: null,
    venue: null,
    timeline: [],
    booking_notes: [],
    timeline_events: [],
    created_at: b.created_at,
    updated_at: b.updated_at,
  };
}

interface BookingWorkspaceProps {
  role: "client" | "artist" | "venue" | "admin";
}

type PrimaryTab = "inbox" | "calendar" | "history";

export function BookingWorkspace({ role }: BookingWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = React.useState<PrimaryTab>("inbox");
  const [bookings, setBookings] = React.useState<BookingRequestDetail[]>([]);
  const [availability, setAvailability] = React.useState<AvailabilityData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [showBookingForm, setShowBookingForm] = React.useState<boolean>(false);
  const [bookingFormType, setBookingFormType] = React.useState<"booking" | "venue">("booking");
  const [bookingIntent, setBookingIntent] = React.useState<{
    venueId?: string;
    venueName?: string;
    artistProfileId?: string;
    artistName?: string;
    proposedPrice?: number;
  } | null>(null);

  // Check for pending booking intent from sessionStorage after login
  React.useEffect(() => {
    if ((role === "client" || role === "artist") && typeof window !== "undefined") {
      const intentStr = sessionStorage.getItem("active_booking_intent");
      if (intentStr) {
        try {
          const intent = JSON.parse(intentStr);
          setBookingIntent(intent);
          setBookingFormType(role === "artist" && intent?.venueId ? "venue" : "booking");
          setShowBookingForm(true);
          sessionStorage.removeItem("active_booking_intent");
        } catch (_e) {
          // Invalid JSON, ignore
        }
      }
    }
  }, [role]);

  // Sync with URL query parameter
  React.useEffect(() => {
    const tabParam = searchParams.get("tab") as PrimaryTab | null;
    if (tabParam && ["inbox", "calendar", "history"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: PrimaryTab) => {
    setActiveTab(tab);
    const path =
      role === "admin"
        ? `/admin/bookings?tab=${tab}`
        : `/band/${role}/bookings?tab=${tab}`;
    router.push(path, { scroll: false });
  };

  const fetchBookings = React.useCallback(async () => {
    setLoading(true);
    try {
      if (role === "client") {
        // Client bookings from the band service
        const raw = await bandService.getMyBookings("customer");
        setBookings(Array.isArray(raw) ? raw.map(normalizeBandBooking) : []);
      } else if (role === "admin") {
        const res = await bookingService.adminGetBookings({ limit: 100 });
        setBookings(res.bookings || []);
      } else {
        // Artist or Venue — bookings where they are the provider
        const raw = await bandService.getMyBookings("provider");
        setBookings(Array.isArray(raw) ? raw.map(normalizeBandBooking) : []);
      }
    } catch {
      toast.error("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  const fetchAvailability = React.useCallback(async () => {
    if (role !== "artist") return;
    try {
      const data = await artistService.getAvailability();
      setAvailability(data);
    } catch {
      // ignore
    }
  }, [role]);

  const reloadAll = React.useCallback(async () => {
    await Promise.all([fetchBookings(), fetchAvailability()]);
  }, [fetchBookings, fetchAvailability]);

  React.useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  const handleSaveAvailability = async (updated: AvailabilityData) => {
    try {
      const data = await artistService.updateAvailability(updated);
      setAvailability(data);
      toast.success("Calendar availability updated!");
    } catch {
      toast.error("Failed to update availability schedule.");
      throw new Error();
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Booking Workspace
          </h1>
          <p className="text-xs text-zinc-300 font-medium">
            Manage inquiries, workflow transitions, event schedules, and booking history.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <Button
            onClick={() => {
              setBookingFormType("booking");
              setShowBookingForm(true);
            }}
            size="sm"
            className="bg-white hover:bg-zinc-200 text-black font-black text-xs h-9 gap-1.5 cursor-pointer shadow-md rounded-xl"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Create Booking</span>
          </Button>

          {role === "artist" && (
            <Button
              onClick={() => {
                setBookingFormType("venue");
                setShowBookingForm(true);
              }}
              size="sm"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer shadow-md rounded-xl border border-zinc-700"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Book a Venue</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={reloadAll}
            className="flex items-center gap-1.5 text-xs h-9 cursor-pointer border-zinc-700 bg-zinc-900 text-zinc-100 hover:text-white hover:bg-zinc-800 font-bold rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload Workspace</span>
          </Button>
        </div>
      </div>

      {/* Primary Workspace Tabs Bar */}
      <div className="border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "inbox" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("inbox")}
            className={`text-xs font-bold gap-2 px-4 h-9 rounded-xl transition-all border ${
              activeTab === "inbox"
                ? "bg-white text-black border-white shadow-md font-black hover:bg-zinc-100"
                : "bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:text-white hover:bg-zinc-800 hover:border-zinc-700"
            }`}
          >
            <Inbox className="h-4 w-4" />
            <span>Booking Inbox</span>
          </Button>

          <Button
            variant={activeTab === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("calendar")}
            className={`text-xs font-bold gap-2 px-4 h-9 rounded-xl transition-all border ${
              activeTab === "calendar"
                ? "bg-white text-black border-white shadow-md font-black hover:bg-zinc-100"
                : "bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:text-white hover:bg-zinc-800 hover:border-zinc-700"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Event Calendar</span>
          </Button>

          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("history")}
            className={`text-xs font-bold gap-2 px-4 h-9 rounded-xl transition-all border ${
              activeTab === "history"
                ? "bg-white text-black border-white shadow-md font-black hover:bg-zinc-100"
                : "bg-zinc-900/90 text-zinc-200 border-zinc-800 hover:text-white hover:bg-zinc-800 hover:border-zinc-700"
            }`}
          >
            <History className="h-4 w-4" />
            <span>Booking History</span>
          </Button>
        </div>
      </div>

      {/* Primary Tab Content Viewports */}
      {activeTab === "inbox" && (
        <BookingInboxTab role={role} bookings={bookings} loading={loading} onRefresh={reloadAll} />
      )}

      {activeTab === "calendar" && (
        <EventCalendarTab
          role={role}
          bookings={bookings}
          availability={availability}
          loading={loading}
          onSaveAvailability={handleSaveAvailability}
          onRefresh={reloadAll}
        />
      )}

      {activeTab === "history" && (
        <BookingHistoryTab
          role={role}
          bookings={bookings}
          loading={loading}
          onRefresh={reloadAll}
        />
      )}

      {/* Booking Request Form Modal */}
      {showBookingForm && (role === "client" || role === "artist" || role === "venue") && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto p-4 sm:p-6 md:p-8 flex justify-center items-start">
          <div className="w-full max-w-2xl my-4 sm:my-8 relative">
            <BookingRequestForm
              artistProfileId={bookingIntent?.artistProfileId}
              artistName={bookingIntent?.artistName}
              venueId={bookingIntent?.venueId}
              venueName={bookingIntent?.venueName}
              proposedPrice={bookingIntent?.proposedPrice}
              isArtistBookingVenue={role === "artist" && bookingFormType === "venue"}
              isVenueBookingTalent={role === "venue"}
              onSuccess={() => {
                toast.success(
                  role === "artist" ? "Venue booking request created!" : "Booking request created!",
                );
                setShowBookingForm(false);
                setBookingIntent(null);
                reloadAll();
              }}
              onCancel={() => {
                setShowBookingForm(false);
                setBookingIntent(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
