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
  History,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";

interface BookingHistoryTabProps {
  role: "client" | "artist" | "venue" | "admin";
  bookings: BookingRequestDetail[];
  loading: boolean;
  onRefresh: () => void;
}

type HistoryFilter = "all" | "completed" | "cancelled" | "expired";

export function BookingHistoryTab({
  role,
  bookings,
  loading,
  onRefresh,
}: BookingHistoryTabProps) {
  const [filter, setFilter] = React.useState<HistoryFilter>("all");
  const [search, setSearch] = React.useState("");
  const [selectedBookingId, setSelectedBookingId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const limit = 12;

  // Filter historical status items (completed, cancelled, expired)
  const historyBookings = React.useMemo(() => {
    return bookings.filter((b) =>
      ["completed", "cancelled", "expired"].includes(b.status.toLowerCase())
    );
  }, [bookings]);

  const filteredBookings = React.useMemo(() => {
    return historyBookings.filter((b) => {
      const st = b.status.toLowerCase();
      let matchesFilter = true;
      if (filter === "completed") matchesFilter = st === "completed";
      else if (filter === "cancelled") matchesFilter = st === "cancelled";
      else if (filter === "expired") matchesFilter = st === "expired";

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.event_name.toLowerCase().includes(q) ||
        (b.client?.name && b.client.name.toLowerCase().includes(q)) ||
        (b.artist?.display_name && b.artist.display_name.toLowerCase().includes(q)) ||
        (b.artist_name && b.artist_name.toLowerCase().includes(q)) ||
        b.id.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [historyBookings, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / limit));
  const paginatedBookings = React.useMemo(() => {
    const start = (page - 1) * limit;
    return filteredBookings.slice(start, start + limit);
  }, [filteredBookings, page, limit]);

  const counts = React.useMemo(() => {
    return {
      all: historyBookings.length,
      completed: historyBookings.filter((b) => b.status.toLowerCase() === "completed").length,
      cancelled: historyBookings.filter((b) => b.status.toLowerCase() === "cancelled").length,
      expired: historyBookings.filter((b) => b.status.toLowerCase() === "expired").length,
    };
  }, [historyBookings]);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121010] p-3 rounded-xl border border-[#222] shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("all"); setPage(1); }}
            className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
              filter === "all"
                ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>All History</span>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 font-extrabold ${
                filter === "all"
                  ? "bg-white text-black"
                  : "bg-[#222] text-gray-400 border border-[#333]"
              }`}
            >
              {counts.all}
            </Badge>
          </Button>

          <Button
            variant={filter === "completed" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("completed"); setPage(1); }}
            className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
              filter === "completed"
                ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Completed</span>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 font-extrabold ${
                filter === "completed"
                  ? "bg-white text-black"
                  : "bg-[#222] text-gray-400 border border-[#333]"
              }`}
            >
              {counts.completed}
            </Badge>
          </Button>

          <Button
            variant={filter === "cancelled" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("cancelled"); setPage(1); }}
            className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
              filter === "cancelled"
                ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
            }`}
          >
            <XCircle className="h-3.5 w-3.5 text-red-400" />
            <span>Cancelled</span>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 font-extrabold ${
                filter === "cancelled"
                  ? "bg-white text-black"
                  : "bg-[#222] text-gray-400 border border-[#333]"
              }`}
            >
              {counts.cancelled}
            </Badge>
          </Button>

          <Button
            variant={filter === "expired" ? "default" : "ghost"}
            size="sm"
            onClick={() => { setFilter("expired"); setPage(1); }}
            className={`text-[10px] h-8 font-bold gap-1.5 rounded uppercase tracking-wider transition-all ${
              filter === "expired"
                ? "bg-[#f03e65] text-white shadow hover:bg-[#d83558]"
                : "text-gray-400 hover:text-white hover:bg-[#1a1414]"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Expired</span>
            <Badge
              variant="secondary"
              className={`text-[9px] px-1.5 py-0 font-extrabold ${
                filter === "expired"
                  ? "bg-white text-black"
                  : "bg-[#222] text-gray-400 border border-[#333]"
              }`}
            >
              {counts.expired}
            </Badge>
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <Input
            placeholder="Search history records..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 text-xs h-9 bg-[#161212] border-[#333] text-white placeholder:text-gray-500 rounded focus-visible:ring-[#f03e65] focus-visible:border-[#f03e65]"
          />
        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner className="h-8 w-8 text-[#f03e65]" />
          <p className="text-[10px] text-gray-400 uppercase tracking-widest animate-pulse font-bold">Loading booking history...</p>
        </div>
      ) : paginatedBookings.length === 0 ? (
        <Card className="bg-[#121010] border-[#222] p-12 text-center rounded-xl shadow-lg">
          <History className="h-10 w-10 mx-auto mb-3 text-[#333] opacity-70" />
          <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">No history records</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No completed, cancelled, or expired bookings match your filter query.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBookings.map((b) => (
            <Card
              key={b.id}
              onClick={() => setSelectedBookingId(b.id)}
              className="bg-[#161212] hover:bg-[#1a1414] border border-[#333] hover:border-[#f03e65] transition-all cursor-pointer shadow-xl rounded-xl group"
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages} ({filteredBookings.length} items)
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
