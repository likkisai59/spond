"use client";

import * as React from "react";
import { useArtistDashboard } from "@/hooks/use-artist-dashboard";
import { BookingRequestsWidget } from "@/components/artist/dashboard/BookingRequestsWidget";
import { ReviewsWidget } from "@/components/artist/dashboard/ReviewsWidget";
import { Spinner } from "@/components/ui/spinner";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp } from "lucide-react";

export default function ArtistAnalyticsPage() {
  const { data, loading, error, refetch } = useArtistDashboard();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading performance insights...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <ErrorState
          title="Insights Load Failure"
          message={error || "An unexpected error occurred while loading your insights."}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Performance Insights
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Detailed analytics on your profile views, booking requests, and client reviews.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="flex items-center gap-1.5 self-start sm:self-center text-xs h-9"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <BookingRequestsWidget requests={data.recent_booking_requests} />
        <ReviewsWidget reviews={data.recent_reviews} />
      </div>
    </div>
  );
}
