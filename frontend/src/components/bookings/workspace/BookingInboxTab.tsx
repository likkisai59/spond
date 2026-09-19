"use client";

import * as React from "react";
import { BookingRequestDetail } from "@/types/booking";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { BookingStatusBadge } from "../BookingStatusBadge";
import { BookingDetailsDialog } from "../BookingDetailsDialog";
import {
  Search,
  Calendar,
  User,
  Inbox,
} from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";

interface BookingInboxTabProps {
  role: "client" | "artist" | "venue" | "admin";
  bookings: BookingRequestDetail[];
  loading: boolean;
  onRefresh: () => void;
}

type SubTab = "all" | "incoming" | "countered" | "pending" | "accepted" | "rejected";

export function BookingInboxTab({
  role,
  bookings,
  loading,
  onRefresh,
}: BookingInboxTabProps) {
  // Clients default to "all" so they can always see provider responses (accepted/rejected)
  const [subTab, setSubTab] = React.useState<SubTab>(role === "client" ? "all" : "incoming");
  const [search, setSearch] = React.useState("");
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null);

  // Active non-historical statuses
  const activeBookings = React.useMemo(() => {
    return bookings.filter(
      (b) => !["completed", "cancelled", "expired"].includes(b.status.toLowerCase())
    );
  }, [bookings]);

  const filteredBookings = React.useMemo(() => {
    return activeBookings.filter((b) => {
      // Subtab filter
      const st = b.status.toLowerCase();
      let matchesTab = false;
      if (subTab === "all") {
        matchesTab = true; // show everything (client default)
      } else if (subTab === "incoming") {
        if (role === "client") {
          // For client, "Sent Requests" means all statuses — they sent it and want to track any state
          matchesTab = st === "requested" || st === "received" || st === "created";
        } else {
          matchesTab = st === "requested" || st === "received" || st === "created";
        }
      } else if (subTab === "countered") {
        matchesTab = st === "countered" || st === "counter_offered";
      } else if (subTab === "pending") {
        matchesTab = st.includes("pending") || st === "draft";
      } else if (subTab === "accepted") {
        matchesTab = st === "accepted" || st === "confirmed";
      } else if (subTab === "rejected") {
        matchesTab = st === "rejected";
      }

      // Search filter
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.event_name.toLowerCase().includes(q) ||
        (b.client?.name && b.client.name.toLowerCase().includes(q)) ||
        (b.artist?.display_name && b.artist.display_name.toLowerCase().includes(q)) ||
        (b.artist_name && b.artist_name.toLowerCase().includes(q)) ||
        b.id.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [activeBookings, subTab, search, role]);

  const subTabCounts = React.useMemo(() => {
    return {
      all: activeBookings.length,
      incoming: activeBookings.filter((b) =>
        ["requested", "received", "created"].includes(b.status.toLowerCase())
      ).length,
      countered: activeBookings.filter((b) =>
        ["countered", "counter_offered"].includes(b.status.toLowerCase())
      ).length,
      pending: activeBookings.filter((b) =>
        b.status.toLowerCase().includes("pending") || b.status.toLowerCase() === "draft"
      ).length,
      accepted: activeBookings.filter((b) =>
        ["accepted", "confirmed"].includes(b.status.toLowerCase())
      ).length,
      rejected: activeBookings.filter((b) => b.status.toLowerCase() === "rejected").length,
    };
  }, [activeBookings]);

  return (
    <div className="space-y-4">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-2.5 rounded-2xl border border-zinc-800 shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* "All" tab — shown for client role so they never miss a provider response */}
          {role === "client" && (
            <Button
              variant={subTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSubTab("all")}
              className={`text-xs h-8 font-bold gap-1.5 rounded-xl transition-all ${
                subTab === "all"
                  ? "bg-white text-black font-extrabold shadow hover:bg-zinc-100"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
              }`}
            >
              <span>All Bookings</span>
              <Badge
                variant="secondary"
                className={`text-[10px] px-1.5 py-0 font-extrabold ${
                  subTab === "all"
                    ? "bg-black text-white"
                    : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                }`}
              >
                {subTabCounts.all}
              </Badge>
            </Button>
          )}

          <Button
            variant={subTab === "incoming" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubTab("incoming")}
            className={`text-xs h-8 font-bold gap-1.5 rounded-xl transition-all ${
              subTab === "incoming"
                ? "bg-white text-black font-extrabold shadow hover:bg-zinc-100"
                : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
            }`}
          >
            <span>{role === "client" ? "Pending" : "Incoming Requests"}</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 font-extrabold ${
                subTab === "incoming"
                  ? "bg-black text-white"
                  : "bg-zinc-800 text-zinc-200 border border-zinc-700"
              }`}
            >
              {subTabCounts.incoming}
            </Badge>
          </Button>

          <Button
            variant={subTab === "countered" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubTab("countered")}
            className={`text-xs h-8 font-bold gap-1.5 rounded-xl transition-all ${
              subTab === "countered"
                ? "bg-white text-black font-extrabold shadow hover:bg-zinc-100"
                : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
            }`}
          >
            <span>Counter Offers</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 font-extrabold ${
                subTab === "countered"
                  ? "bg-black text-white"
                  : "bg-zinc-800 text-zinc-200 border border-zinc-700"
              }`}
            >
              {subTabCounts.countered}
            </Badge>
          </Button>

          <Button
            variant={subTab === "pending" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubTab("pending")}
            className={`text-xs h-8 font-bold gap-1.5 rounded-xl transition-all ${
              subTab === "pending"
                ? "bg-white text-black font-extrabold shadow hover:bg-zinc-100"
                : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
            }`}
          >
            <span>Pending</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 font-extrabold ${
                subTab === "pending"
                  ? "bg-black text-white"
                  : "bg-zinc-800 text-zinc-200 border border-zinc-700"
              }`}
            >
              {subTabCounts.pending}
            </Badge>
          </Button>

          <Button
            variant={subTab === "accepted" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubTab("accepted")}
            className={`text-xs h-8 font-bold gap-1.5 rounded-xl transition-all ${
              subTab === "accepted"
                ? "bg-white text-black font-extrabold shadow hover:bg-zinc-100"
                : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
            }`}
          >
            <span>Accepted</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 font-extrabold ${
                subTab === "accepted"
                  ? "bg-black text-white"
                  : "bg-zinc-800 text-zinc-200 border border-zinc-700"
              }`}
            >
              {subTabCounts.accepted}
            </Badge>
          </Button>

          <Button
            variant={subTab === "rejected" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubTab("rejected")}
            className={`text-xs h-8 font-bold gap-1.5 rounded-xl transition-all ${
              subTab === "rejected"
                ? "bg-white text-black font-extrabold shadow hover:bg-zinc-100"
                : "text-zinc-300 hover:text-white hover:bg-zinc-800/80"
            }`}
          >
            <span>Rejected</span>
            <Badge
              variant="secondary"
              className={`text-[10px] px-1.5 py-0 font-extrabold ${
                subTab === "rejected"
                  ? "bg-black text-white"
                  : "bg-zinc-800 text-zinc-200 border border-zinc-700"
              }`}
            >
              {subTabCounts.rejected}
            </Badge>
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <Input
            placeholder="Search active requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-8 bg-black/60 border-zinc-700 text-white placeholder:text-zinc-400 rounded-xl focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-xs text-zinc-300 animate-pulse font-medium">Loading active inbox...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="bg-zinc-900/60 border-zinc-800 p-12 text-center rounded-2xl shadow-sm">
          <Inbox className="h-10 w-10 mx-auto mb-3 text-zinc-400 opacity-70" />
          <h3 className="text-sm font-bold text-white mb-1">
            {role === "client" ? "No bookings sent" : "No requests found"}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {role === "client"
              ? "You haven't requested any active bookings yet."
              : "No active booking requests match the current tab filter or search query."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((b) => (
            <Card
              key={b.id}
              onClick={() => setSelectedBookingId(b.id)}
              className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 hover:border-primary/60 transition-all cursor-pointer shadow-md flex flex-col justify-between rounded-2xl group"
            >
              <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xs font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {b.event_name}
                  </CardTitle>
                  <BookingStatusBadge status={b.status} />
                </div>
                <div className="text-[11px] text-zinc-300 flex items-center gap-1.5 font-medium">
                  <User className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {role === "client"
                      ? b.artist?.display_name || b.artist_name || "Performer"
                      : b.client?.name || "Client"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{formatDate(b.event_date)}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                  <span className="text-xs font-extrabold text-white">
                    {formatCurrency(b.proposed_price)}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    ID: {b.id.slice(0, 8)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      {selectedBookingId && (
        <BookingDetailsDialog
          bookingId={selectedBookingId}
          isOpen={!!selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onRefresh={onRefresh}
          role={role}
        />
      )}
    </div>
  );
}
