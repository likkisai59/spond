"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingRequestDetail } from "@/types/booking";
import { AvailabilityData } from "@/types/artist";
import { bookingService } from "@/services/bookingService";
import { artistService } from "@/services/artistService";
import { bandService } from "@/services/band";
import type { Booking } from "@/types/band";

/** Extended shape that the Band API may return alongside the base Booking fields */
interface RawBooking extends Booking {
  provider_name?: string;
  artist_name?: string;
  venue_name?: string;
  band_name?: string;
  customer_name?: string;
  customer_email?: string;
}
import { BookingInboxTab } from "./BookingInboxTab";
import { EventCalendarTab } from "./EventCalendarTab";
import { BookingHistoryTab } from "./BookingHistoryTab";
import { useAuth } from "@/hooks/use-auth";
import { BookingRequestForm } from "@/components/bookings/BookingRequestForm";
import { Button } from "@/components/ui/button";
import { RefreshCw, Inbox, CalendarDays, History, Calendar, Plus } from "lucide-react";
import toast from "react-hot-toast";

/** Normalize a raw Band booking into the BookingRequestDetail shape the workspace tabs expect */
function normalizeBandBooking(b: RawBooking): BookingRequestDetail {
  const pName =
    b.provider_name ||
    b.artist_name ||
    b.venue_name ||
    b.band_name ||
    "Performer";

  return {
    id: b.id,
    event_name: `Booking #${b.id.slice(-6).toUpperCase()}`,
    event_date: b.event_date,
    start_time: b.event_time,
    end_time: b.event_time,
    proposed_price: b.total_amount,
    counter_price: b.counter_price || null,
    status: b.status.toLowerCase() as BookingRequestDetail["status"],
    location: "",
    notes: b.message || null,
    client: {
      id: b.customer_id,
      name: b.customer_name || "Client",
      email: b.customer_email || ""
    },
    artist: { id: b.provider_id || "", display_name: pName, bio: null, base_rate: 0, rating: 0 },
    artist_name: pName,
    venue: null,
    timeline: [],
    booking_notes: [],
    timeline_events: [],
    created_at: b.created_at,
    updated_at: b.updated_at,
    payment_status: b.payment_status || "UNPAID",
    advance_amount: b.advance_amount || 0,
  };
}

interface BookingWorkspaceProps {
  role: "client" | "artist" | "venue" | "admin";
}

type PrimaryTab = "inbox" | "calendar" | "history";

export function BookingWorkspace({ role }: BookingWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

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
        } catch {
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
        // Artist or Venue — fetch bookings where they are the provider OR the customer
        const [rawProvider, rawCustomer] = await Promise.all([
          bandService.getMyBookings("provider").catch(() => []),
          bandService.getMyBookings("customer").catch(() => []),
        ]);
        
        const providerArr = Array.isArray(rawProvider) ? rawProvider : [];
        const customerArr = Array.isArray(rawCustomer) ? rawCustomer : [];
        
        // Combine and deduplicate by ID just in case
        const combinedMap = new Map();
        [...providerArr, ...customerArr].forEach(b => {
          if (b && b.id) combinedMap.set(b.id, b);
        });
        
        const combined = Array.from(combinedMap.values());
        setBookings(combined.map(normalizeBandBooking));
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
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f03e65] text-white">
              <Calendar className="h-4 w-4" />
            </div>
            Booking Workspace
          </h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5 font-bold">
            Manage inquiries, workflow transitions, event schedules, and booking history.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {role !== "artist" && (
            <Button
              onClick={() => {
                setBookingFormType("booking");
                setShowBookingForm(true);
              }}
              size="sm"
              className="bg-[#f03e65] hover:bg-[#d83558] text-white font-bold text-[10px] uppercase tracking-wider h-9 gap-1.5 cursor-pointer rounded shadow-md transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Booking</span>
            </Button>
          )}

          {role === "artist" && (
            <Button
              onClick={() => {
                setBookingFormType("venue");
                setShowBookingForm(true);
              }}
              size="sm"
              className="bg-[#f03e65] hover:bg-[#d83558] text-white font-bold text-[10px] uppercase tracking-wider h-9 gap-1.5 cursor-pointer rounded shadow-md transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Book a Venue</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={reloadAll}
            className="flex items-center gap-1.5 text-[10px] h-9 cursor-pointer border-[#333] bg-[#161212] text-gray-400 hover:text-white hover:bg-[#222] font-bold uppercase tracking-wider rounded transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Reload Workspace</span>
          </Button>
        </div>
      </div>

      {/* Primary Workspace Tabs Bar */}
      <div className="border-b border-[#222] pb-4 mt-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <Button
            variant={activeTab === "inbox" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("inbox")}
            className={`text-[10px] font-bold uppercase tracking-wider gap-2 px-6 h-10 rounded transition-all border ${
              activeTab === "inbox"
                ? "bg-[#f03e65] text-white border-[#f03e65] shadow-md hover:bg-[#d83558]"
                : "bg-[#121010] text-gray-400 border-[#333] hover:text-white hover:bg-[#1a1414] hover:border-[#444]"
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            <span>Booking Inbox</span>
          </Button>

          <Button
            variant={activeTab === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("calendar")}
            className={`text-[10px] font-bold uppercase tracking-wider gap-2 px-6 h-10 rounded transition-all border ${
              activeTab === "calendar"
                ? "bg-[#f03e65] text-white border-[#f03e65] shadow-md hover:bg-[#d83558]"
                : "bg-[#121010] text-gray-400 border-[#333] hover:text-white hover:bg-[#1a1414] hover:border-[#444]"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Event Calendar</span>
          </Button>

          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTabChange("history")}
            className={`text-[10px] font-bold uppercase tracking-wider gap-2 px-6 h-10 rounded transition-all border ${
              activeTab === "history"
                ? "bg-[#f03e65] text-white border-[#f03e65] shadow-md hover:bg-[#d83558]"
                : "bg-[#121010] text-gray-400 border-[#333] hover:text-white hover:bg-[#1a1414] hover:border-[#444]"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Booking History</span>
          </Button>
        </div>
      </div>

      {/* Primary Tab Content Viewports */}
      {activeTab === "inbox" && (
        <BookingInboxTab role={role} userId={user?.id} bookings={bookings} loading={loading} onRefresh={reloadAll} />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-start pt-4 sm:pt-8 overflow-hidden">
          <div className="w-full max-w-5xl relative max-h-[95vh] flex flex-col">
            <BookingRequestForm
              artistProfileId={bookingIntent?.artistProfileId}
              artistName={bookingIntent?.artistName}
              venueId={bookingIntent?.venueId}
              venueName={bookingIntent?.venueName}
              proposedPrice={bookingIntent?.proposedPrice}
              isArtistBookingVenue={role === "artist" || bookingFormType === "venue"}
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
