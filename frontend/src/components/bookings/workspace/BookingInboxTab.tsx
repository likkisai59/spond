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
  userId?: string;
  bookings: BookingRequestDetail[];
  loading: boolean;
  onRefresh: () => void;
}

type SubTab = "all" | "incoming" | "countered" | "pending" | "accepted" | "rejected";

export function BookingInboxTab({
  role,
  userId,
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
      const isOutgoing = userId ? b.client?.id === userId : false;
      
      let matchesTab = false;
      if (subTab === "all") {
        matchesTab = true; // show everything (client default)
      } else if (subTab === "incoming") {
        if (role === "client") {
          // For client, "Sent Requests" means all statuses — they sent it and want to track any state
          matchesTab = st === "requested" || st === "received" || st === "created";
        } else {
          const isIncoming = !isOutgoing;
          matchesTab = isIncoming && (st === "requested" || st === "received" || st === "created");
        }
      } else if (subTab === "countered") {
        matchesTab = st === "countered" || st === "counter_offered";
      } else if (subTab === "pending") {
        if (role !== "client" && isOutgoing && (st === "requested" || st === "received" || st === "created")) {
          matchesTab = true;
        } else {
          matchesTab = st.includes("pending") || st === "draft";
        }
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
  }, [activeBookings, subTab, search, role, userId]);

  const subTabCounts = React.useMemo(() => {
    return {
      all: activeBookings.length,
      incoming: activeBookings.filter((b) => {
        const st = b.status.toLowerCase();
        const isOutgoing = userId ? b.client?.id === userId : false;
        if (role === "client") return ["requested", "received", "created"].includes(st);
        return !isOutgoing && ["requested", "received", "created"].includes(st);
      }).length,
      countered: activeBookings.filter((b) =>
        ["countered", "counter_offered"].includes(b.status.toLowerCase())
      ).length,
      pending: activeBookings.filter((b) => {
        const st = b.status.toLowerCase();
        const isOutgoing = userId ? b.client?.id === userId : false;
        if (role !== "client" && isOutgoing && ["requested", "received", "created"].includes(st)) {
          return true;
        }
        return st.includes("pending") || st === "draft";
      }).length,
      accepted: activeBookings.filter((b) =>
        ["accepted", "confirmed"].includes(b.status.toLowerCase())
      ).length,
      rejected: activeBookings.filter((b) => b.status.toLowerCase() === "rejected").length,
    };
  }, [activeBookings, role, userId]);

  return (
    <div className="space-y-4">
      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121010] p-3 rounded-xl border border-[#222] shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          {role === "client" && (
            <Button
              variant={subTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSubTab("all")}
              className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
                subTab === "all"
                  ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
              }`}
            >
              <span>All Bookings</span>
              <Badge
                variant="secondary"
                className={`text-[9px] px-1.5 py-0 font-extrabold ${
                  subTab === "all"
                    ? "bg-white text-black"
                    : "bg-[#222] text-gray-400 border border-[#333]"
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
            className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
              subTab === "incoming"
                ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
            }`}
          >
            <span>{role === "client" ? "Sent Requests" : "Incoming Requests"}</span>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 font-extrabold ${
                subTab === "incoming"
                  ? "bg-white text-black"
                  : "bg-[#222] text-gray-400 border border-[#333]"
              }`}
            >
              {subTabCounts.incoming}
            </Badge>
          </Button>

          <Button
            variant={subTab === "countered" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubTab("countered")}
            className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
              subTab === "countered"
                ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
            }`}
          >
            <span>Counter Offers</span>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 font-extrabold ${
                subTab === "countered"
                  ? "bg-white text-black"
                  : "bg-[#222] text-gray-400 border border-[#333]"
              }`}
            >
              {subTabCounts.countered}
            </Badge>
          </Button>

          <Button
            variant={subTab === "pending" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubTab("pending")}
            className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
              subTab === "pending"
                ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
            }`}
          >
            <span>Pending</span>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 font-extrabold ${
                subTab === "pending"
                  ? "bg-white text-black"
                  : "bg-[#222] text-gray-400 border border-[#333]"
              }`}
            >
              {subTabCounts.pending}
            </Badge>
          </Button>

          <Button
            variant={subTab === "accepted" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubTab("accepted")}
            className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
              subTab === "accepted"
                ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
            }`}
          >
            <span>Accepted</span>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 font-extrabold ${
                subTab === "accepted"
                  ? "bg-white text-black"
                  : "bg-[#222] text-gray-400 border border-[#333]"
              }`}
            >
              {subTabCounts.accepted}
            </Badge>
          </Button>

          <Button
            variant={subTab === "rejected" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSubTab("rejected")}
            className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
              subTab === "rejected"
                ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
            }`}
          >
            <span>Rejected</span>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 font-extrabold ${
                subTab === "rejected"
                  ? "bg-white text-black"
                  : "bg-[#222] text-gray-400 border border-[#333]"
              }`}
            >
              {subTabCounts.rejected}
            </Badge>
          </Button>
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <Input
            placeholder="Search active requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-[#161212] border-[#333] text-white placeholder:text-gray-500 rounded focus-visible:ring-[#f03e65] focus-visible:border-[#f03e65]"
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="h-8 w-8 text-[#f03e65]" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest animate-pulse font-bold">Loading active inbox...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="bg-[#121010] border-[#222] p-12 text-center rounded-xl shadow-lg">
          <Inbox className="h-10 w-10 mx-auto mb-3 text-[#333] opacity-70" />
          <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">
            {role === "client" ? "No bookings sent" : "No requests found"}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {role === "client"
              ? "You haven't requested any active bookings yet."
              : "No active booking requests match the current tab filter or search query."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((b) => (
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
                  <BookingStatusBadge status={b.status} />
                </div>
                <div className="text-[10px] text-gray-400 flex items-center gap-2 font-bold uppercase tracking-wider">
                  <User className="h-3.5 w-3.5 text-[#f03e65] shrink-0" />
                  <span className="truncate">
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
