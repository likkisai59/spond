"use client";

import * as React from "react";
import { AvailabilityData } from "@/types/artist";
import { BookingRequestDetail } from "@/types/booking";
import { AvailabilityCalendar } from "@/components/artist/calendar/AvailabilityCalendar";
import { AvailabilityWeekly } from "@/components/artist/calendar/AvailabilityWeekly";
import { ConflictChecker } from "@/components/artist/calendar/ConflictChecker";
import { BookingCalendar } from "@/components/bookings/BookingCalendar";
import { BookingDetailsDialog } from "@/components/bookings/BookingDetailsDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays, Calendar, Clock, Lock, CheckCircle2, User } from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";

interface EventCalendarTabProps {
  role: "client" | "artist" | "venue" | "admin";
  bookings: BookingRequestDetail[];
  availability: AvailabilityData | null;
  loading: boolean;
  onSaveAvailability: (updated: AvailabilityData) => Promise<void>;
  onRefresh: () => void;
}

type CalendarSubTab = "calendar" | "availability" | "schedule" | "blocked" | "confirmed";

export function EventCalendarTab({
  role,
  bookings,
  availability,
  loading,
  onSaveAvailability,
  onRefresh,
}: EventCalendarTabProps) {
  const [subTab, setSubTab] = React.useState<CalendarSubTab>("calendar");
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null);

  const handleCloseDialog = React.useCallback(() => {
    setSelectedBookingId(null);
  }, []);

  const confirmedBookings = React.useMemo(() => {
    return bookings.filter((b) =>
      ["accepted", "confirmed", "completed"].includes(b.status.toLowerCase())
    );
  }, [bookings]);

  if (loading && !availability) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading event calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#121010] p-3 rounded-xl border border-[#222] shadow-xl">
        <Button
          variant={subTab === "calendar" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSubTab("calendar")}
          className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
            subTab === "calendar"
              ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
              : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Calendar</span>
        </Button>

        {role === "artist" && availability && (
          <>
            <Button
              variant={subTab === "availability" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSubTab("availability")}
              className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
                subTab === "availability"
                  ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Availability</span>
            </Button>

            <Button
              variant={subTab === "schedule" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSubTab("schedule")}
              className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
                subTab === "schedule"
                  ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Slots & Schedule</span>
            </Button>

            <Button
              variant={subTab === "blocked" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSubTab("blocked")}
              className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
                subTab === "blocked"
                  ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Blocked Dates</span>
            </Button>
          </>
        )}

        <Button
          variant={subTab === "confirmed" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSubTab("confirmed")}
          className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
            subTab === "confirmed"
              ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
              : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Confirmed Events</span>
          <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 font-extrabold ${
            subTab === "confirmed"
              ? "bg-white text-black"
              : "bg-[#222] text-gray-400 border border-[#333]"
          }`}>
            {confirmedBookings.length}
          </Badge>
        </Button>
      </div>

      {/* Sub-tab 1: Monthly Calendar Grid */}
      {subTab === "calendar" && (
        <BookingCalendar
          bookings={bookings}
          onSelectBooking={(b) => setSelectedBookingId(b.id)}
        />
      )}

      {/* Sub-tab 2: Availability */}
      {subTab === "availability" && availability && (
        <AvailabilityCalendar
          availability={availability}
          confirmedGigs={confirmedBookings.map(b => b.event_date)}
          onSave={onSaveAvailability}
        />
      )}

      {/* Sub-tab 3: Slots & Schedule */}
      {subTab === "schedule" && availability && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AvailabilityWeekly
            availability={availability}
            onSave={onSaveAvailability}
          />
          <ConflictChecker />
        </div>
      )}

      {/* Sub-tab 4: Blocked Dates */}
      {subTab === "blocked" && availability && (
        <div className="space-y-6">
          <ConflictChecker />
          <AvailabilityCalendar
            availability={availability}
            confirmedGigs={confirmedBookings.map(b => b.event_date)}
            onSave={onSaveAvailability}
          />
        </div>
      )}

      {/* Sub-tab 5: Confirmed Events */}
      {subTab === "confirmed" && (
        <div className="space-y-4">
          {confirmedBookings.length === 0 ? (
            <Card className="bg-[#121010] border-[#222] p-12 text-center rounded-xl shadow-lg">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-[#333] opacity-70" />
              <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">No confirmed events</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                You have no upcoming accepted or confirmed event performance bookings.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {confirmedBookings.map((b) => (
                <Card
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className="bg-[#161212] hover:bg-[#1a1414] border border-[#333] hover:border-[#f03e65] transition-all cursor-pointer shadow-xl flex flex-col justify-between rounded-xl group"
                >
                  <CardHeader className="p-5 pb-3 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-xs font-bold text-white uppercase tracking-wider line-clamp-1 group-hover:text-[#f03e65] transition-colors">
                        {b.event_name}
                      </CardTitle>
                      <Badge variant="default" className="text-[10px] uppercase font-bold bg-[#f03e65]">
                        {b.status}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-2 font-bold uppercase tracking-wider">
                      <User className="h-3.5 w-3.5 text-[#f03e65] shrink-0" />
                      <span>
                        {role === "client"
                          ? b.artist?.display_name || b.artist_name || "Performer"
                          : b.client?.name || "Client"}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-3 space-y-3 text-xs text-gray-400">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5 text-[#f03e65] shrink-0" />
                      <span>{formatDate(b.event_date)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#333]">
                      <span className="text-xs font-extrabold text-[#f03e65]">
                        {formatCurrency(b.proposed_price)}
                      </span>
                      <span className="text-[9px] text-[#444] font-mono">
                        Ref: {b.id.slice(0, 8)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inspector Dialog */}
      {selectedBookingId && (
        <BookingDetailsDialog
          bookingId={selectedBookingId}
          isOpen={!!selectedBookingId}
          onClose={handleCloseDialog}
          onRefresh={onRefresh}
          role={role}
        />
      )}
    </div>
  );
}
