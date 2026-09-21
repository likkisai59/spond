"use client";

import { BookingTimelineEvent } from "@/types/booking";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, MessageSquare } from "lucide-react";

interface BookingTimelineProps {
  events: BookingTimelineEvent[];
}

export function BookingTimeline({ events }: BookingTimelineProps) {
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "request_created":
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case "negotiation":
        return <MessageSquare className="h-5 w-5 text-blue-400" />;
      case "accepted":
      case "confirmed":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case "cancelled":
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const safeEvents = Array.isArray(events) ? events : [];
  const sortedEvents = [...safeEvents].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground">
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-border ml-3 space-y-6">
      {sortedEvents.map((ev, idx) => (
        <div key={ev.id || idx} className="relative">
          {/* Node Icon Indicator */}
          <span className="absolute -left-9.25 top-0 bg-card border border-border p-1 rounded-full flex items-center justify-center">
            {getIcon(ev.event_type)}
          </span>

          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-foreground tracking-tight capitalize">
                {ev.message}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(ev.created_at), "PPp")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span>Initiated by:</span>
              <span className="bg-accent border border-border px-1.5 py-0.5 rounded text-foreground capitalize text-[9px] font-semibold">
                {ev.created_by_role}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
